// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const API_BASE = (import.meta as any).env.VITE_API_URL || ((import.meta as any).env.PROD ? 'https://taskflow-backend-q0wn.onrender.com' : '');

/** Shared fetch wrapper that attaches the Bearer token from localStorage.
 *  Automatically logs the user out and redirects to /login on a 401 response
 *  (expired or invalid token). */
export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('tf_token') ?? '';
    const fullUrl = url.startsWith('/api') ? `${API_BASE}${url}` : url;
    const response = await fetch(fullUrl, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers ?? {}),
        },
    });

    // Token expired or invalid — wipe session and redirect to login
    if (response.status === 401) {
        localStorage.removeItem('tf_token');
        localStorage.removeItem('tf_user');
        window.location.href = '/login';
    }

    return response;
}

export interface Task {
    _id: string;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'todo' | 'in_progress' | 'completed';
    dueDate: string | null;
    reminders: boolean;
    createdAt: string;
    completedAt: string | null;
}

export interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    inbox: number;
}

export type TabId = 'inbox' | 'today' | 'upcoming' | 'completed';
