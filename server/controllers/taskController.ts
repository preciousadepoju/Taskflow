import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Task } from '../models/Task.js';
import mongoose from 'mongoose';

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// ── GET /api/tasks ─────────────────────────────────────────────────────────────
// Query params:
//   tab      = inbox | today | upcoming | completed   (default: inbox)
//   priority = Low | Medium | High                    (optional filter)
//   search   = string                                 (optional)
export async function getTasks(req: AuthRequest, res: Response) {
    try {
        const { tab = 'inbox', priority, search } = req.query as Record<string, string>;
        const userId = req.userId!;
        const now = new Date();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = { userId };

        // Tab-based filtering
        switch (tab) {
            case 'today': {
                filter.dueDate = { $gte: startOfDay(now), $lte: endOfDay(now) };
                filter.status = { $ne: 'completed' };
                break;
            }
            case 'upcoming': {
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                filter.dueDate = { $gte: startOfDay(tomorrow) };
                filter.status = { $ne: 'completed' };
                break;
            }
            case 'completed': {
                filter.status = 'completed';
                break;
            }
            default: {
                // inbox — everything not completed
                filter.status = { $ne: 'completed' };
            }
        }

        if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
            filter.priority = priority;
        }

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });
        return res.json({ tasks });
    } catch (err) {
        console.error('[getTasks]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/tasks ────────────────────────────────────────────────────────────
export async function createTask(req: AuthRequest, res: Response) {
    try {
        const { title, description, priority, status, dueDate, reminders, category } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ error: 'Task title is required.' });
        }

        const task = await Task.create({
            userId: req.userId,
            title: title.trim(),
            description: description?.trim() ?? '',
            priority: priority ?? 'Medium',
            status: status ?? 'todo',
            category: category ?? 'None',
            order: Date.now(),
            dueDate: dueDate ? new Date(dueDate) : null,
            reminders: reminders ?? true,
        });

        return res.status(201).json({ task });
    } catch (err) {
        console.error('[createTask]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── GET /api/tasks/:id ─────────────────────────────────────────────────────────
export async function getTaskById(req: AuthRequest, res: Response) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }
        const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ error: 'Task not found.' });
        return res.json({ task });
    } catch (err) {
        console.error('[getTaskById]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── PUT /api/tasks/:id ─────────────────────────────────────────────────────────
export async function updateTask(req: AuthRequest, res: Response) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }

        const allowed = ['title', 'description', 'priority', 'status', 'dueDate', 'reminders', 'category'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {};

        for (const key of allowed) {
            if (key in req.body) {
                updates[key] = key === 'dueDate' && req.body[key]
                    ? new Date(req.body[key])
                    : req.body[key];
            }
        }

        if ('status' in updates) {
            if (updates.status === 'completed') {
                updates.completedAt = new Date();
            } else {
                updates.completedAt = null;
            }
        }

        // If the due date is being changed, reset reminderSentAt and reminderCount so the user
        // receives fresh reminder emails 24h before the updated due date.
        if ('dueDate' in updates) {
            updates.reminderSentAt = null;
            updates.reminderCount = 0;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Nothing to update.' });
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!task) return res.status(404).json({ error: 'Task not found.' });
        return res.json({ task });
    } catch (err) {
        console.error('[updateTask]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── PATCH /api/tasks/reorder ───────────────────────────────────────────────────
export async function reorderTasks(req: AuthRequest, res: Response) {
    try {
        const { tasks } = req.body;
        if (!Array.isArray(tasks)) {
            return res.status(400).json({ error: 'Expected an array of tasks.' });
        }

        const bulkOps = tasks.map((t) => ({
            updateOne: {
                filter: { _id: t.id, userId: req.userId },
                update: { $set: { order: t.order } },
            },
        }));

        if (bulkOps.length > 0) {
            await Task.bulkWrite(bulkOps);
        }

        return res.json({ message: 'Tasks reordered.' });
    } catch (err) {
        console.error('[reorderTasks]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── DELETE /api/tasks/:id ──────────────────────────────────────────────────────
export async function deleteTask(req: AuthRequest, res: Response) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ error: 'Task not found.' });
        return res.json({ message: 'Task deleted.' });
    } catch (err) {
        console.error('[deleteTask]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── PATCH /api/tasks/:id/complete ─────────────────────────────────────────────
export async function toggleComplete(req: AuthRequest, res: Response) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }
        const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ error: 'Task not found.' });

        task.status = task.status === 'completed' ? 'todo' : 'completed';
        if (task.status === 'completed') {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }
        await task.save();
        return res.json({ task });
    } catch (err) {
        console.error('[toggleComplete]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── GET /api/tasks/stats ───────────────────────────────────────────────────────
export async function getTaskStats(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const [total, completed, inProgress, inboxCount] = await Promise.all([
            Task.countDocuments({ userId }),
            Task.countDocuments({ userId, status: 'completed' }),
            Task.countDocuments({ userId, status: 'in_progress' }),
            Task.countDocuments({ userId, status: { $ne: 'completed' } }),
        ]);
        return res.json({ total, completed, inProgress, inbox: inboxCount });
    } catch (err) {
        console.error('[getTaskStats]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
