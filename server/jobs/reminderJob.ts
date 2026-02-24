import cron from 'node-cron';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { sendReminderEmail } from '../services/emailService.js';

/**
 * Finds tasks due in the next 24 hours that have reminders enabled
 * and haven't had a reminder sent yet, then emails the task owner.
 *
 * Runs every hour at :00.
 */
async function processReminders(): Promise<void> {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log(`[reminderJob] Running at ${now.toISOString()} — checking tasks due before ${in24h.toISOString()}`);

    try {
        // Find tasks that:
        //   1. have reminders enabled
        //   2. are not completed
        //   3. due date is within the next 24 hours (from now → now+24h)
        //   4. reminder has NOT been sent yet
        const tasks = await Task.find({
            reminders: true,
            status: { $ne: 'completed' },
            dueDate: { $gte: now, $lte: in24h },
            reminderSentAt: null,
        });

        if (tasks.length === 0) {
            console.log('[reminderJob] No pending reminders.');
            return;
        }

        console.log(`[reminderJob] Found ${tasks.length} task(s) to remind.`);

        for (const task of tasks) {
            try {
                // Fetch the task owner
                const owner = await User.findById(task.userId).select('name email');
                if (!owner) {
                    console.warn(`[reminderJob] Owner not found for task ${task._id} — skipping.`);
                    continue;
                }

                await sendReminderEmail({
                    toEmail: owner.email,
                    toName: owner.name.split(' ')[0],
                    taskTitle: task.title,
                    taskDescription: task.description,
                    priority: task.priority,
                    dueDate: task.dueDate!,
                });

                // Mark reminder as sent so we never send it twice
                task.reminderSentAt = new Date();
                await task.save();

                console.log(`[reminderJob] ✅ Reminded ${owner.email} for task "${task.title}"`);
            } catch (err) {
                // Don't let one failure block the others
                console.error(`[reminderJob] ❌ Failed for task ${task._id}:`, err);
            }
        }
    } catch (err) {
        console.error('[reminderJob] Fatal error during reminder processing:', err);
    }
}

/**
 * Starts the cron job. Call once at server startup.
 * Schedule: top of every hour  →  "0 * * * *"
 */
export function startReminderJob(): void {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('[reminderJob] ⚠️  GMAIL_USER / GMAIL_APP_PASSWORD not set — reminder emails are DISABLED.');
        return;
    }

    // Run immediately on startup (catches anything missed while server was down)
    processReminders();

    // Then run at the top of every hour
    cron.schedule('0 * * * *', processReminders, {
        timezone: 'UTC',
    });

    console.log('[reminderJob] ✅ Reminder cron job started (runs every hour).');
}
