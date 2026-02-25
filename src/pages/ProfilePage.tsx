import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
    Mail,
    Trash2,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Loader2,
    ShieldAlert,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useUser, getAvatarUrl, AuthUser } from '@/src/hooks/useUser';

// Helper — always sends Authorization: Bearer <token>
async function authedFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('tf_token') ?? '';
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers ?? {}),
        },
    });
}

export default function ProfilePage() {
    const storedUser = useUser();
    const navigate = useNavigate();

    // ── Profile form state ──────────────────────────────────────────────────
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [profileMsg, setProfileMsg] = useState('');

    // ── Password form state ─────────────────────────────────────────────────
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdStatus, setPwdStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [pwdMsg, setPwdMsg] = useState('');

    // ── Avatar ──────────────────────────────────────────────────────────────
    const [liveUser, setLiveUser] = useState<AuthUser | null>(storedUser);
    const avatarUrl = liveUser ? getAvatarUrl(liveUser) : null;

    // ── Delete account state ────────────────────────────────────────────────
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [deleteError, setDeleteError] = useState('');

    // Seed form with stored user on mount
    useEffect(() => {
        if (storedUser) {
            const parts = storedUser.name.trim().split(' ');
            setFirstName(parts[0] ?? '');
            setLastName(parts.slice(1).join(' '));
            setEmail(storedUser.email);
            setLiveUser(storedUser);
        }
    }, []);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileStatus('loading');
        setProfileMsg('');

        const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
        try {
            const res = await authedFetch('/api/user/me', {
                method: 'PUT',
                body: JSON.stringify({ name: fullName, email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setProfileStatus('error');
                setProfileMsg(data.error ?? 'Failed to save changes.');
                return;
            }
            // Sync localStorage so the rest of the dashboard updates immediately
            const updated: AuthUser = { id: data.user.id, name: data.user.name, email: data.user.email };
            localStorage.setItem('tf_user', JSON.stringify(updated));
            setLiveUser(updated);
            setProfileStatus('success');
            setProfileMsg('Profile updated successfully!');
        } catch {
            setProfileStatus('error');
            setProfileMsg('Could not reach the server. Please try again.');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdStatus('loading');
        setPwdMsg('');

        if (newPwd !== confirmPwd) {
            setPwdStatus('error');
            setPwdMsg('New passwords do not match.');
            return;
        }
        if (newPwd.length < 8) {
            setPwdStatus('error');
            setPwdMsg('New password must be at least 8 characters.');
            return;
        }

        try {
            const res = await authedFetch('/api/user/password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPwdStatus('error');
                setPwdMsg(data.error ?? 'Failed to change password.');
                return;
            }
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
            setPwdStatus('success');
            setPwdMsg('Password changed successfully!');
        } catch {
            setPwdStatus('error');
            setPwdMsg('Could not reach the server. Please try again.');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setDeleteStatus('loading');
        setDeleteError('');
        try {
            const res = await authedFetch('/api/user/me', { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setDeleteStatus('error');
                setDeleteError(data.error ?? 'Failed to delete account.');
                return;
            }
            localStorage.removeItem('tf_token');
            localStorage.removeItem('tf_user');
            navigate('/login');
        } catch {
            setDeleteStatus('error');
            setDeleteError('Could not reach the server. Please try again.');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-12 pb-16 px-1 sm:px-0">

                {/* ── Profile Information ───────────────────────────────────── */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Profile Information</h2>
                        <p className="text-slate-500 mt-1 text-sm">Update your photo and personal details here.</p>
                    </div>

                    <form onSubmit={handleProfileSave}>
                        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 mb-6">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                                            {firstName.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form fields */}
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <Mail size={13} className="text-slate-400" /> Email Address
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feedback */}
                        <StatusBanner status={profileStatus} message={profileMsg} />

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={profileStatus === 'loading'}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm flex items-center gap-2"
                            >
                                {profileStatus === 'loading' && <Loader2 size={15} className="animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </section>

                <hr className="border-slate-200" />

                {/* ── Security ──────────────────────────────────────────────── */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Security</h2>
                        <p className="text-slate-500 mt-1 text-sm">Manage your password and account security settings.</p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <PasswordField
                            label="Current Password"
                            value={currentPwd}
                            onChange={setCurrentPwd}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <PasswordField
                                label="New Password"
                                value={newPwd}
                                onChange={setNewPwd}
                            />
                            <PasswordField
                                label="Confirm New Password"
                                value={confirmPwd}
                                onChange={setConfirmPwd}
                            />
                        </div>

                        {/* Feedback */}
                        <StatusBanner status={pwdStatus} message={pwdMsg} />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={pwdStatus === 'loading'}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm flex items-center gap-2"
                            >
                                {pwdStatus === 'loading' && <Loader2 size={15} className="animate-spin" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </section>

                <hr className="border-slate-200" />

                {/* ── Danger Zone ─────────────────────────────────────────── */}
                <section className="space-y-4 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-50 rounded-lg shrink-0">
                            <ShieldAlert size={18} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-600">Danger Zone</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Permanently delete your account and all task data. This cannot be undone.
                            </p>
                        </div>
                    </div>

                    {!showDeleteConfirm ? (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-5 py-2 border border-red-200 text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={15} />
                                Delete Account
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-4">
                            <p className="text-sm text-red-700 font-medium">
                                Type <span className="font-mono font-bold">DELETE</span> to confirm you want to permanently erase your account and all your tasks.
                            </p>
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder="Type DELETE here"
                                className="w-full rounded-lg border border-red-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-mono"
                            />
                            {deleteError && (
                                <div className="flex items-center gap-2 text-red-700 text-sm">
                                    <AlertCircle size={14} />
                                    {deleteError}
                                </div>
                            )}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteError(''); }}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteInput !== 'DELETE' || deleteStatus === 'loading'}
                                    className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    {deleteStatus === 'loading' && <Loader2 size={14} className="animate-spin" />}
                                    <Trash2 size={14} />
                                    Yes, Delete My Account
                                </button>
                            </div>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBanner({ status, message }: { status: string; message: string }) {
    if (!message) return null;
    const isSuccess = status === 'success';
    return (
        <div className={cn(
            'flex items-center gap-2 p-3 rounded-xl text-sm font-medium',
            isSuccess
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
        )}>
            {isSuccess ? <Check size={15} /> : <AlertCircle size={15} />}
            {message}
        </div>
    );
}

function PasswordField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

function PreferenceToggle({ icon, title, description, defaultChecked }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    defaultChecked?: boolean;
}) {
    const [checked, setChecked] = useState(defaultChecked ?? false);
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-slate-900 text-sm">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => setChecked(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0',
                    checked ? 'bg-indigo-600' : 'bg-slate-200'
                )}
            >
                <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    checked ? 'translate-x-6' : 'translate-x-1'
                )} />
            </button>
        </div>
    );
}
