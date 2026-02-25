import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#f6f6f8] flex flex-col items-center justify-center p-8 font-sans">
            <div className="text-center max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="bg-indigo-600 rounded-xl p-2 text-white">
                        <Layers size={24} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</span>
                </div>

                {/* 404 */}
                <div className="text-[120px] font-black text-indigo-100 leading-none select-none mb-4">
                    404
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-3">Page not found</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Go back
                    </button>
                </div>
            </div>
        </div>
    );
}
