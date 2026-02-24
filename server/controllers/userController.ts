import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { AuthRequest } from '../middleware/auth.js';

// ── GET /api/user/me ─────────────────────────────────────────────────────────
export async function getMe(req: AuthRequest, res: Response) {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error('[getMe]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── PUT /api/user/me ──────────────────────────────────────────────────────────
export async function updateMe(req: AuthRequest, res: Response) {
    try {
        const { name, email } = req.body;

        if (!name && !email) {
            return res.status(400).json({ error: 'Nothing to update.' });
        }

        const updates: Record<string, string> = {};

        if (name) {
            const trimmed = name.trim();
            if (trimmed.length < 2) {
                return res.status(400).json({ error: 'Name must be at least 2 characters.' });
            }
            updates.name = trimmed;
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email address.' });
            }
            // Check no other account uses this email
            const existing = await User.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: req.userId },
            });
            if (existing) {
                return res.status(409).json({ error: 'This email is already in use.' });
            }
            updates.email = email.toLowerCase().trim();
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.json({
            message: 'Profile updated successfully.',
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error('[updateMe]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── PUT /api/user/password ────────────────────────────────────────────────────
export async function changePassword(req: AuthRequest, res: Response) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('[changePassword]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── DELETE /api/user/me ───────────────────────────────────────────────────────
// Permanently removes the user account AND every task they own.
export async function deleteMe(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;

        // Delete all tasks owned by this user first
        await Task.deleteMany({ userId });

        // Then delete the user document
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.status(204).send();
    } catch (err) {
        console.error('[deleteMe]', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
