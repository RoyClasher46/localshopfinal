import {
  Bell,
  Menu,
  Store,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../shared/context/AuthContext";
import { sellerShopAPI } from "../../../../services/api";
import LogoutModal from "../LogoutModal";

function DashboardHeader({ onMenuClick }) {
  const navigate = useNavigate();

  const { seller, logoutSeller } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [shopName, setShopName] = useState("My Shop");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef(null);

  //--->>> SELLER DATA

  const sellerName = seller?.ownerName || "Shop Owner";

  const sellerEmail = seller?.email || "";

  useEffect(() => {
    const loadShopName = async () => {
      try {
        const response = await sellerShopAPI.get();

        const shop = response.data?.shop;

        if (shop?.name) {
          setShopName(shop.name);
        }
      } catch (error) {
        console.error("Load shop name error:", error);
      }
    };

    loadShopName();
  }, []);

  //---->>> CLOSE DROPDOWN WHEN CLICKING OUTSIDE

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //--->>> OPEN LOGOUT MODAL

  const handleLogout = () => {
    setIsProfileOpen(false);

    setShowLogoutModal(true);
  };

  //--->>> CONFIRM SELLER LOGOUT

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logoutSeller();

      setShowLogoutModal(false);

      navigate("/seller/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Seller logout failed:", error);

      setShowLogoutModal(false);

      navigate("/seller/login", {
        replace: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* DASHBOARD HEADER */}

      <header
        className="
          sticky top-0 z-30
          flex
          h-[52px] sm:h-[64px]
          items-center
          border-b border-[#DDE4E2]
          bg-white
          px-3 sm:px-3 lg:px-3
          shadow-sm
        "
      >
        {/* LEFT SIDE */}

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={onMenuClick}
            className="
            cursor-pointer
              flex
              h-9 w-9
              sm:h-10 sm:w-10
              shrink-0
              cursor-pointer
              items-center justify-center
              rounded-lg
              text-[#022B3A]
              transition
              hover:bg-[#F8F4E9]
              lg:hidden
            "
            aria-label="Open dashboard menu"
          >
            <Menu size={20} className="sm:h-[22px] sm:w-[22px]" />
          </button>

          {/* SHOP NAME */}

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="
            cursor-pointer
              flex
              min-w-0
              cursor-pointer
              items-center
              gap-2
              rounded-lg
              px-1.5 py-1
              text-left
              transition
              hover:bg-[#F8F4E9]
            "
          >
            {/* SHOP ICON */}

            <div
              className="
                flex
                h-8 w-8
                sm:h-9 sm:w-9
                shrink-0
                items-center justify-center
                rounded-lg
                bg-[#FFF0D9]
                text-[#FF8C00]
              "
            >
              <Store size={17} className="sm:h-[18px] sm:w-[18px]" />
            </div>

            {/* SHOP NAME */}

            <div className="min-w-0">
              <p
                className="
                  max-w-[150px]
                  sm:max-w-[220px]
                  truncate
                  text-xs
                  sm:text-sm
                  font-semibold
                  text-[#022B3A]
                "
              >
                {shopName}
              </p>
            </div>
          </button>
        </div>

        {/* RIGHT SIDE */}

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          {/* NOTIFICATIONS */}

          <button
            type="button"
            className="
            cursor-pointer
              relative
              flex
              h-9 w-9
              sm:h-10 sm:w-10
              shrink-0
              cursor-pointer
              items-center justify-center
              rounded-lg
              text-[#022B3A]
              transition
              hover:bg-[#F8F4E9]
            "
            aria-label="Notifications"
          >
            <Bell size={18} className="sm:h-5 sm:w-5" />

            <span
              className="
                absolute
                right-1.5 top-1.5
                sm:right-2 sm:top-2
                h-1.5 w-1.5
                sm:h-2 sm:w-2
                rounded-full
                bg-[#FF8C00]
              "
            />
          </button>

          {/* DIVIDER */}

          <div className="hidden h-8 w-px bg-[#DDE4E2] sm:block" />

          {/* SELLER PROFILE */}

          <div ref={profileRef} className="relative">
            {/* PROFILE BUTTON */}

            <button
              type="button"
              onClick={() => setIsProfileOpen((previous) => !previous)}
              className="
              cursor-pointer
                flex
                cursor-pointer
                items-center
                gap-1.5
                sm:gap-2
                rounded-lg
                px-1.5 py-1
                sm:px-2 sm:py-1.5
                transition
                hover:bg-[#F8F4E9]
              "
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              {/* USER ICON */}

              <div
                className="
                  flex
                  h-8 w-8
                  sm:h-9 sm:w-9
                  shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-[#FFF0D9]
                  text-[#FF8C00]
                "
              >
                <User size={16} className="sm:h-[18px] sm:w-[18px]" />
              </div>

              {/* SELLER NAME + EMAIL */}

              <div className="hidden text-left sm:block">
                <p
                  className="
                    max-w-[130px]
                    truncate
                    text-sm
                    font-semibold
                    text-[#022B3A]
                  "
                >
                  {sellerName}
                </p>

                <p
                  className="
                    max-w-[130px]
                    truncate
                    text-xs
                    text-[#64748B]
                  "
                >
                  {sellerEmail}
                </p>
              </div>

              {/* CHEVRON */}

              <ChevronDown
                size={15}
                className={`
                  hidden
                  text-[#64748B]
                  transition-transform
                  sm:block
                  ${isProfileOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {isProfileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[46px]
                  sm:top-[52px]

                  min-w-[200px]
                  max-h-[420px]

                  overflow-y-auto

                  rounded-xl
                  border border-[#DDE4E2]
                  bg-white
                  shadow-xl
                "
              >
                {/* SELLER INFORMATION */}

                <div
                  className="
                    border-b
                    border-[#DDE4E2]
                    bg-[#F8FAF9]
                    px-4 py-3.5
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#022B3A]
                    "
                  >
                    {sellerName}
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-[#64748B]
                    "
                  >
                    {sellerEmail}
                  </p>
                </div>

                {/* SHOP INFORMATION */}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/dashboard/shop");
                  }}
                  className="
                  cursor-pointer
                    flex w-full
                    cursor-pointer
                    items-center gap-3
                    border-t border-[#DDE4E2]
                    px-4 py-3
                    text-left
                    text-sm
                    font-medium
                    text-[#022B3A]
                    transition
                    hover:bg-[#FFF0D9]
                  "
                >
                  <Store size={17} />

                  <span>Shop Information</span>
                </button>

                {/* SETTINGS */}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/dashboard/settings");
                  }}
                  className="
                  cursor-pointer
                    flex w-full
                    cursor-pointer
                    items-center gap-3
                    border-t border-[#DDE4E2]
                    px-4 py-3
                    text-left
                    text-sm
                    font-medium
                    text-[#022B3A]
                    transition
                    hover:bg-[#FFF0D9]
                  "
                >
                  <Settings size={17} />

                  <span>Settings</span>
                </button>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="
                  cursor-pointer
                    flex w-full
                    cursor-pointer
                    items-center gap-3
                    border-t border-[#DDE4E2]
                    px-4 py-3
                    text-left
                    text-sm
                    font-medium
                    text-red-500
                    transition
                    hover:bg-red-50
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <LogOut size={17} />

                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => {
          if (!isLoggingOut) {
            setShowLogoutModal(false);
          }
        }}
        onConfirm={confirmLogout}
      />
    </>
  );
}

export default DashboardHeader;
