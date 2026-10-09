import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Clock3,
  PackageCheck,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

import OrderFilters from "./components/OrderFilters";
import OrderTable from "./components/OrderTable";
import OrderDetailsModal from "./components/OrderDetailsModal";

import { sellerOrderAPI } from "../../../../services/api";

//---->>>> NORMALIZE API ORDER

const normalizeOrder = (order) => ({
  ...order,

  mongoId: order._id || "",

  id: order.orderNumber || order._id || "",

  orderDate: order.createdAt,

  customer: {
    id: order.customer?._id || order.customer?.id || "",
    name: order.customer?.name || "Customer",
    email: order.customer?.email || "",
    phone: order.customer?.phone || "",
  },

  deliveryAddress: {
    name: order.deliveryAddress?.name || "",
    phone: order.deliveryAddress?.phone || "",
    addressLine: order.deliveryAddress?.addressLine || "",
    city: order.deliveryAddress?.city || "",
    state: order.deliveryAddress?.state || "",
    pincode: order.deliveryAddress?.pincode || "",
  },

  items: (order.items || []).map((item) => ({
    ...item,

    productId: item.product?._id || item.product || "",

    name: item.name || "Product",

    image: item.image || "",

    quantity: Number(item.quantity || 0),

    price: Number(item.price || 0),

    subtotal: Number(
      item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 0),
    ),
  })),

  subtotal: Number(order.subtotal || 0),

  deliveryFee: Number(order.deliveryFee || 0),

  discount: Number(order.discount || 0),

  total: Number(order.total || 0),

  paymentMethod: order.paymentMethod || "COD",

  paymentStatus: order.paymentStatus || "Pending",

  status: order.status || "Pending",
});

//--->>> PAGE

function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //--->>> Current orders filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  //--->>> History filters
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRules, setShowRules] = useState(false);

  //---->>> FINAL ORDER STATUSES

  const FINAL_STATUSES = ["Delivered", "Cancelled"];

  //--->>> LOAD ORDERS

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await sellerOrderAPI.list();

      const apiOrders = response.data?.orders || [];

      setOrders(apiOrders.map(normalizeOrder));
    } catch (err) {
      console.error("Orders error:", err);

      setError(err.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  //--->>> ORDER STATISTICS

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.status === "Pending",
    ).length;

    const activeOrders = orders.filter((order) =>
      ["Accepted", "Preparing", "Ready"].includes(order.status),
    ).length;

    const totalSales = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((total, order) => total + Number(order.total || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      activeOrders,
      totalSales,
    };
  }, [orders]);

  //--->>> CURRENT ORDERS

  const currentOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const isCurrent = !FINAL_STATUSES.includes(order.status);

      if (!isCurrent) {
        return false;
      }

      const orderId = String(order.id || "").toLowerCase();
      const customerName = String(order.customer?.name || "").toLowerCase();
      const customerPhone = String(order.customer?.phone || "").toLowerCase();

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  //--->>> ORDER HISTORY

  const orderHistory = useMemo(() => {
    const query = historySearchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const isHistory = FINAL_STATUSES.includes(order.status);

      if (!isHistory) {
        return false;
      }

      const orderId = String(order.id || "").toLowerCase();

      const customerName = String(order.customer?.name || "").toLowerCase();

      const customerPhone = String(order.customer?.phone || "").toLowerCase();

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query);

      const matchesStatus =
        historyStatusFilter === "All" || order.status === historyStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, historySearchQuery, historyStatusFilter]);

  //---->>>> UPDATE ORDER STATUS

  const handleStatusChange = async (mongoId, newStatus) => {
    const validStatuses = [
      "Pending",
      "Accepted",
      "Preparing",
      "Ready",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(newStatus)) {
      return;
    }

    try {
      setError("");

      const currentOrder = orders.find((order) => order.mongoId === mongoId);

      if (!currentOrder) {
        setError("Order not found.");
        return;
      }

      if (FINAL_STATUSES.includes(currentOrder.status)) {
        setError("Delivered or cancelled orders cannot be modified.");
        return;
      }

      await sellerOrderAPI.updateStatus(mongoId, newStatus);

      await loadOrders();

      setSelectedOrder(null);
    } catch (err) {
      console.error("Order status update error:", err);

      console.error("Response:", err.response?.data);

      setError(err.response?.data?.message || "Unable to update order status.");
    }
  };

  //--->>> STAT CARDS

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ClipboardList,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: stats.pendingOrders,
      icon: Clock3,
      iconClass: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Active Orders",
      value: stats.activeOrders,
      icon: PackageCheck,
      iconClass: "bg-orange-50 text-orange-600",
    },
    {
      label: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconClass: "bg-green-50 text-green-600",
    },
  ];

  //---->>>> LOADING STATE

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">Loading orders...</p>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-[#DDE4E2] bg-white"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-2xl border border-[#DDE4E2] bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage current orders and keep track of completed order history.
          </p>
        </div>

        {/* CHECK RULES */}

        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm font-semibold text-[#022B3A] shadow-sm transition hover:border-[#FF8C00] hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
        >
          <ShieldCheck size={17} />
          Check Rules
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="cursor-pointer font-semibold text-red-700 hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#64748B]">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#022B3A]">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CURRENT ORDERS*/}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#022B3A]">Current Orders</h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Orders that still require action.
          </p>
        </div>

        <OrderFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          mode="current"
        />

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#64748B]">
            Showing {currentOrders.length} current orders
          </p>
        </div>

        <OrderTable
          orders={currentOrders}
          onViewOrder={setSelectedOrder}
          onStatusChange={handleStatusChange}
          readOnly={false}
        />
      </section>

      {/* ORDER HISTORY */}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#022B3A]">Order History</h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Delivered and cancelled orders are stored here for reference.
          </p>
        </div>

        <OrderFilters
          searchQuery={historySearchQuery}
          setSearchQuery={setHistorySearchQuery}
          statusFilter={historyStatusFilter}
          setStatusFilter={setHistoryStatusFilter}
          mode="history"
        />

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#64748B]">
            Showing {orderHistory.length} historical orders
          </p>
        </div>

        <OrderTable
          orders={orderHistory}
          onViewOrder={setSelectedOrder}
          onStatusChange={handleStatusChange}
          readOnly
        />
      </section>

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* ORDER RULES MODAL */}

      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022B3A]/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}

            <div className="border-b border-[#DDE4E2] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-[#022B3A]">
                    Order Status Rules
                  </h3>

                  <p className="text-xs text-[#64748B]">
                    Please check before changing an order.
                  </p>
                </div>
              </div>
            </div>

            {/* Rules */}

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-[#F8F4E9] p-4">
                <p className="font-semibold text-[#022B3A]">
                  Status can be updated while the order is active.
                </p>

                <p className="mt-1 text-sm text-[#64748B]">
                  Pending → Accepted → Preparing → Ready → Delivered
                </p>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="font-semibold text-green-700">
                  Delivered = Final
                </p>

                <p className="mt-1 text-sm text-green-700/80">
                  A delivered order cannot be changed again.
                </p>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">Cancelled = Final</p>

                <p className="mt-1 text-sm text-red-700/80">
                  A cancelled order cannot be reopened or modified.
                </p>
              </div>

              <div className="rounded-xl border border-[#DDE4E2] p-4">
                <p className="text-sm text-[#64748B]">
                  Delivered orders are marked as <strong>Paid</strong>, while
                  cancelled orders are marked as <strong>Cancelled</strong>.
                </p>
              </div>
            </div>

            {/* Footer */}

            <div className="border-t border-[#DDE4E2] p-4">
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="w-full cursor-pointer rounded-xl bg-[#022B3A] px-5 py-3 font-semibold text-white transition hover:bg-[#033B4F]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
