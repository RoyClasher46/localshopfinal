import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedSellerRoute() {
  const { seller, sellerToken, isSellerAuthenticated, loading } = useAuth();

  const location = useLocation();

  //-->>> WAIT FOR AUTH RESTORATION

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F4E9]">
        <div className="text-sm font-medium text-[#64748B]">
          Checking authorization...
        </div>
      </div>
    );
  }

  //--->>> EXPLICIT SELLER AUTH CHECK

  const hasSellerToken = Boolean(sellerToken);

  const hasSeller = Boolean(seller);

  const sellerAuthenticated =
    hasSellerToken && hasSeller && Boolean(isSellerAuthenticated);

  //--->>> NOT AUTHENTICATED AS SELLER

  if (!sellerAuthenticated) {
    return <Navigate to="/seller/login" replace state={{ from: location }} />;
  }

  //--->>> AUTHENTICATED SELLER

  return <Outlet />;
}

export default ProtectedSellerRoute;
