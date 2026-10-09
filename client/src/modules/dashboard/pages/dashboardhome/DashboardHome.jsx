import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { analyticsAPI, sellerOrderAPI } from "../../../../services/api";

//------>>>> ORDER STATUS

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Accepted",
  processing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

//---->>> HELPERS

const formatOrderDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

//--->>> DASHBOARD HOME

function DashboardHome() {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //---->>> LOAD DASHBOARD DATA

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [analyticsResponse, ordersResponse] = await Promise.all([
          analyticsAPI.get(),
          sellerOrderAPI.list(),
        ]);

        if (!isMounted) return;

        setAnalytics(analyticsResponse.data?.analytics || null);

        const orders = ordersResponse.data?.orders || [];

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message || "Unable to load dashboard data.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  //--->>> LOADING STATE

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />

        <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  //--->>> ERROR STATE

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm font-medium text-red-600">
        {error}
      </div>
    );
  }

  //---->>>> SAFE ANALYTICS DATA

  const stats = analytics || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    topProducts: [],
    salesOverview: [],
  };

  //--->>>> STAT CARDS

  const statCards = [
    {
      title: "Total Products",
      value: Number(stats.totalProducts || 0).toLocaleString("en-IN"),
      description: "Products listed",
      icon: Package,
    },
    {
      title: "Total Orders",
      value: Number(stats.totalOrders || 0).toLocaleString("en-IN"),
      description: "Orders received",
      icon: ShoppingBag,
    },
    {
      title: "Total Revenue",
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`,
      description: "Cash orders",
      icon: IndianRupee,
    },
    {
      title: "Customers",
      value: Number(stats.totalCustomers || 0).toLocaleString("en-IN"),
      description: "Customers served",
      icon: Users,
    },
  ];

  //----->>>> SALES OVERVIEW

  const salesOverview =
    Array.isArray(stats.salesOverview) && stats.salesOverview.length > 0
      ? stats.salesOverview.map((item) => ({
          day: item.day || item.label || item.month || "Unknown",
          revenue: Number(item.revenue || item.totalRevenue || item.sales || 0),
        }))
      : [
          {
            day: "No data",
            revenue: 0,
          },
        ];

  //---->>> ORDER STATUS DATA

  const orderStatuses = [
    {
      label: "Pending",
      value: Number(stats.pendingOrders || 0),
      icon: <Clock3 size={17} />,
      type: "pending",
    },
    {
      label: "Accepted",
      value: Number(stats.acceptedOrders || 0),
      icon: <CheckCircle2 size={17} />,
      type: "accepted",
    },
    {
      label: "Preparing",
      value: Number(stats.preparingOrders || 0),
      icon: <Package size={17} />,
      type: "preparing",
    },
    {
      label: "Ready",
      value: Number(stats.readyOrders || 0),
      icon: <ShoppingBag size={17} />,
      type: "ready",
    },
    {
      label: "Delivered",
      value: Number(stats.deliveredOrders || 0),
      icon: <CheckCircle2 size={17} />,
      type: "delivered",
    },
    {
      label: "Cancelled",
      value: Number(stats.cancelledOrders || 0),
      icon: <XCircle size={17} />,
      type: "cancelled",
    },
  ];

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#FF8C00]">Overview</p>

          <h1 className="mt-1 text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Here's what's happening with your shop today.
          </p>
        </div>

        <div className="rounded-lg bg-white px-4 py-2.5 text-sm text-[#64748B] shadow-sm ring-1 ring-[#DDE4E2]">
          <span className="font-medium text-[#022B3A]">Today</span>
        </div>
      </div>

      {/* STAT CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#64748B]">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#022B3A] sm:text-3xl">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ORDER QUICK SUMMARY */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<Clock3 size={19} />}
          label="Pending Orders"
          value={Number(stats.pendingOrders || 0)}
          description="Need your attention"
        />

        <SummaryCard
          icon={<CheckCircle2 size={19} />}
          label="Completed Orders"
          value={Number(stats.deliveredOrders || 0)}
          description="Successfully delivered"
        />

        <SummaryCard
          icon={<XCircle size={19} />}
          label="Cancelled Orders"
          value={Number(stats.cancelledOrders || 0)}
          description="Cancelled by customer or seller"
        />
      </div>

      {/* SALES + ORDER STATUS*/}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* SALES OVERVIEW */}

        <section className="rounded-2xl border border-[#DDE4E2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#DDE4E2] px-5 py-4">
            <div>
              <h2 className="font-bold text-[#022B3A]">Sales Overview</h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Revenue generated by week
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
              <TrendingUp size={15} />
              Sales
            </div>
          </div>

          <div className="p-5">
            <div className="mb-5">
              <p className="text-xs text-[#64748B]">Total Revenue</p>

              <p className="mt-1 text-2xl font-bold text-[#022B3A]">
                ₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN")}
              </p>
            </div>

            {/* SALES CHART */}

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesOverview}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) => {
                      if (value >= 1000) {
                        return `₹${value / 1000}k`;
                      }

                      return `₹${value}`;
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: "#F8F4E9",
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #DDE4E2",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Revenue",
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#FF8C00"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ORDER STATUS */}

        <section className="rounded-2xl border border-[#DDE4E2] bg-white shadow-sm">
          <div className="border-b border-[#DDE4E2] px-5 py-4">
            <h2 className="font-bold text-[#022B3A]">Order Status</h2>

            <p className="mt-1 text-xs text-[#64748B]">
              Current order distribution
            </p>
          </div>

          <div className="space-y-5 p-5">
            {orderStatuses.map((status) => (
              <OrderStatus
                key={status.type}
                label={status.label}
                value={status.value}
                total={Number(stats.totalOrders || 0)}
                icon={status.icon}
                type={status.type}
              />
            ))}
          </div>
        </section>
      </div>

      {/* RECENT ORDERS + TOP PRODUCTS */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* RECENT ORDERS */}

        <section className="overflow-hidden rounded-2xl border border-[#DDE4E2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#DDE4E2] px-5 py-4">
            <div>
              <h2 className="font-bold text-[#022B3A]">Recent Orders</h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Latest customer orders
              </p>
            </div>

            <Link
              to="/dashboard/orders"
              className="flex items-center gap-1 text-sm font-semibold text-[#FF8C00] transition hover:text-[#E67E00]"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64748B]">
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#DDE4E2] bg-[#F8F4E9] text-left text-xs uppercase tracking-wide text-[#64748B]">
                    <th className="px-5 py-3 font-semibold">Order</th>

                    <th className="px-5 py-3 font-semibold">Customer</th>

                    <th className="px-5 py-3 font-semibold">Items</th>

                    <th className="px-5 py-3 font-semibold">Amount</th>

                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id || order.orderNumber}
                      className="border-b border-[#DDE4E2] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#022B3A]">
                          {order.orderNumber || order._id}
                        </p>

                        <p className="mt-0.5 text-xs text-[#64748B]">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#022B3A]">
                        {order.customer?.name || "Customer"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#64748B]">
                        {order.items?.length || 0}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[#022B3A]">
                        ₹
                        {Number(
                          order.totalAmount || order.total || 0,
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* TOP PRODUCTS */}

        <section className="rounded-2xl border border-[#DDE4E2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#DDE4E2] px-5 py-4">
            <div>
              <h2 className="font-bold text-[#022B3A]">Top Products</h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Best performing products
              </p>
            </div>

            <Link
              to="/dashboard/products"
              className="text-sm font-semibold text-[#FF8C00] transition hover:text-[#E67E00]"
            >
              Products
            </Link>
          </div>

          {!stats.topProducts || stats.topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64748B]">
              No sales yet.
            </div>
          ) : (
            <div className="divide-y divide-[#DDE4E2]">
              {stats.topProducts.map((product, index) => (
                <div
                  key={product.productId || product._id || index}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-sm font-bold text-[#FF8C00]">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#022B3A]">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      {Number(product.quantitySold || 0)} units sold
                    </p>
                  </div>

                  <p className="text-sm font-bold text-[#022B3A]">
                    ₹{Number(product.revenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* QUICK ACTIONS */}

      <section className="mt-6 rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-bold text-[#022B3A]">Quick Actions</h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Common actions for managing your shop
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/dashboard/products"
            title="Add Product"
            description="List a new product"
            icon={<Package size={20} />}
          />

          <QuickAction
            href="/dashboard/orders"
            title="Manage Orders"
            description="View customer orders"
            icon={<ShoppingBag size={20} />}
          />

          <QuickAction
            href="/dashboard/shop"
            title="Update Shop"
            description="Edit shop information"
            icon={<Users size={20} />}
          />

          <QuickAction
            href="/dashboard/analytics"
            title="View Analytics"
            description="Track shop performance"
            icon={<TrendingUp size={20} />}
          />
        </div>
      </section>
    </div>
  );
}

//---->>> SUMMARY CARD

function SummaryCard({ icon, label, value, description }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#DDE4E2] bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-[#64748B]">{label}</p>

        <p className="mt-0.5 text-xl font-bold text-[#022B3A]">{value}</p>

        <p className="text-xs text-[#64748B]">{description}</p>
      </div>
    </div>
  );
}

//--->>>> ORDER STATUS

function OrderStatus({ label, value, total, icon, type }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const styles = {
    pending: "bg-amber-50 text-amber-600",
    accepted: "bg-blue-50 text-blue-600",
    preparing: "bg-purple-50 text-purple-600",
    ready: "bg-orange-50 text-orange-600",
    delivered: "bg-green-50 text-green-600",
    cancelled: "bg-red-50 text-red-600",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              styles[type] || "bg-gray-50 text-gray-600"
            }`}
          >
            {icon}
          </div>

          <span className="text-sm font-medium text-[#022B3A]">{label}</span>
        </div>

        <span className="text-xs font-semibold text-[#64748B]">
          {value} ({percentage}%)
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F0]">
        <div
          className="h-full rounded-full bg-[#FF8C00] transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

//----->>>> STATUS BADGE

function StatusBadge({ status }) {
  const normalizedStatus = normalizeStatus(status);

  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },

    confirmed: {
      label: "Accepted",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },

    processing: {
      label: "Preparing",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },

    ready: {
      label: "Ready",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },

    out_for_delivery: {
      label: "Out for Delivery",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },

    delivered: {
      label: "Delivered",
      className: "bg-green-50 text-green-700 border-green-200",
    },

    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = statusConfig[normalizedStatus] || {
    label: ORDER_STATUS_LABELS[normalizedStatus] || status || "Unknown",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {config.label}
    </span>
  );
}

//---->> QUICK ACTION

function QuickAction({ href, title, description, icon }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-xl border border-[#DDE4E2] p-4 text-left transition hover:border-[#FF8C00] hover:bg-[#FFF0D9]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#022B3A]">{title}</p>

        <p className="mt-0.5 text-xs text-[#64748B]">{description}</p>
      </div>
    </Link>
  );
}

export default DashboardHome;
