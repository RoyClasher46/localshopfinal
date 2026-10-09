import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8F4E9]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#DDE4E2] border-t-[#FF8C00]" />

          <p className="text-sm font-medium text-[#64748B]">Loading...</p>
        </div>
      </div>
    );
  }

  //--->>> NOT AUTHENTICATED

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  //--->>> AUTHENTICATED

  return <Outlet />;
}

export default ProtectedRoute;
