import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth } from "./hooks/useAuth";

// Layouts
import MarketingLayout from "./components/layout/MarketingLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages — lazy-loaded for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const PlanningPage = lazy(() => import("./pages/PlanningPage"));
const LayersPage = lazy(() => import("./pages/LayersPage"));
const AlertDetailPage = lazy(() => import("./pages/AlertDetailPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const ScansPage = lazy(() => import("./pages/ScansPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Simple loading fallback
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0F172A] to-white">
            <div className="flex flex-col items-center gap-4">
                <div
                    className="w-12 h-12 rounded-full border-4 border-[#6366F1] border-t-transparent animate-spin"
                />
                <p className="text-[#E2E8F0] font-medium">Chargement…</p>
            </div>
        </div>
    );
}

// Protected route — redirects to /connexion if the user is not authenticated.
// Shows the loading spinner while the session is being restored on mount.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/connexion" replace />;
    }

    return <>{children}</>;
}

export function AppRouter() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Marketing / public routes */}
                <Route element={<MarketingLayout />}>
                    <Route path="/" element={<LandingPage />} />
                </Route>

                {/* Auth routes (no layout wrapper) */}
                <Route path="/connexion" element={<LoginPage />} />
                <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
                <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />

                {/* Dashboard routes (protected) — all share DashboardLayout */}
                <Route
                    path="/tableau-de-bord"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardPage />} />
                    <Route path="rapports" element={<ReportsPage />} />
                    <Route path="planification" element={<PlanningPage />} />
                    <Route path="calques" element={<LayersPage />} />
                    <Route path="alertes/:id" element={<AlertDetailPage />} />
                    <Route path="utilisateurs" element={<UsersPage />} />
                    <Route path="analyses" element={<ScansPage />} />
                    <Route path="profil" element={<ProfilePage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}
