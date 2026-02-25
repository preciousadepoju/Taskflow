import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { API_BASE } from '@/src/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();

            if (!res.ok) {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
                return;
            }

            setStatus('success');
            setMessage(data.message || 'If that email exists, a reset link was sent.');
        } catch {
            setStatus('error');
            setMessage('Could not connect to the server. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="text-center mb-8 gap-2 flex flex-col items-center">
                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mb-2">
                        <Mail size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
                    <p className="text-slate-500 text-sm">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center space-y-6 flex flex-col items-center">
                        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
                            <CheckCircle2 size={18} className="shrink-0" />
                            {message}
                        </div>
                        <Link to="/login" className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors text-sm">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="you@company.com"
                            />
                        </div>

                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                <AlertCircle size={16} className="shrink-0" />
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                        </button>

                        <div className="text-center pt-2">
                            <Link to="/login" className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                                <ArrowLeft size={14} /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
