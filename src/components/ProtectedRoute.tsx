import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps a route so that unauthenticated users are redirected to /login.
 * Authentication is determined by the presence of tf_token in localStorage.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('tf_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
