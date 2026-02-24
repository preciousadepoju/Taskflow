/** Shared fetch wrapper that attaches the Bearer token from localStorage.
 *  Automatically logs the user out and redirects to /login on a 401 response
 *  (expired or invalid token). */
export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('tf_token') ?? '';
    const response = await fetch(url, {
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
}

export interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    inbox: number;
}

export type TabId = 'inbox' | 'today' | 'upcoming' | 'completed';
