import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, getAvatarUrl } from '@/src/hooks/useUser';
import {
    LayoutDashboard,
    CheckSquare,
    User,
    LogOut,
    Search,
    Plus,
    ChevronDown,
    Layers,
    Inbox,
    Sun,
    CalendarClock,
    CheckSquare2,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import CreateTaskModal from './CreateTaskModal';
import { authedFetch } from '@/src/lib/api';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
    const [activeTask, setActiveTask] = useState('Inbox');
    const [inboxCount, setInboxCount] = useState<number | null>(null);
    const [headerSearch, setHeaderSearch] = useState('');
    const user = useUser();
    const avatarUrl = user ? getAvatarUrl(user) : null;
    const displayName = user?.name ?? 'Account';

    // Set page title per route
    useEffect(() => {
        const titles: Record<string, string> = {
            '/dashboard': 'Dashboard — TaskFlow',
            '/tasks': 'Tasks — TaskFlow',
            '/profile': 'Profile — TaskFlow',
        };
        document.title = titles[location.pathname] ?? 'TaskFlow';
    }, [location.pathname]);

    // Close mobile sidebar on route change
    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    const fetchInboxCount = () => {
        authedFetch('/api/tasks/stats')
            .then((r) => r.json())
            .then((d) => { if (!d.error) setInboxCount(d.inbox); })
            .catch(() => { });
    };

    // Fetch live inbox count on mount and when tasks change
    useEffect(() => {
        fetchInboxCount();
        window.addEventListener('tasks:refresh', fetchInboxCount);
        return () => window.removeEventListener('tasks:refresh', fetchInboxCount);
    }, []);

    const taskSubItems = [
        { icon: <Inbox size={16} />, label: 'Inbox', tabId: 'inbox', count: inboxCount },
        { icon: <Sun size={16} />, label: 'Today', tabId: 'today' },
        { icon: <CalendarClock size={16} />, label: 'Upcoming', tabId: 'upcoming' },
        { icon: <CheckSquare2 size={16} />, label: 'Completed', tabId: 'completed' },
    ];

    const isTasksActive = location.pathname === '/tasks';

    // Header search — press Enter to navigate to /tasks?search=
    const handleHeaderSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && headerSearch.trim()) {
            navigate(`/tasks?search=${encodeURIComponent(headerSearch.trim())}`);
            setHeaderSearch('');
        }
    };

    // Sidebar content (shared by desktop + mobile drawer)
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                    <div className="bg-indigo-600 rounded-xl p-1.5 text-white">
                        <Layers size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">TaskFlow</span>
                </div>
                {/* Close button on mobile */}
                <button
                    className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {/* Dashboard */}
                <Link
                    to="/dashboard"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm',
                        location.pathname === '/dashboard'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                    )}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>

                {/* Tasks with sub-items */}
                <div>
                    <Link
                        to="/tasks"
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm',
                            isTasksActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        )}
                    >
                        <CheckSquare size={20} />
                        <span className="flex-1">Tasks</span>
                        <ChevronDown size={16} className="opacity-50" />
                    </Link>

                    {/* Sub items */}
                    <div className="ml-8 mt-1 space-y-0.5">
                        {taskSubItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setActiveTask(item.label);
                                    navigate(`/tasks?tab=${item.tabId}`);
                                }}
                                className={cn(
                                    'w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors text-xs font-medium text-left',
                                    activeTask === item.label && isTasksActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {item.icon}
                                    {item.label}
                                </span>
                                {'count' in item && (
                                    <span className={cn(
                                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                        activeTask === item.label && isTasksActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-indigo-100 text-indigo-600'
                                    )}>
                                        {item.count === null
                                            ? <span className="inline-block w-4 h-2 bg-current rounded animate-pulse opacity-40" />
                                            : item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Profile */}
                <Link
                    to="/profile"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm',
                        location.pathname === '/profile'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                    )}
                >
                    <User size={20} />
                    <span>Profile</span>
                </Link>
            </nav>

            {/* Bottom — Logout */}
            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={() => {
                        localStorage.removeItem('tf_token');
                        localStorage.removeItem('tf_user');
                        navigate('/login');
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 font-sans">

            {/* ── Desktop Sidebar (lg+) ─────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 h-screen">
                <SidebarContent />
            </aside>

            {/* ── Mobile Sidebar Drawer ─────────────────────────────────── */}
            {/* Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Drawer panel */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:hidden',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>

            {/* ── Main Content ──────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center gap-3 shrink-0">

                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Search bar — hidden on /tasks (that page has its own search) */}
                    <div className={cn('flex-1 max-w-md', location.pathname === '/tasks' && 'hidden')}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search tasks… (Enter)"
                                value={headerSearch}
                                onChange={(e) => setHeaderSearch(e.target.value)}
                                onKeyDown={handleHeaderSearch}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/50 placeholder:text-slate-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        {/* Add Task */}
                        <button
                            onClick={() => {
                                if (location.pathname !== '/tasks') navigate('/tasks');
                                setIsModalOpen(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm whitespace-nowrap"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Task</span>
                        </button>

                        <div className="hidden sm:block h-8 w-px bg-slate-200" />

                        {/* User avatar / name */}
                        <Link to="/profile" className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold leading-none">{displayName}</p>
                                <p className="text-xs text-slate-500 mt-1 truncate max-w-[120px]">{user?.email ?? ''}</p>
                            </div>
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-xs font-bold text-slate-500">
                                        {displayName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page content — no padding here; each page manages it */}
                <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>

            {/* Global Create Task Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={() => window.dispatchEvent(new Event('tasks:refresh'))}
            />
        </div>
    );
}
