import React from 'react';
import { motion } from 'motion/react';
import { Zap, Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const perks = [
    'Free 14-day trial, no credit card required',
    'Unlimited tasks and projects',
    'Invite your team instantly',
];

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
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
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.');
                return;
            }
            // Persist token
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
                        <Zap className="text-white size-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</span>
                </Link>
                <p className="text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                        Sign in
                    </Link>
                </p>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left panel — perks */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="hidden lg:block"
                    >
                        <div className="mb-8">
                            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                                Get started free
                            </span>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4">
                                Your team's productivity, <span className="text-indigo-600">supercharged.</span>
                            </h2>
                            <p className="text-slate-500 leading-relaxed">
                                Join 10,000+ teams who use TaskFlow to stay organized, aligned, and on track — every single day.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {perks.map((perk) => (
                                <li key={perk} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="size-4 text-indigo-600" />
                                    </div>
                                    {perk}
                                </li>
                            ))}
                        </ul>

                        {/* Decorative card */}
                        <div className="relative rounded-2xl bg-indigo-600 p-6 overflow-hidden shadow-xl shadow-indigo-200">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 size-24 bg-indigo-900/20 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <User className="size-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="h-2.5 w-24 bg-white/60 rounded-full mb-1.5" />
                                        <div className="h-2 w-16 bg-white/30 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2.5 w-full bg-white/20 rounded-full" />
                                    <div className="h-2.5 w-4/5 bg-white/20 rounded-full" />
                                    <div className="h-2.5 w-3/5 bg-white/20 rounded-full" />
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <div className="h-7 w-20 bg-white/30 rounded-lg" />
                                    <div className="h-7 w-14 bg-white/10 rounded-lg border border-white/20" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right panel — form */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full"
                    >
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-8">
                            {/* Heading */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-slate-900 mb-2">Create your account</h1>
                                <p className="text-slate-500 text-sm">Start your 14-day free trial today.</p>
                            </div>

                            {/* Social Login */}
                            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all mb-6">
                                <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-xs text-slate-400 font-medium">or sign up with email</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label htmlFor="signup-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Full name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <input
                                            id="signup-name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            placeholder="Jane Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-[#f6f6f8] text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Work email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <input
                                            id="signup-email"
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
                                    <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <input
                                            id="signup-password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            required
                                            minLength={8}
                                            placeholder="Min. 8 characters"
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

                                    {/* Password strength bar */}
                                    {password.length > 0 && (
                                        <div className="mt-2 flex gap-1.5">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${password.length >= (i + 1) * 2
                                                        ? password.length >= 10
                                                            ? 'bg-emerald-400'
                                                            : password.length >= 6
                                                                ? 'bg-amber-400'
                                                                : 'bg-red-400'
                                                        : 'bg-slate-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
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
                                    id="signup-submit-btn"
                                    className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin size-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Creating account…
                                        </>
                                    ) : (
                                        <>
                                            Create free account <ArrowRight className="size-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer note */}
                        <p className="text-center text-xs text-slate-400 mt-6">
                            By signing up, you agree to our{' '}
                            <a href="#" className="underline hover:text-slate-600 transition-colors">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>.
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
