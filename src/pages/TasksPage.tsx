import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  X,
  ChevronRight,
  Loader2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import CreateTaskModal from '../components/CreateTaskModal';
import ConfirmModal from '../components/ConfirmModal';
import { authedFetch, Task, TabId } from '@/src/lib/api';
import { useUser } from '@/src/hooks/useUser';
import confetti from 'canvas-confetti';

// ── Priority colours ──────────────────────────────────────────────────────────
const PRIORITY_COLOURS: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-700',
};
const PRIORITY_DOT: Record<string, string> = {
  High: 'bg-red-500',
  Medium: 'bg-amber-400',
  Low: 'bg-slate-400',
};

// ── Due date helpers ──────────────────────────────────────────────────────────
function formatDue(iso: string | null): { label: string; color: string } {
  if (!iso) return { label: 'No date', color: 'text-slate-400' };
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (due.getTime() - today.getTime()) / 86_400_000;
  if (diff < 0) return { label: 'Overdue', color: 'text-red-500' };
  if (diff === 0) return { label: 'Today', color: 'text-red-500' };
  if (diff === 1) return { label: 'Tomorrow', color: 'text-amber-500' };
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    color: 'text-slate-500',
  };
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function TasksPage() {
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab driven by URL ?tab= param (defaults to 'inbox')
  const urlTab = (searchParams.get('tab') ?? 'inbox') as TabId;
  const [tab, setTab] = useState<TabId>(urlTab);

  // Keep URL in sync when tab changes internally
  const switchTab = (t: TabId) => {
    setTab(t);
    setSearchParams({ tab: t }, { replace: true });
  };

  // Sync if URL param changes externally (e.g. sidebar click)
  useEffect(() => {
    if (urlTab !== tab) setTab(urlTab);
  }, [urlTab]);

  // Page title
  useEffect(() => {
    const label = TABS.find((t) => t.id === tab)?.label ?? 'Tasks';
    document.title = `${label} — TaskFlow`;
    return () => { document.title = 'TaskFlow'; };
  }, [tab]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Initialise search from URL ?search= param (set by header search)
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // If URL ?search= changes (e.g. header navigation), sync it
  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  // ── Fetch tasks ───────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ tab });
      if (search) params.set('search', search);
      const res = await authedFetch(`/api/tasks?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to load tasks.'); return; }
      setTasks(data.tasks);
      // Keep selected panel in sync
      if (selectedTask) {
        const refreshed = data.tasks.find((t: Task) => t._id === selectedTask._id);
        setSelectedTask(refreshed ?? null);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Listen for the global 'tasks:refresh' event fired by the header Add Task modal
  useEffect(() => {
    const handler = () => fetchTasks();
    window.addEventListener('tasks:refresh', handler);
    return () => window.removeEventListener('tasks:refresh', handler);
  }, [fetchTasks]);

  // ── Toggle complete ───────────────────────────────────────────────────────
  const handleToggleComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCompleting = task.status !== 'completed';

    // Optimistic update
    if ((tab !== 'completed' && isCompleting) || (tab === 'completed' && !isCompleting)) {
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } else {
      setTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, status: isCompleting ? 'completed' : 'todo' } : t));
    }

    const res = await authedFetch(`/api/tasks/${task._id}/complete`, { method: 'PATCH' });
    if (res.ok) {
      if (isCompleting) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      window.dispatchEvent(new Event('tasks:refresh'));
      fetchTasks();
    } else {
      fetchTasks(); // Request failed, revert optimistic UI
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(id);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    const res = await authedFetch(`/api/tasks/${taskToDelete}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedTask?._id === taskToDelete) setSelectedTask(null);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete));
      window.dispatchEvent(new Event('tasks:refresh'));
      fetchTasks();
    }
    setIsDeleting(false);
    setTaskToDelete(null);
  };

  // ── Mark complete from detail panel ──────────────────────────────────────
  const handleMarkComplete = async () => {
    if (!selectedTask) return;
    const isCompleting = selectedTask.status !== 'completed';

    // Optimistic UI updates
    const updatedTask = { ...selectedTask, status: isCompleting ? 'completed' : 'todo' } as Task;
    setSelectedTask(updatedTask);

    if ((tab !== 'completed' && isCompleting) || (tab === 'completed' && !isCompleting)) {
      setTasks((prev) => prev.filter((t) => t._id !== selectedTask._id));
    } else {
      setTasks((prev) => prev.map((t) => t._id === selectedTask._id ? updatedTask : t));
    }

    const res = await authedFetch(`/api/tasks/${selectedTask._id}/complete`, { method: 'PATCH' });
    if (res.ok) {
      if (isCompleting) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      window.dispatchEvent(new Event('tasks:refresh'));
      fetchTasks();
    } else {
      fetchTasks(); // Error occurred, let's revert
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

      {/* ── Task List ─────────────────────────────────────────────── */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 bg-white',
        selectedTask && 'hidden md:flex'
      )}>
        {/* Header */}
        <header className="border-b border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold shrink-0">Task List</h2>
              <div className="relative flex items-center bg-slate-100 rounded-lg px-3 py-1.5 gap-2 border border-slate-200 flex-1 min-w-0 max-w-xs">
                <Search className="text-slate-500 size-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 placeholder:text-slate-500 outline-none"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => { setEditTask(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all shrink-0"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>

          {/* Tab bar — scrollable on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap',
                  tab === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* Task content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
              <Loader2 className="animate-spin size-5" /> Loading tasks…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48 text-red-500 gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
              <CheckCircle2 size={36} className="text-slate-300" />
              <p className="text-sm font-medium">
                {tab === 'completed' ? 'No completed tasks yet.' : 'No tasks here. Create one!'}
              </p>
              {tab !== 'completed' && (
                <button
                  onClick={() => { setEditTask(null); setIsModalOpen(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={15} /> New Task
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── Desktop table (md+) ── */}
              <table className="hidden md:table w-full border-collapse">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                  <tr>
                    <th className="w-14 px-6 py-3 text-left" />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => {
                    const due = formatDue(task.dueDate);
                    const done = task.status === 'completed';
                    const isSelected = selectedTask?._id === task._id;
                    return (
                      <tr
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          'group hover:bg-slate-50 cursor-pointer transition-colors',
                          done && 'opacity-50',
                          isSelected && 'bg-indigo-50/40'
                        )}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleToggleComplete(task, e)}
                            className={cn("transition-colors", done ? "text-emerald-500" : "text-slate-300 hover:text-indigo-500")}
                            title={done ? 'Mark todo' : 'Mark complete'}
                          >
                            {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                            <p className={cn('text-sm font-medium text-slate-900', done && 'line-through')}>{task.title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', PRIORITY_COLOURS[task.priority])}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className={cn('text-xs font-medium', due.color)}>{due.label}</p>
                        </td>
                        <td className="px-4 py-4 text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                            onClick={(e) => { e.stopPropagation(); setEditTask(task); setIsModalOpen(true); }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                            title="Delete"
                            onClick={(e) => handleDelete(task._id, e)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ── Mobile card list ── */}
              <div className="md:hidden divide-y divide-slate-100">
                {tasks.map((task) => {
                  const due = formatDue(task.dueDate);
                  const done = task.status === 'completed';
                  return (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        'flex items-start gap-3 px-4 py-4 cursor-pointer active:bg-slate-50',
                        done && 'opacity-50'
                      )}
                    >
                      <button
                        onClick={(e) => handleToggleComplete(task, e)}
                        className={cn("mt-0.5 transition-colors shrink-0", done ? "text-emerald-500" : "text-slate-300 hover:text-indigo-500")}
                      >
                        {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium text-slate-900 truncate', done && 'line-through')}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', PRIORITY_COLOURS[task.priority])}>
                            {task.priority}
                          </span>
                          <span className={cn('text-xs font-medium', due.color)}>{due.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setEditTask(task); setIsModalOpen(true); }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          onClick={(e) => handleDelete(task._id, e)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold">{tasks.length}</span> task{tasks.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={fetchTasks}
            className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={12} /> Refresh
          </button>
        </footer>
      </div>

      {/* ── Detail Side Panel — mobile bottom sheet / desktop right sidebar ── */}
      {selectedTask && (
        <>
          {/* Mobile scrim */}
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 md:hidden"
            onClick={() => setSelectedTask(null)}
          />
          <aside className={cn(
            'bg-white border-slate-200 flex flex-col overflow-y-auto',
            // Mobile: fixed bottom sheet
            'fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl border-t max-h-[85vh]',
            // Desktop: right panel
            'md:static md:w-[380px] lg:w-[400px] md:border-l md:border-t-0 md:rounded-none md:z-auto md:max-h-none md:h-full md:shrink-0'
          )}>
            {/* Panel header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <button
                onClick={handleMarkComplete}
                className={cn(
                  'flex items-center gap-2 text-sm font-bold transition-colors',
                  selectedTask.status === 'completed'
                    ? 'text-emerald-600 hover:text-slate-500'
                    : 'text-indigo-600 hover:text-indigo-700'
                )}
              >
                <CheckCircle2 size={18} />
                {selectedTask.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <div className="flex items-center gap-3">
                <button
                  title="Edit task"
                  onClick={() => { setEditTask(selectedTask); setIsModalOpen(true); }}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button onClick={() => setSelectedTask(null)}>
                  <X className="text-slate-400 hover:text-slate-600 size-[18px]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title + meta */}
              <section>
                <h3 className={cn('text-xl font-bold mb-4', selectedTask.status === 'completed' && 'line-through text-slate-400')}>
                  {selectedTask.title}
                </h3>
                <div className="space-y-3">
                  <DetailRow label="Assignee">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {user?.name?.charAt(0).toUpperCase() ?? 'ME'}
                      </div>
                      <span className="text-sm font-medium">{user?.name ?? 'Me'}</span>
                    </div>
                  </DetailRow>
                  <DetailRow label="Due Date">
                    <div className={cn('flex items-center gap-2 text-sm font-medium', formatDue(selectedTask.dueDate).color)}>
                      <Calendar size={16} />
                      <span>
                        {selectedTask.dueDate
                          ? new Date(selectedTask.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'No date'}
                      </span>
                    </div>
                  </DetailRow>
                  <DetailRow label="Priority">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', PRIORITY_COLOURS[selectedTask.priority])}>
                      {selectedTask.priority}
                    </span>
                  </DetailRow>
                  <DetailRow label="Status">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      selectedTask.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        selectedTask.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                    )}>
                      {selectedTask.status === 'in_progress' ? 'In Progress' :
                        selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                    </span>
                  </DetailRow>
                  {selectedTask.status === 'completed' && selectedTask.completedAt && (
                    <DetailRow label="Completed">
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <CheckCircle2 size={16} />
                        <span>
                          {new Date(selectedTask.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedTask.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </DetailRow>
                  )}
                </div>
              </section>

              {/* Description */}
              {selectedTask.description && (
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</h4>
                  <div className="p-4 bg-slate-50 rounded-lg text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                    {selectedTask.description}
                  </div>
                </section>
              )}
            </div>

            <div className="p-5 border-t border-slate-100">
              <div className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                selectedTask.reminders
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              )}>
                <span className={cn('h-2 w-2 rounded-full', selectedTask.reminders ? 'bg-indigo-500' : 'bg-slate-400')} />
                {selectedTask.reminders ? 'Email reminder enabled — 24h before due' : 'No reminder set'}
              </div>
            </div>
          </aside>
        </>
      )}

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTask(null); }}
        editTask={editTask}
        onSaved={fetchTasks}
      />

      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6">
      <span className="w-20 text-sm text-slate-500 shrink-0">{label}</span>
      {children}
    </div>
  );
}
