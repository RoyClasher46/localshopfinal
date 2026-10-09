import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

//--->>> GET SELLER ANALYTICS
// GET /api/seller/analytics
// SELLER

export const getSellerAnalytics = async (req, res) => {
  try {
    //---->>>> 1. GET SELLER ID FROM AUTH MIDDLEWARE

    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID.",
      });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    //----->>>> 2. ANALYTICS PERIOD

    const allowedPeriods = ["7d", "30d", "3m", "6m", "1y", "all"];

    const requestedPeriod = req.query.period || "7d";

    const period = allowedPeriods.includes(requestedPeriod)
      ? requestedPeriod
      : "7d";

    const now = new Date();

    let startDate = null;

    switch (period) {
      case "7d": {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      }

      case "30d": {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      }

      case "3m": {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        break;
      }

      case "6m": {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      }

      case "1y": {
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      }

      case "all": {
        startDate = null;
        break;
      }

      default: {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
      }
    }

    //--->>>> 3. GET SELLER ORDERS

    const orderQuery = {
      seller: sellerObjectId,
    };

    if (startDate) {
      orderQuery.createdAt = {
        $gte: startDate,
        $lte: now,
      };
    }

    const orders = await Order.find(orderQuery).sort({ createdAt: 1 }).lean();

    //---->>> 4. ORDER COUNTS

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.status === "Pending",
    ).length;

    const activeOrders = orders.filter((order) =>
      ["Accepted", "Preparing", "Ready"].includes(order.status),
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "Delivered",
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.status === "Cancelled",
    ).length;

    //---->> 5. REVENUE

    const validRevenueOrders = orders.filter(
      (order) => order.status !== "Cancelled",
    );

    const totalRevenue = validRevenueOrders.reduce((total, order) => {
      const orderTotal = Number(order.total);

      return total + (Number.isFinite(orderTotal) ? orderTotal : 0);
    }, 0);

    const averageOrderValue =
      validRevenueOrders.length > 0
        ? Number((totalRevenue / validRevenueOrders.length).toFixed(2))
        : 0;

    //---->>> 6. CUSTOMER INSIGHTS

    const customerOrderMap = new Map();

    for (const order of validRevenueOrders) {
      if (!order.customer) {
        continue;
      }

      const customerId = order.customer.toString();

      const currentCount = customerOrderMap.get(customerId) || 0;

      customerOrderMap.set(customerId, currentCount + 1);
    }

    const customerOrderCounts = Array.from(customerOrderMap.values());

    const totalCustomers = customerOrderCounts.length;

    const newCustomers = customerOrderCounts.filter(
      (count) => count === 1,
    ).length;

    const returningCustomers = customerOrderCounts.filter(
      (count) => count > 1,
    ).length;

    //---->>>> 7. PRODUCTS

    const totalProducts = await Product.countDocuments({
      seller: sellerObjectId,
    });

    const activeProducts = await Product.countDocuments({
      seller: sellerObjectId,
      isActive: true,
      isAvailable: true,
    });

    //---->>>> 8. TOP PRODUCTS

    const productSales = new Map();

    for (const order of validRevenueOrders) {
      const items = Array.isArray(order.items) ? order.items : [];

      for (const item of items) {
        let productId = null;

        if (item.product?._id) {
          productId = item.product._id;
        } else if (item.product) {
          productId = item.product;
        } else if (item.productId) {
          productId = item.productId;
        }

        if (!productId) {
          continue;
        }

        const key = productId.toString();

        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        const safeQuantity = Number.isFinite(quantity) ? quantity : 0;

        const safePrice = Number.isFinite(price) ? price : 0;

        if (!productSales.has(key)) {
          productSales.set(key, {
            productId: key,
            name: item.name || "Unknown Product",
            quantitySold: 0,
            revenue: 0,
          });
        }

        const product = productSales.get(key);

        product.quantitySold += safeQuantity;
        product.revenue += safeQuantity * safePrice;
      }
    }

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => {
        return b.quantitySold - a.quantitySold;
      })
      .slice(0, 5)
      .map((product) => ({
        productId: product.productId,
        name: product.name,
        quantitySold: product.quantitySold,
        revenue: Number(product.revenue.toFixed(2)),
      }));

    //--->>> 9. SALES OVERVIEW

    const salesMap = new Map();

    const addSalesEntry = (key, label, date) => {
      if (!salesMap.has(key)) {
        salesMap.set(key, {
          day: label,
          date,
          revenue: 0,
          orders: 0,
        });
      }
    };

    //---->>>> 9A. CREATE DAILY BUCKETS

    if (period === "7d" || period === "30d") {
      const days = period === "7d" ? 7 : 30;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);

        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const key = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-");

        const label = date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });

        addSalesEntry(key, label, key);
      }
    }

    //----->>>> 9B. CREATE MONTHLY BUCKETS
    else if (period === "3m" || period === "6m" || period === "1y") {
      const months = period === "3m" ? 3 : period === "6m" ? 6 : 12;

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        date.setHours(0, 0, 0, 0);

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;

        const label = date.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });

        addSalesEntry(key, label, key);
      }
    }

    //---->>>>> 9C. ALL TIME MONTHLY BUCKETS
    else if (period === "all") {
      if (orders.length > 0) {
        const firstOrderDate = new Date(orders[0].createdAt);

        const firstMonth = new Date(
          firstOrderDate.getFullYear(),
          firstOrderDate.getMonth(),
          1,
        );

        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const cursor = new Date(firstMonth);

        while (cursor <= currentMonth) {
          const key = `${cursor.getFullYear()}-${String(
            cursor.getMonth() + 1,
          ).padStart(2, "0")}`;

          const label = cursor.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          });

          addSalesEntry(key, label, key);

          cursor.setMonth(cursor.getMonth() + 1);
        }
      }
    }

    //------>>> 9D. ADD ORDER DATA TO BUCKETS

    for (const order of validRevenueOrders) {
      if (!order.createdAt) {
        continue;
      }

      const orderDate = new Date(order.createdAt);

      if (Number.isNaN(orderDate.getTime())) {
        continue;
      }

      let key;

      // DAILY
      if (period === "7d" || period === "30d") {
        key = [
          orderDate.getFullYear(),
          String(orderDate.getMonth() + 1).padStart(2, "0"),
          String(orderDate.getDate()).padStart(2, "0"),
        ].join("-");
      }

      // MONTHLY
      else {
        key = `${orderDate.getFullYear()}-${String(
          orderDate.getMonth() + 1,
        ).padStart(2, "0")}`;
      }

      const salesEntry = salesMap.get(key);

      if (!salesEntry) {
        continue;
      }

      const orderTotal = Number(order.total || 0);

      salesEntry.revenue += Number.isFinite(orderTotal) ? orderTotal : 0;

      salesEntry.orders += 1;
    }

    //---->>>> 9E. FINAL SALES OVERVIEW

    const salesOverview = Array.from(salesMap.values()).map((item) => ({
      day: item.day,
      date: item.date,
      revenue: Number(item.revenue.toFixed(2)),
      orders: item.orders,
    }));

    //--->>>> 10. RESPONSE

    return res.status(200).json({
      success: true,

      analytics: {
        period,

        totalRevenue: Number(totalRevenue.toFixed(2)),

        totalOrders,

        averageOrderValue,

        totalCustomers,

        newCustomers,

        returningCustomers,

        totalProducts,

        activeProducts,

        pendingOrders,

        activeOrders,

        deliveredOrders,

        cancelledOrders,

        topProducts,

        salesOverview,
      },
    });
  } catch (error) {
    console.error("Seller analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller analytics.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
