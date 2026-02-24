import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  Flag,
  Inbox,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useUser, getGreeting } from '@/src/hooks/useUser';
import { authedFetch, Task, TaskStats } from '@/src/lib/api';

// ── Priority display helpers ──────────────────────────────────────────────────
const PRIORITY_COLOURS: Record<string, string> = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-emerald-100 text-emerald-800',
};
const PRIORITY_DOT: Record<string, string> = {
  High: 'bg-red-500',
  Medium: 'bg-amber-400',
  Low: 'bg-emerald-500',
};

function formatDueShort(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (due.getTime() - today.getTime()) / 86_400_000;
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDueColor(iso: string | null): string {
  if (!iso) return 'text-slate-400';
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - today.getTime()) / 86_400_000;
  if (diff < 0 || diff === 0) return 'text-red-500';
  if (diff === 1) return 'text-amber-500';
  return 'text-slate-500';
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const user = useUser();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const greeting = getGreeting();

  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [tasksError, setTasksError] = useState('');

  useEffect(() => {
    // Fetch stats
    authedFetch('/api/tasks/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setStatsError(d.error);
        else setStats(d);
      })
      .catch(() => setStatsError('Failed to load stats.'))
      .finally(() => setStatsLoading(false));

    // Fetch 5 most recent inbox tasks
    authedFetch('/api/tasks?tab=inbox')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setTasksError(d.error);
        else setRecentTasks(d.tasks.slice(0, 5));
      })
      .catch(() => setTasksError('Failed to load tasks.'))
      .finally(() => setTasksLoading(false));
  }, []);

  // Priority breakdown from recent tasks
  const highCount = recentTasks.filter((t) => t.priority === 'High').length;
  const medCount = recentTasks.filter((t) => t.priority === 'Medium').length;
  const lowCount = recentTasks.filter((t) => t.priority === 'Low').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Welcome ──────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {firstName}! 👋</h1>
          <p className="text-slate-500">Here's what's happening with your tasks today.</p>
        </div>

        {/* ── Stats Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<ClipboardList className="text-indigo-600" />}
            label="Total Tasks"
            value={statsLoading ? null : (stats?.total ?? 0)}
            trend={stats && stats.inbox > 0 ? `${stats.inbox} active` : undefined}
            trendColor="text-indigo-600 bg-indigo-50"
            loading={statsLoading}
            error={statsError}
          />
          <StatCard
            icon={<CheckCircle2 className="text-emerald-600" />}
            label="Completed"
            value={statsLoading ? null : (stats?.completed ?? 0)}
            trend={stats && stats.total > 0
              ? `${Math.round((stats.completed / stats.total) * 100)}% done`
              : undefined}
            trendColor="text-emerald-600 bg-emerald-50"
            loading={statsLoading}
            error={statsError}
          />
          <StatCard
            icon={<Clock className="text-amber-500" />}
            label="In Progress"
            value={statsLoading ? null : (stats?.inProgress ?? 0)}
            loading={statsLoading}
            error={statsError}
          />
        </div>

        {/* ── Recent Tasks ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Tasks</h2>
            <Link to="/tasks" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-slate-400">
              <Loader2 className="animate-spin size-4" /> Loading tasks…
            </div>
          ) : tasksError ? (
            <div className="flex items-center justify-center h-32 gap-2 text-red-500">
              <AlertCircle size={16} /> {tasksError}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3 text-slate-400">
              <Inbox size={30} className="text-slate-300" />
              <p className="text-sm">No active tasks. Create your first one!</p>
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus size={13} /> New Task
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => navigate('/tasks')}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                          <span className="font-medium text-sm text-slate-900 truncate max-w-xs">{task.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium', PRIORITY_COLOURS[task.priority])}>
                          {task.priority}
                        </span>
                      </td>
                      <td className={cn('px-6 py-4 text-sm font-medium', formatDueColor(task.dueDate))}>
                        {formatDueShort(task.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Priority Breakdown ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
          <PriorityCard
            icon={<Flag className="text-red-500" size={20} />}
            label="High Priority"
            count={highCount}
            total={recentTasks.length}
            barColor="bg-red-500"
            bgColor="bg-red-50"
            loading={tasksLoading}
          />
          <PriorityCard
            icon={<Flag className="text-amber-500" size={20} />}
            label="Medium Priority"
            count={medCount}
            total={recentTasks.length}
            barColor="bg-amber-400"
            bgColor="bg-amber-50"
            loading={tasksLoading}
          />
          <PriorityCard
            icon={<Flag className="text-emerald-500" size={20} />}
            label="Low Priority"
            count={lowCount}
            total={recentTasks.length}
            barColor="bg-emerald-500"
            bgColor="bg-emerald-50"
            loading={tasksLoading}
          />
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, trend, trendColor, loading, error,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  trend?: string;
  trendColor?: string;
  loading: boolean;
  error: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-slate-50">{icon}</div>
        {trend && !loading && !error && (
          <span className={cn('text-xs font-medium px-2 py-1 rounded-full', trendColor)}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      {loading ? (
        <div className="h-9 w-12 bg-slate-100 rounded-lg animate-pulse mt-1" />
      ) : error ? (
        <p className="text-red-400 text-xs mt-1">—</p>
      ) : (
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
      )}
    </div>
  );
}



function PriorityCard({
  icon, label, count, total, barColor, bgColor, loading,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  barColor: string;
  bgColor: string;
  loading: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Link to="/tasks" className={cn('p-6 rounded-xl flex flex-col gap-4 hover:shadow-md transition-all border border-slate-200 bg-white')}>
      <div className="flex items-center justify-between">
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', bgColor)}>
          {icon}
        </div>
        {loading ? (
          <div className="h-7 w-8 bg-slate-100 rounded animate-pulse" />
        ) : (
          <span className="text-2xl font-bold text-slate-900">{count}</span>
        )}
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm mb-2">{label}</p>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className={cn('h-1.5 rounded-full transition-all duration-500', barColor)}
            style={{ width: loading ? '0%' : `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{loading ? '…' : `${pct}% of active tasks`}</p>
      </div>
    </Link>
  );
}
