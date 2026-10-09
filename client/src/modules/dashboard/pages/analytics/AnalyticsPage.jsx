import { useEffect, useState } from "react";
import { IndianRupee, ClipboardList, Receipt, Users } from "lucide-react";

import AnalyticsStatCard from "./components/AnalyticsStatCard";
import SalesChart from "./components/SalesChart";
import OrderPerformance from "./components/OrderPerformance";
import TopProducts from "./components/TopProducts";
import CustomerInsights from "./components/CustomerInsights";

import { analyticsAPI } from "../../../../services/api";

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("7d");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await analyticsAPI.get(period);

        setAnalytics(response.data?.analytics || null);
      } catch (err) {
        console.error("Analytics error:", err);

        setError(err.response?.data?.message || "Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-16 text-center">
        Loading analytics...
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600">
        {error || "No analytics available."}
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${Number(analytics.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconClass: "bg-green-50 text-green-600",
      description: "Revenue generated",
    },
    {
      label: "Total Orders",
      value: analytics.totalOrders || 0,
      icon: ClipboardList,
      iconClass: "bg-blue-50 text-blue-600",
      description: "Orders received",
    },
    {
      label: "Average Order",
      value: `₹${Number(analytics.averageOrderValue || 0).toLocaleString(
        "en-IN",
      )}`,
      icon: Receipt,
      iconClass: "bg-orange-50 text-orange-600",
      description: "Average order value",
    },
    {
      label: "Customers",
      value: analytics.totalCustomers || 0,
      icon: Users,
      iconClass: "bg-purple-50 text-purple-600",
      description: "Total customers",
    },
  ];

  const orderPerformance = {
    pending: analytics.pendingOrders || 0,
    active: analytics.activeOrders || 0,
    delivered: analytics.deliveredOrders || 0,
    cancelled: analytics.cancelledOrders || 0,
  };

  const customerInsights = {
    totalCustomers: analytics.totalCustomers || 0,

    newCustomers: 0,

    returningCustomers: analytics.totalCustomers || 0,
  };

  const topProducts = (analytics.topProducts || []).map((product) => ({
    ...product,

    id: product.productId || product.id,

    unitsSold: product.quantitySold || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Track your shop performance and business growth.
          </p>
        </div>

        <div className="shrink-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 cursor-pointer rounded-lg border border-[#DDE4E2] bg-white px-3 text-sm font-semibold text-[#022B3A] outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((stat) => (
          <AnalyticsStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <SalesChart data={analytics.salesOverview || []} period={period} />

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderPerformance data={orderPerformance} />

        <CustomerInsights data={customerInsights} />
      </div>

      <TopProducts products={topProducts} />
    </div>
  );
}

export default AnalyticsPage;
