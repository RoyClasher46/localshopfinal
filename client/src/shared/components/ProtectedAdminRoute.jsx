import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

function ProtectedAdminRoute() {
  const { admin, adminToken, isAdminAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
          <div className="text-sm font-medium tracking-wide text-slate-400">
            Verifying Super Admin clearance...
          </div>
        </div>
      </div>
    );
  }

  const isAuthorized =
    Boolean(adminToken) &&
    Boolean(admin) &&
    Boolean(isAdminAuthenticated) &&
    admin.email === "admin@gmail.com";

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
