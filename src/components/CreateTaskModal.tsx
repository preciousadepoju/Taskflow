import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authedFetch, Task } from '@/src/lib/api';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** If provided, the modal opens in edit mode */
    editTask?: Task | null;
    /** Called after a successful create or update so the list can refresh */
    onSaved?: () => void;
}

const EMPTY_FORM = { title: '', description: '', priority: 'Medium', status: 'todo', dueDate: '', reminders: true };

export default function CreateTaskModal({ isOpen, onClose, editTask, onSaved }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('todo');
    const [dueDate, setDueDate] = useState('');
    const [reminders, setReminders] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Seed form when editTask changes
    useEffect(() => {
        if (editTask) {
            setTitle(editTask.title);
            setDescription(editTask.description ?? '');
            setPriority(editTask.priority);
            setStatus(editTask.status === 'completed' ? 'todo' : editTask.status);
            setDueDate(editTask.dueDate ? editTask.dueDate.slice(0, 10) : '');
            setReminders(editTask.reminders);
        } else {
            resetForm();
        }
        setError('');
    }, [editTask, isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen]);

    function resetForm() {
        setTitle(EMPTY_FORM.title);
        setDescription(EMPTY_FORM.description);
        setPriority(EMPTY_FORM.priority);
        setStatus(EMPTY_FORM.status);
        setDueDate(EMPTY_FORM.dueDate);
        setReminders(EMPTY_FORM.reminders);
        setError('');
    }

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setIsLoading(true);
        setError('');

        const body = {
            title: title.trim(),
            description: description.trim(),
            priority,
            status,
            dueDate: dueDate || null,
            reminders,
        };

        try {
            const res = editTask
                ? await authedFetch(`/api/tasks/${editTask._id}`, { method: 'PUT', body: JSON.stringify(body) })
                : await authedFetch('/api/tasks', { method: 'POST', body: JSON.stringify(body) });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Failed to save task.');
                return;
            }
            onSaved?.();
            resetForm();
            onClose();
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = Boolean(editTask);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                        onClick={handleCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-5">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {isEdit ? 'Edit Task' : 'Create New Task'}
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="px-6 pb-6 space-y-5">
                                {/* Task Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Task Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="task-title-input"
                                        type="text"
                                        autoFocus
                                        placeholder="e.g., Design new landing page"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full border-0 border-b-2 border-slate-200 focus:border-indigo-500 bg-transparent text-slate-900 text-base placeholder:text-slate-400 focus:ring-0 pb-2 transition-colors outline-none"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Add more details here..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-200 bg-indigo-50/40 text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-3 resize-none transition-all outline-none"
                                    />
                                </div>

                                {/* Priority + Status + Due Date */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                                        <div className="relative">
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3 py-2.5 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                                        <div className="relative">
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3 py-2.5 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                                            >
                                                <option value="todo">To Do</option>
                                                <option value="in_progress">In Progress</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Send Reminders Toggle */}
                                <div className="flex items-center justify-between bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                            <Bell size={18} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Send Reminders</p>
                                            <p className="text-xs text-slate-500">Enable mobile and email reminders.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={reminders}
                                        onClick={() => setReminders(!reminders)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${reminders ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${reminders ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        id="save-task-btn"
                                        type="button"
                                        onClick={handleSave}
                                        disabled={!title.trim() || isLoading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {isLoading && <Loader2 size={15} className="animate-spin" />}
                                        <CheckCircle2 size={16} />
                                        {isEdit ? 'Update Task' : 'Save Task'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
