import React from 'react';
import { motion } from 'motion/react';
import { Layers, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '@/src/lib/api';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.');
                return;
            }
            // Persist token and user info
            localStorage.setItem('tf_token', data.token);
            localStorage.setItem('tf_user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f6f8] flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
            {/* Header */}
            <header className="w-full px-6 py-5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center">
                        <Layers className="text-white size-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</span>
                </Link>
                <p className="text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                        Sign up
                    </Link>
                </p>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-8">
                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h1>
                            <p className="text-slate-500 text-sm">Sign in to continue to your workspace.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-[#f6f6f8] text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="text-xs text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-[#f6f6f8] text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                id="login-submit-btn"
                                className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin size-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Sign in <ArrowRight className="size-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-xs text-slate-400 mt-6">
                        By signing in, you agree to our{' '}
                        <Link to="/" className="underline hover:text-slate-600 transition-colors">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/" className="underline hover:text-slate-600 transition-colors">Privacy Policy</Link>.
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
