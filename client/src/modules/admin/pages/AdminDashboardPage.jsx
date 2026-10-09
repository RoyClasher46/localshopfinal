import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Store,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  LogOut,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Package,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAdminAuth } from "../../../shared/context/AdminAuthContext";
import { adminAPI } from "../../../services/api";
import logo from "../../../assets/logo.png";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdminAuth();

  const [sellers, setSellers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedSellerForDetails, setSelectedSellerForDetails] = useState(null);
  const [rejectModalSeller, setRejectModalSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadSellersData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.sellers({
        status: statusFilter,
        search: searchQuery,
      });

      if (response.data?.success) {
        setSellers(response.data.sellers || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error("Error loading sellers:", error);
      toast.error(error.response?.data?.message || "Failed to load shop owners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellersData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSellersData();
  };

  const handleApprove = async (sellerId, sellerName) => {
    try {
      setActionLoadingId(sellerId);
      const response = await adminAPI.approveSeller(sellerId);
      if (response.data?.success) {
        toast.success(`Shop owner "${sellerName}" approved successfully!`);
        await loadSellersData();
        if (selectedSellerForDetails?._id === sellerId) {
          setSelectedSellerForDetails((prev) => ({
            ...prev,
            approvalStatus: "approved",
          }));
        }
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.response?.data?.message || "Failed to approve shop owner.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (seller) => {
    setRejectModalSeller(seller);
    setRejectionReason("Incomplete business documentation or invalid shop details.");
  };

  const handleConfirmReject = async () => {
    if (!rejectModalSeller) return;

    try {
      setActionLoadingId(rejectModalSeller._id);
      const response = await adminAPI.rejectSeller(rejectModalSeller._id, {
        reason: rejectionReason,
      });

      if (response.data?.success) {
        toast.success(`Shop owner "${rejectModalSeller.ownerName}" has been rejected.`);
        setRejectModalSeller(null);
        await loadSellersData();
        if (selectedSellerForDetails?._id === rejectModalSeller._id) {
          setSelectedSellerForDetails((prev) => ({
            ...prev,
            approvalStatus: "rejected",
            rejectionReason,
          }));
        }
      }
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(error.response?.data?.message || "Failed to reject shop owner.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevert = async (sellerId, sellerName) => {
    try {
      setActionLoadingId(sellerId);
      const response = await adminAPI.revertSeller(sellerId);
      if (response.data?.success) {
        toast.success(`Reset status for "${sellerName}" back to Pending Review.`);
        await loadSellersData();
        if (selectedSellerForDetails?._id === sellerId) {
          setSelectedSellerForDetails((prev) => ({
            ...prev,
            approvalStatus: "pending",
          }));
        }
      }
    } catch (error) {
      console.error("Revert error:", error);
      toast.error(error.response?.data?.message || "Failed to revert status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  // Local filter for instant search responsiveness
  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter((s) => {
      const nameMatch = s.ownerName?.toLowerCase().includes(q);
      const emailMatch = s.email?.toLowerCase().includes(q);
      const phoneMatch = s.phone?.toLowerCase().includes(q);
      const shopMatch = s.shop?.name?.toLowerCase().includes(q);
      const categoryMatch = s.shop?.category?.toLowerCase().includes(q);
      return nameMatch || emailMatch || phoneMatch || shopMatch || categoryMatch;
    });
  }, [sellers, searchQuery]);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="ShopLocal" className="h-8 w-auto brightness-110" />
            </Link>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 text-xs font-semibold text-amber-400">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                Super Admin
              </span>
              <span className="hidden sm:inline text-xs text-slate-400">
                Dashboard Portal
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Logged in as:</span>
              <span className="font-semibold text-amber-300">{admin?.email || "admin@gmail.com"}</span>
            </div>

            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Storefront
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome & Banner */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Shop Owner Approval Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Review and approve or reject shop owner registrations. Approved owners can immediately list products and start selling.
            </p>
          </div>

          <button
            onClick={loadSellersData}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Refresh List
          </button>
        </div>

        {/* KPI Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Total Shop Owners */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Owners
              </span>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-white">
              {stats.total}
            </div>
            <p className="mt-1 text-xs text-slate-500">Registered seller accounts</p>
          </div>

          {/* Pending Approval */}
          <div
            onClick={() => setStatusFilter("pending")}
            className={`cursor-pointer rounded-2xl border p-5 shadow-lg backdrop-blur transition-all ${
              statusFilter === "pending"
                ? "border-amber-500/60 bg-amber-500/10 ring-2 ring-amber-500/30"
                : "border-slate-800 bg-slate-900/80 hover:border-amber-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Pending Review
              </span>
              <div className="relative rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
                <Clock className="h-5 w-5" />
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-amber-400">
              {stats.pending}
            </div>
            <p className="mt-1 text-xs text-amber-300/70">Awaiting your approval</p>
          </div>

          {/* Approved Sellers */}
          <div
            onClick={() => setStatusFilter("approved")}
            className={`cursor-pointer rounded-2xl border p-5 shadow-lg backdrop-blur transition-all ${
              statusFilter === "approved"
                ? "border-emerald-500/60 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                : "border-slate-800 bg-slate-900/80 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Approved
              </span>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-emerald-400">
              {stats.approved}
            </div>
            <p className="mt-1 text-xs text-emerald-300/70">Active & verified sellers</p>
          </div>

          {/* Rejected */}
          <div
            onClick={() => setStatusFilter("rejected")}
            className={`cursor-pointer rounded-2xl border p-5 shadow-lg backdrop-blur transition-all ${
              statusFilter === "rejected"
                ? "border-rose-500/60 bg-rose-500/10 ring-2 ring-rose-500/30"
                : "border-slate-800 bg-slate-900/80 hover:border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Rejected
              </span>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-rose-400">
              {stats.rejected}
            </div>
            <p className="mt-1 text-xs text-rose-300/70">Declined applications</p>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/90 p-1">
            {[
              { id: "all", label: "All Owners", count: stats.total },
              { id: "pending", label: "Pending", count: stats.pending },
              { id: "approved", label: "Approved", count: stats.approved },
              { id: "rejected", label: "Rejected", count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    statusFilter === tab.id
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, shop..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </form>
        </div>

        {/* Shop Owners List Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
              <p className="mt-4 text-sm font-medium text-slate-400">
                Loading shop owner applications...
              </p>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/50 text-slate-500">
                <Store className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-200">
                No shop owners found
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {searchQuery
                  ? `No shop owners match your search "${searchQuery}".`
                  : statusFilter === "pending"
                  ? "There are currently no shop owners waiting for approval. All caught up!"
                  : "No shop owners found in this category."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800/80 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Shop Owner</th>
                    <th className="px-5 py-4">Contact Info</th>
                    <th className="px-5 py-4">Shop Details</th>
                    <th className="px-5 py-4">Registered</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Super Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSellers.map((seller) => {
                    const status = seller.approvalStatus || "pending";
                    const isPending = status === "pending";
                    const isApproved = status === "approved";
                    const isRejected = status === "rejected";
                    const isActionLoading = actionLoadingId === seller._id;

                    return (
                      <tr
                        key={seller._id}
                        className="transition-colors hover:bg-slate-800/30"
                      >
                        {/* Owner Name & Initial */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-slate-950 shadow">
                              {seller.ownerName ? seller.ownerName.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 text-sm">
                                {seller.ownerName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Seller ID: {seller._id.substring(seller._id.length - 6)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                              <span className="font-mono text-xs">{seller.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                              <span>{seller.phone || "No phone provided"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Shop Info */}
                        <td className="px-5 py-4">
                          {seller.shop ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                                <Store className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                <span>{seller.shop.name}</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Category:{" "}
                                <span className="text-slate-300 font-medium">
                                  {seller.shop.category}
                                </span>
                              </div>
                              {seller.shop.location?.city && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                  <span>{seller.shop.location.city}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-1 text-[11px] text-slate-400">
                              <Info className="h-3 w-3 text-slate-500" />
                              Profile created (Shop pending)
                            </div>
                          )}
                        </td>

                        {/* Registered Date */}
                        <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            <span>
                              {seller.createdAt
                                ? new Date(seller.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Recent"}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pending Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approved
                            </span>
                          )}
                          {isRejected && (
                            <div>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400">
                                <XCircle className="h-3.5 w-3.5" />
                                Rejected
                              </span>
                              {seller.rejectionReason && (
                                <div className="mt-1 text-[10px] text-rose-400/80 max-w-[150px] truncate" title={seller.rejectionReason}>
                                  {seller.rejectionReason}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Details Button */}
                            <button
                              onClick={() => setSelectedSellerForDetails(seller)}
                              className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
                              title="View Full Application Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Approve Button */}
                            {(!isApproved || isRejected) && (
                              <button
                                onClick={() => handleApprove(seller._id, seller.ownerName)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                              </button>
                            )}

                            {/* Reject Button */}
                            {(!isRejected || isPending) && (
                              <button
                                onClick={() => openRejectModal(seller)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            )}

                            {/* Revert Button if already approved or rejected */}
                            {(isApproved || isRejected) && (
                              <button
                                onClick={() => handleRevert(seller._id, seller.ownerName)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
                                title="Reset status to Pending Review"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Revert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* REJECT MODAL */}
      {rejectModalSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Reject Shop Owner
                </h3>
                <p className="text-xs text-slate-400">
                  {rejectModalSeller.ownerName} ({rejectModalSeller.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Are you sure you want to reject this shop owner? They will be locked from listing products or selling on ShopLocal.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Reason for Rejection (Displayed to Shop Owner)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g. Incomplete business address, invalid license..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  "Incomplete business details",
                  "Unverified phone or address",
                  "Invalid product category",
                  "Duplicate shop request",
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setRejectionReason(sample)}
                    className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalSeller(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectModalSeller._id}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {actionLoadingId === rejectModalSeller._id
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL INSPECTION MODAL */}
      {selectedSellerForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950">
                  {selectedSellerForDetails.ownerName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedSellerForDetails.ownerName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">
                      {selectedSellerForDetails.email}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">
                      {selectedSellerForDetails.phone}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedSellerForDetails(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Status overview */}
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Application Status
                  </div>
                  <div className="mt-1 text-sm font-bold text-white capitalize">
                    {selectedSellerForDetails.approvalStatus || "Pending Approval"}
                  </div>
                </div>

                <div>
                  {selectedSellerForDetails.approvalStatus === "approved" ? (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                      Verified & Active
                    </span>
                  ) : selectedSellerForDetails.approvalStatus === "rejected" ? (
                    <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400">
                      Rejected
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 animate-pulse">
                      Pending Super Admin Review
                    </span>
                  )}
                </div>
              </div>

              {selectedSellerForDetails.rejectionReason && (
                <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                  <span className="font-semibold">Rejection Note: </span>
                  {selectedSellerForDetails.rejectionReason}
                </div>
              )}
            </div>

            {/* Shop Details section */}
            {selectedSellerForDetails.shop ? (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-amber-400">
                  Registered Shop Profile
                </h4>

                {/* Banner & Logo */}
                {selectedSellerForDetails.shop.image && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src={selectedSellerForDetails.shop.image}
                      alt={selectedSellerForDetails.shop.name}
                      className="h-full w-full object-cover"
                    />
                    {selectedSellerForDetails.shop.logo && (
                      <img
                        src={selectedSellerForDetails.shop.logo}
                        alt="Logo"
                        className="absolute bottom-3 left-3 h-12 w-12 rounded-xl border-2 border-slate-900 object-cover shadow-lg"
                      />
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Shop Name</span>
                    <span className="font-semibold text-white">
                      {selectedSellerForDetails.shop.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Category</span>
                    <span className="font-semibold text-white">
                      {selectedSellerForDetails.shop.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Location</span>
                    <span className="text-slate-300">
                      {selectedSellerForDetails.shop.location?.address},{" "}
                      {selectedSellerForDetails.shop.location?.city}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">State & Pincode</span>
                    <span className="text-slate-300">
                      {selectedSellerForDetails.shop.location?.state}{" "}
                      {selectedSellerForDetails.shop.location?.pincode}
                    </span>
                  </div>
                </div>

                {selectedSellerForDetails.shop.description && (
                  <div>
                    <span className="text-slate-500 block mb-1">Description</span>
                    <p className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-slate-300 leading-relaxed">
                      {selectedSellerForDetails.shop.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                This seller has registered their account but hasn't created their shop profile yet.
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              {selectedSellerForDetails.approvalStatus !== "approved" && (
                <button
                  type="button"
                  onClick={() =>
                    handleApprove(
                      selectedSellerForDetails._id,
                      selectedSellerForDetails.ownerName,
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 cursor-pointer"
                >
                  Approve Shop Owner
                </button>
              )}

              {selectedSellerForDetails.approvalStatus !== "rejected" && (
                <button
                  type="button"
                  onClick={() => {
                    openRejectModal(selectedSellerForDetails);
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-95 cursor-pointer"
                >
                  Reject Shop Owner
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedSellerForDetails(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
