import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Clock, AlertTriangle } from "lucide-react";
import DashboardSidebar from "../../modules/dashboard/components/sidebar/DashboardSidebar";
import DashboardHeader from "../../modules/dashboard/components/header/DashboardHeader";

import RegisterShopModal from "../../modules/dashboard/pages/ShopInfo/components/RegisterShopModal";

import { sellerShopAPI } from "../../services/api";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const { seller } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  //--->> SHOP STATE

  const [shop, setShop] = useState(null);

  const [isCheckingShop, setIsCheckingShop] = useState(true);

  const [showRegisterShopModal, setShowRegisterShopModal] = useState(false);

  const [shopCheckError, setShopCheckError] = useState("");

  //-->>> CHECK SELLER SHOP

  useEffect(() => {
    let isMounted = true;

    const checkSellerShop = async () => {
      try {
        setIsCheckingShop(true);
        setShopCheckError("");

        const response = await sellerShopAPI.get();

        if (!isMounted) {
          return;
        }

        if (response.data?.success && response.data?.shop) {
          setShop(response.data.shop);

          setShowRegisterShopModal(false);

          return;
        }

        setShop(null);
        setShowRegisterShopModal(true);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Unable to check seller shop:", error);

        const status = error.response?.status;

        const message =
          error.response?.data?.message ||
          "Unable to load your shop information.";

        if (status === 404) {
          setShop(null);

          setShowRegisterShopModal(true);

          setShopCheckError("");

          return;
        }

        if (status === 401) {
          setShop(null);

          setShowRegisterShopModal(false);

          setShopCheckError(
            "Your seller session has expired. Please log in again.",
          );

          return;
        }

        if (status === 403) {
          setShop(null);

          setShowRegisterShopModal(false);

          setShopCheckError(
            "You are not authorized to access seller shop information.",
          );

          return;
        }

        setShop(null);

        setShowRegisterShopModal(false);

        setShopCheckError(message);
      } finally {
        if (isMounted) {
          setIsCheckingShop(false);
        }
      }
    };

    checkSellerShop();

    return () => {
      isMounted = false;
    };
  }, []);

  //--->>>> CREATE SHOP

  const createShop = async (formData) => {
    try {
      const response = await sellerShopAPI.create(formData);

      return response.data;
    } catch (error) {
      console.error("Create shop API error:", error);

      const message =
        error.response?.data?.message || "Unable to create your shop.";

      throw new Error(message);
    }
  };

  //--->>> SHOP CREATED

  const handleShopCreated = (createdShop) => {
    setShop(createdShop);

    setShowRegisterShopModal(false);

    setShopCheckError("");
  };

  //--->>>> RENDER

  return (
    <div className="min-h-screen bg-[#F8F4E9] text-[#022B3A]">
      {/*  MOBILE SIDEBAR OVERLAY */}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/*  SIDEBAR */}

      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN AREA */}

      <div className="lg:pl-[260px]">
        {/*  HEADER */}

        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/*  PAGE CONTENT */}

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            {/* SHOP CHECK LOADING */}

            {isCheckingShop ? (
              <ShopCheckingLoader />
            ) : (
              <>
                {/* ERROR */}

                {shopCheckError && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {shopCheckError}
                  </div>
                )}

                {/* APPROVAL STATUS NOTIFICATION BANNER */}
                {seller && seller.approvalStatus === "pending" && (
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-amber-800">
                        <Clock className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-amber-950">
                          Shop Owner Application Pending Super Admin Approval
                        </div>
                        <div className="text-xs text-amber-800/90 mt-0.5">
                          Your account is currently under review by the Super Admin. You cannot list products or start selling until approved.
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-400 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Under Review
                    </span>
                  </div>
                )}

                {seller && seller.approvalStatus === "rejected" && (
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-200/80 text-rose-800">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-rose-950">
                          Shop Owner Application Rejected
                        </div>
                        <div className="text-xs text-rose-800/90 mt-0.5">
                          {seller.rejectionReason
                            ? `Reason: ${seller.rejectionReason}`
                            : "Your application was declined by the Super Admin. Please contact admin@gmail.com for assistance."}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-rose-400 bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                      Rejected
                    </span>
                  </div>
                )}

                {/* DASHBOARD ROUTES */}

                <Outlet />
              </>
            )}
          </div>
        </main>
      </div>

      {/*  REGISTER SHOP MODAL*/}

      {!isCheckingShop && showRegisterShopModal && (
        <RegisterShopModal
          onCreated={handleShopCreated}
          createShop={createShop}
        />
      )}
    </div>
  );
}

//--->>> SHOP CHECK LOADER

function ShopCheckingLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div
          className="
            mx-auto
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-[#FFE0B2]
            border-t-[#FF8C00]
          "
        />

        <p className="mt-4 text-sm font-medium text-[#64748B]">
          Checking your shop...
        </p>
      </div>
    </div>
  );
}

export default DashboardLayout;
