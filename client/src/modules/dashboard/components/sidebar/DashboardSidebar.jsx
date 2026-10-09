import { useState } from "react";

import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Store,
  Users,
  X,
  LogOut,
  FileSpreadsheet,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../../../shared/context/AuthContext";
import logo from "../../../../assets/logo.png";

import LogoutModal from "../LogoutModal";

function DashboardSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const { seller, logoutSeller } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  //--->> SIDEBAR NAVIGATION

  const navigationGroups = [
    {
      title: "Main",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "Shop",
      items: [
        {
          label: "Shop Info",
          path: "/dashboard/shop",
          icon: Store,
        },
      ],
    },

    {
      title: "Catalog",
      items: [
        {
          label: "Products",
          path: "/dashboard/products",
          icon: Boxes,
        },
        {
          label: "Bulk Upload",
          path: "/dashboard/products/upload",
          icon: FileSpreadsheet,
        },
      ],
    },

    {
      title: "Sales",
      items: [
        {
          label: "Orders",
          path: "/dashboard/orders",
          icon: ClipboardList,
        },
        {
          label: "Customers",
          path: "/dashboard/customers",
          icon: Users,
        },
      ],
    },

    {
      title: "Management",
      items: [
        {
          label: "Reviews",
          path: "/dashboard/reviews",
          icon: MessageSquare,
        },
        {
          label: "Analytics",
          path: "/dashboard/analytics",
          icon: BarChart3,
        },
      ],
    },
  ];

  //---->>> OPEN LOGOUT MODAL

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  //---->>> CONFIRM SELLER LOGOUT

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logoutSeller();

      setShowLogoutModal(false);

      onClose?.();

      navigate("/seller/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Seller logout failed:", error);

      setShowLogoutModal(false);

      onClose?.();

      navigate("/seller/login", {
        replace: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* SIDEBAR */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[260px] flex-col
          border-r border-[#164854]
          bg-[#022B3A] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}

        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/10 px-5 sm:h-[64px]">
          {/* LOGO */}

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-10 w-auto shrink-0 items-center">
              <img
                src={logo}
                alt="ShopLocal"
                className="h-10 w-auto rounded-lg object-contain"
              />
            </div>

            <div className="text-left">
              <p className="text-base font-bold leading-none">
                <span className="text-[#FF8C00]">Shop</span>
                <span className="text-white">Local</span>
              </p>

              <p className="mt-1 text-[11px] font-medium text-white/50">
                Seller Dashboard
              </p>
            </div>
          </button>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="
              cursor-pointer
              flex h-9 w-9 items-center justify-center
              rounded-lg text-white/70
              transition
              hover:bg-white/10 hover:text-white
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {/* SELLER APPROVAL STATUS BADGE */}
          {seller && (
            <div className="mb-5 mx-1 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.12em] mb-1.5">
                Account Status
              </div>
              {seller.approvalStatus === "approved" ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Verified Shop Owner
                </div>
              ) : seller.approvalStatus === "rejected" ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Application Rejected
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Pending Admin Approval
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION GROUPS */}

          {navigationGroups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              {/* GROUP TITLE */}

              <p
                className="
                  mb-2 px-3
                  text-[10px] font-bold
                  uppercase tracking-[0.15em]
                  text-white/40
                "
              >
                {group.title}
              </p>

              {/* GROUP LINKS */}

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/dashboard"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `
                        flex items-center gap-3
                        rounded-lg px-3 py-2.5
                        text-sm font-medium
                        transition
                        ${
                          isActive
                            ? "bg-[#FF8C00] text-white shadow-sm"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }
                        `
                      }
                    >
                      <Icon size={18} />

                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* SETTINGS*/}

          <div className="mb-1">
            <NavLink
              to="/dashboard/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex items-center gap-3
                rounded-lg px-3 py-2.5
                text-sm font-medium
                transition
                ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
                `
              }
            >
              <Settings size={18} />

              <span>Settings</span>
            </NavLink>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="
              cursor-pointer
              flex w-full items-center gap-3
              rounded-lg px-3 py-2.5
              text-sm font-medium
              text-white/70
              transition
              hover:bg-red-500/10
              hover:text-red-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <LogOut size={18} />

            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

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

export default DashboardSidebar;
