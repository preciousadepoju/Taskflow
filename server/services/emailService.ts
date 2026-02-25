import nodemailer from 'nodemailer';

// ── Transport ─────────────────────────────────────────────────────────────────
// Uses Gmail SMTP with an App Password (no domain required).
// Generate one at: myaccount.google.com → Security → App Passwords
function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ── Payload contract ──────────────────────────────────────────────────────────
export interface ReminderEmailPayload {
  toEmail: string;
  toName: string;
  taskTitle: string;
  taskDescription: string;
  priority: string;
  dueDate: Date;
}

// ── HTML template ─────────────────────────────────────────────────────────────
function buildReminderHtml(p: ReminderEmailPayload): string {
  const dueDateStr = p.dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const priorityColour: Record<string, string> = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981',
  };
  const badgeBg: Record<string, string> = {
    High: '#fee2e2',
    Medium: '#fef3c7',
    Low: '#d1fae5',
  };
  const colour = priorityColour[p.priority] ?? '#6366f1';
  const bg = badgeBg[p.priority] ?? '#e0e7ff';
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Task Reminder – TaskFlow</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.07);overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#4f46e5;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">⚡ TaskFlow</span></td>
              <td align="right">
                <span style="background:rgba(255,255,255,0.18);color:#fff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">
                  Task Reminder
                </span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;color:#64748b;font-size:14px;">Hi ${p.toName},</p>
          <p style="margin:0 0 24px;color:#0f172a;font-size:18px;font-weight:700;line-height:1.4;">
            You have a task due tomorrow 📅
          </p>

          <!-- Task card -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Task</p>
                <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">${p.taskTitle}</p>
              </td>
            </tr>
            ${p.taskDescription ? `
            <tr>
              <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Description</p>
                <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${p.taskDescription}</p>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td>
                    <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Due Date</p>
                    <p style="margin:0;color:#0f172a;font-size:14px;font-weight:600;">📆 ${dueDateStr}</p>
                  </td>
                  <td align="right">
                    <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Priority</p>
                    <span style="background:${bg};color:${colour};font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px;">${p.priority}</span>
                  </td>
                </tr></table>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td align="center">
              <a href="${appUrl}/tasks"
                style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">
                View Task →
              </a>
            </td>
          </tr></table>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
              You're receiving this because you enabled reminders for this task.<br/>
              © ${new Date().getFullYear()} TaskFlow · Manage your tasks better.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function sendReminderEmail(payload: ReminderEmailPayload): Promise<void> {
  const transporter = createTransport();

  const info = await transporter.sendMail({
    from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
    to: payload.toEmail,
    subject: `⏰ Reminder: "${payload.taskTitle}" is due tomorrow`,
    html: buildReminderHtml(payload),
  });

  console.log(`[emailService] Reminder sent → ${payload.toEmail} | messageId: ${info.messageId}`);
}

export interface PasswordResetPayload {
  toEmail: string;
  toName: string;
  resetLink: string;
}

export async function sendPasswordResetEmail(payload: PasswordResetPayload): Promise<void> {
  const transporter = createTransport();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Reset Password – TaskFlow</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.07);overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#4f46e5;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">⚡ TaskFlow</span></td>
              <td align="right">
                <span style="background:rgba(255,255,255,0.18);color:#fff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">
                  Password Reset
                </span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;color:#64748b;font-size:14px;">Hi ${payload.toName},</p>
          <p style="margin:0 0 24px;color:#0f172a;font-size:18px;font-weight:700;line-height:1.4;">
            Forgot your password?
          </p>
          <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
            We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td align="center">
              <a href="${payload.resetLink}"
                style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">
                Reset Password →
              </a>
            </td>
          </tr></table>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </td></tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
              © ${new Date().getFullYear()} TaskFlow · Manage your tasks better.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
    to: payload.toEmail,
    subject: `🔒 Reset your TaskFlow password`,
    html,
  });

  console.log(`[emailService] Password reset sent → ${payload.toEmail} | messageId: ${info.messageId}`);
}
