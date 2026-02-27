import mongoose, { Schema, Document } from 'mongoose';

export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface ITask extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    priority: Priority;
    status: TaskStatus;
    category: string;
    order: number;
    dueDate: Date | null;
    reminders: boolean;
    reminderSentAt: Date | null;
    reminderCount: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        status: { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
        category: { type: String, default: 'None' },
        order: { type: Number, default: 0 },
        dueDate: { type: Date, default: null },
        reminders: { type: Boolean, default: true },
        reminderSentAt: { type: Date, default: null },
        reminderCount: { type: Number, default: 0 },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
