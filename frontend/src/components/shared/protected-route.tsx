import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/auth.store";
import { Loader2 } from "lucide-react";

/**
 * ProtectedRoute — Wraps routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A] mx-auto mb-4" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

/**
 * GuestRoute — Wraps routes only accessible when NOT logged in.
 * Redirects to /explore if user is already authenticated.
 */
export function GuestRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A] mx-auto mb-4" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/explore" replace />;
    }

    return <Outlet />;
}

/**
 * AdminRoute — Wraps routes only accessible by admins.
 * Redirects to /dashboard if user is not an admin.
 */
export function AdminRoute() {
    const { isAuthenticated, isLoading, role } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A] mx-auto mb-4" />
                    <p className="text-gray-500">Vérification des droits...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
