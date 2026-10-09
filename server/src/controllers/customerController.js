import mongoose from "mongoose";
import Order from "../models/Order.js";

//--->> HELPERS

const getSellerId = (req) => {
  return req.seller?.id || req.seller?._id;
};

//--->>> GET SELLER CUSTOMERS
// GET /api/customers
// SELLER ONLY

export const getSellerCustomers = async (req, res) => {
  try {
    const sellerId = getSellerId(req);

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    const { search = "", status = "" } = req.query;

    // Get all orders belonging to this seller

    const orders = await Order.find({
      seller: sellerId,
    })
      .populate("customer", "name email phone addresses isBlocked")

      .sort({ createdAt: -1 });

    const customerMap = new Map();

    for (const order of orders) {
      if (!order.customer) continue;

      const userId = order.customer._id.toString();

      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          user: order.customer,
          ordersCount: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalSpent: 0,
          lastOrder: order.createdAt,
        });
      }

      const customer = customerMap.get(userId);

      customer.ordersCount += 1;

      if (order.status === "Delivered") {
        customer.completedOrders += 1;
      }

      if (order.status === "Cancelled") {
        customer.cancelledOrders += 1;
      }

      customer.totalSpent += Number(order.total || 0);

      if (
        !customer.lastOrder ||
        new Date(order.createdAt) > new Date(customer.lastOrder)
      ) {
        customer.lastOrder = order.createdAt;
      }
    }

    // Convert map to array

    let customers = Array.from(customerMap.values());

    // Search

    if (search.trim()) {
      const searchText = search.trim().toLowerCase();

      customers = customers.filter((customer) => {
        const name = customer.user.name?.toLowerCase() || "";
        const email = customer.user.email?.toLowerCase() || "";
        const phone = customer.user.phone?.toLowerCase() || "";

        return (
          name.includes(searchText) ||
          email.includes(searchText) ||
          phone.includes(searchText)
        );
      });
    }

    //--->>> Customer status

    customers = customers.map((customer) => {
      const daysSinceLastOrder = customer.lastOrder
        ? (Date.now() - new Date(customer.lastOrder).getTime()) /
          (1000 * 60 * 60 * 24)
        : null;

      const status =
        daysSinceLastOrder !== null && daysSinceLastOrder <= 30
          ? "Active"
          : "Inactive";

      return {
        id: customer.user._id,

        name: customer.user.name || "",
        email: customer.user.email || "",
        phone: customer.user.phone || "",

        addresses: customer.user.addresses || [],

        totalOrders: customer.ordersCount,

        completedOrders: customer.completedOrders,

        cancelledOrders: customer.cancelledOrders,

        totalSpent: customer.totalSpent,

        lastOrder: customer.lastOrder || null,

        status,
      };
    });

    //--->> Status filter

    if (status.trim()) {
      customers = customers.filter(
        (customer) => customer.status.toLowerCase() === status.toLowerCase(),
      );
    }

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get seller customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customers.",
    });
  }
};

//---->>> GET CUSTOMER DETAILS
// GET /api/customers/:id
// SELLER ONLY

export const getCustomerDetails = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const customerId = req.params.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    // Validate customer ID

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const orders = await Order.find({
      seller: sellerId,
      customer: customerId,
    })
      .sort({ createdAt: -1 })
      .populate("customer", "name email phone addresses isBlocked");

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const customer = orders[0].customer;

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer information not found.",
      });
    }

    // Calculate customer statistics

    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    const completedOrders = orders.filter(
      (order) => order.status === "Delivered",
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.status === "Cancelled",
    ).length;

    const lastOrder = orders[0]?.createdAt || null;

    const daysSinceLastOrder = lastOrder
      ? (Date.now() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24)
      : null;

    const status =
      daysSinceLastOrder !== null && daysSinceLastOrder <= 30
        ? "Active"
        : "Inactive";

    const latestDeliveryAddress = orders[0]?.deliveryAddress || null;

    return res.status(200).json({
      success: true,

      customer: {
        id: customer._id,

        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",

        address: latestDeliveryAddress,

        addresses: customer.addresses || [],

        totalOrders: orders.length,
        completedOrders,
        cancelledOrders,
        totalSpent,

        lastOrder,

        status,
      },

      orders,
    });
  } catch (error) {
    console.error("Get customer details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer details.",
    });
  }
};

//---->>> GET CUSTOMER ORDERS
// GET /api/customers/:id/orders
// SELLER ONLY

export const getCustomerOrders = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const customerId = req.params.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    // Validate customer ID

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const orders = await Order.find({
      seller: sellerId,
      customer: customerId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer orders.",
    });
  }
};
