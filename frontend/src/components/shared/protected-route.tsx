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
 * Redirects to the appropriate dashboard if user is already authenticated.
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
        const dashboardPath = useAuthStore.getState().getDashboardPath();
        return <Navigate to={dashboardPath} replace />;
    }

    return <Outlet />;
}

/**
 * AdminRoute — Wraps routes only accessible by admins.
 * Redirects others to their appropriate dashboard.
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
        const dashboardPath = useAuthStore.getState().getDashboardPath();
        return <Navigate to={dashboardPath} replace />;
    }

    return <Outlet />;
}

/**
 * LenderRoute — Wraps routes only accessible by lenders/vendeurs (and admins).
 */
export function LenderRoute() {
    const { isAuthenticated, isLoading, role, hasItems } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A] mx-auto mb-4" />
                    <p className="text-gray-500">Vérification...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    const isLender = role === "lender" || role === "vendeur" || hasItems;

    if (!isLender) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

/**
 * ClientRoute — Wraps routes only accessible by regular users.
 * Redirects admins and lenders to their respective dashboards.
 */
export function ClientRoute() {
    const { isAuthenticated, isLoading, role, hasItems } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A] mx-auto mb-4" />
                    <p className="text-gray-500">Vérification...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If the user is an admin or a lender, redirect them away from the client dashboard
    const isSpecialRole = role === "admin" || role === "lender" || role === "vendeur" || hasItems;

    if (isSpecialRole) {
        const dashboardPath = useAuthStore.getState().getDashboardPath();
        return <Navigate to={dashboardPath} replace />;
    }

    return <Outlet />;
}
