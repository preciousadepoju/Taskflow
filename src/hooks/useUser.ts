/**
 * useUser — reads the authenticated user from localStorage (set at login/signup).
 * Returns the user object plus a generated avatar URL and a greeting based on the time of day.
 */

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

/** Vibrant palette — one colour is picked deterministically from the user's id */
const AVATAR_COLOURS = [
    { bg: '#6366f1', fg: '#ffffff' }, // indigo
    { bg: '#8b5cf6', fg: '#ffffff' }, // violet
    { bg: '#ec4899', fg: '#ffffff' }, // pink
    { bg: '#f59e0b', fg: '#ffffff' }, // amber
    { bg: '#10b981', fg: '#ffffff' }, // emerald
    { bg: '#0ea5e9', fg: '#ffffff' }, // sky
    { bg: '#ef4444', fg: '#ffffff' }, // red
    { bg: '#f97316', fg: '#ffffff' }, // orange
];

/**
 * Returns stable initials from the user's name.
 * "Jane Doe" → "JD",  "Alice" → "A"
 */
function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Simple djb2-style hash so colour stays the same for the same user. */
function hashString(str: string): number {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = (h * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(h);
}

/**
 * Generates an inline SVG data URI avatar unique to this account.
 * No external network request — works offline, always instant.
 */
export function getAvatarUrl(user: AuthUser): string {
    const initials = getInitials(user.name || user.email);
    const seed = user.id || user.email;
    const { bg, fg } = AVATAR_COLOURS[hashString(seed) % AVATAR_COLOURS.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}" rx="50"/><text x="50" y="50" dominant-baseline="central" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="700" fill="${fg}" letter-spacing="1">${initials}</text></svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

export function useUser(): AuthUser | null {
    try {
        const raw = localStorage.getItem('tf_user');
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}
