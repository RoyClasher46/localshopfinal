import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

//--->>> HELPERS

const getUserId = (req) => {
  return req.user?.id || req.user?._id;
};

const getSellerId = (req) => {
  return req.seller?.id || req.seller?._id;
};

const validId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

//---->>> CREATE ORDER
// POST /api/orders
// USER ONLY

export const createOrder = async (req, res) => {
  const reservedItems = [];

  try {
    const userId = getUserId(req);

    if (!userId) {
      throw Object.assign(new Error("User authentication required."), {
        statusCode: 401,
      });
    }

    const { items, deliveryAddress, paymentMethod = "COD" } = req.body;

    // VALIDATE ITEMS

    if (!Array.isArray(items) || items.length === 0) {
      throw Object.assign(
        new Error("Order must contain at least one product."),
        {
          statusCode: 400,
        },
      );
    }

    //---->> VALIDATE DELIVERY ADDRESS

    if (!deliveryAddress) {
      throw Object.assign(new Error("Delivery address is required."), {
        statusCode: 400,
      });
    }

    if (
      !deliveryAddress.name ||
      !deliveryAddress.phone ||
      !deliveryAddress.addressLine ||
      !deliveryAddress.city ||
      !deliveryAddress.pincode
    ) {
      throw Object.assign(
        new Error("Complete delivery address is required."),
        {
          statusCode: 400,
        },
      );
    }

    // VALIDATE PAYMENT

    if (!["COD", "Online"].includes(paymentMethod)) {
      throw Object.assign(new Error("Invalid payment method."), {
        statusCode: 400,
      });
    }

    // VALIDATE PRODUCT IDS

    for (const item of items) {
      if (!item?.productId || !validId(item.productId)) {
        throw Object.assign(new Error("Invalid product ID."), {
          statusCode: 400,
        });
      }
    }

    const mergedItemsMap = new Map();

    for (const item of items) {
      const productId = item.productId.toString();
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw Object.assign(new Error("Invalid product quantity."), {
          statusCode: 400,
        });
      }

      if (mergedItemsMap.has(productId)) {
        mergedItemsMap.get(productId).quantity += quantity;
      } else {
        mergedItemsMap.set(productId, {
          productId,
          quantity,
        });
      }
    }

    const normalizedItems = Array.from(mergedItemsMap.values());

    // LOAD PRODUCTS FROM DATABASE

    const productIds = normalizedItems.map((item) => item.productId);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },

      isActive: true,

      isAvailable: true,
    });

    if (products.length !== new Set(productIds.map(String)).size) {
      throw Object.assign(
        new Error("One or more products are unavailable."),
        {
          statusCode: 400,
        },
      );
    }

    //--->>>> ONE SHOP PER ORDER

    const shopIds = [
      ...new Set(products.map((product) => product.shop.toString())),
    ];

    if (shopIds.length !== 1) {
      throw Object.assign(
        new Error(
          "Products from different shops must be ordered separately.",
        ),
        {
          statusCode: 400,
        },
      );
    }

    //--->>> ONE SELLER PER ORDER

    const sellerIds = [
      ...new Set(products.map((product) => product.seller.toString())),
    ];

    if (sellerIds.length !== 1) {
      throw Object.assign(
        new Error(
          "Products from different sellers must be ordered separately.",
        ),
        {
          statusCode: 400,
        },
      );
    }

    const orderItems = [];

    let subtotal = 0;

    let discount = 0;

    for (const requestedItem of normalizedItems) {
      const product = products.find(
        (item) => item._id.toString() === requestedItem.productId.toString(),
      );

      if (!product) {
        throw Object.assign(new Error("Product not found."), {
          statusCode: 400,
        });
      }

      const quantity = Number(requestedItem.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw Object.assign(
          new Error(`Invalid quantity for ${product.name}.`),
          {
            statusCode: 400,
          },
        );
      }

      //--->>> CHECK STOCK

      const availableStock =
        Number(product.stock) - Number(product.reservedStock || 0);

      if (availableStock < quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for ${product.name}.`),
          {
            statusCode: 400,
          },
        );
      }

      const originalPrice = Number(product.price) || 0;

      const discountPercent = Number(product.discount) || 0;

      const itemDiscount = Math.round(
        (originalPrice * discountPercent * quantity) / 100,
      );

      const discountedUnitPrice = Math.round(
        originalPrice - (originalPrice * discountPercent) / 100,
      );

      const itemSubtotal = originalPrice * quantity;

      const itemTotal = discountedUnitPrice * quantity;

      subtotal += itemSubtotal;

      discount += itemDiscount;

      orderItems.push({
        product: product._id,

        name: product.name,

        image: product.image || "",

        quantity,

        price: discountedUnitPrice,

        originalPrice,

        discountPercent,

        subtotal: itemTotal,

        reserved: true,
      });
    }

    const deliveryFee = 0;

    const total = subtotal - discount + deliveryFee;

    for (const requestedItem of normalizedItems) {
      const quantity = Number(requestedItem.quantity);

      const productId = requestedItem.productId;

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,

          isActive: true,

          isAvailable: true,

          $expr: {
            $gte: [
              {
                $subtract: [
                  "$stock",
                  {
                    $ifNull: ["$reservedStock", 0],
                  },
                ],
              },
              quantity,
            ],
          },
        },
        {
          $inc: {
            reservedStock: quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        const product = products.find(
          (item) => item._id.toString() === productId.toString(),
        );

        throw Object.assign(
          new Error(`Insufficient stock for ${product?.name || "product"}.`),
          {
            statusCode: 400,
          },
        );
      }

      reservedItems.push({ productId, quantity });

      //-->> UPDATE AVAILABILITY

      const availableStock =
        Number(updatedProduct.stock) -
        Number(updatedProduct.reservedStock || 0);

      await Product.updateOne(
        {
          _id: updatedProduct._id,
        },
        {
          $set: {
            isAvailable: availableStock > 0,
          },
        },
      );
    }

    //--->>>> CREATE ORDER

    const createdOrder = await Order.create({
      customer: userId,

      seller: sellerIds[0],

      shop: shopIds[0],

      items: orderItems,

      subtotal,

      discount,

      deliveryFee,

      total,

      deliveryAddress: {
        name: deliveryAddress.name.trim(),

        phone: deliveryAddress.phone.trim(),

        addressLine: deliveryAddress.addressLine.trim(),

        city: deliveryAddress.city.trim(),

        state: deliveryAddress.state ? deliveryAddress.state.trim() : "",

        pincode: deliveryAddress.pincode.trim(),
      },

      paymentMethod,

      paymentStatus: "Pending",

      status: "Pending",
    });

    return res.status(201).json({
      success: true,

      message: "Order placed successfully.",

      order: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    // Rollback any reserved stock if order creation failed
    for (const resItem of reservedItems) {
      await Product.updateOne(
        { _id: resItem.productId },
        {
          $inc: { reservedStock: -resItem.quantity },
          $set: { isAvailable: true },
        },
      ).catch(() => {});
    }

    const statusCode = error.statusCode || 500;
    const message =
      error.statusCode || process.env.NODE_ENV !== "production"
        ? error.message
        : "Unable to create order.";

    return res.status(statusCode).json({
      success: false,

      message,
    });
  }
};

//--->>> GET MY ORDERS
// GET /api/orders/my
// USER ONLY

export const getMyOrders = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const { status } = req.query;

    const filter = {
      customer: userId,
    };

    if (status && status !== "All") {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("seller", "ownerName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
};

//--->>> GET SINGLE USER ORDER
// GET /api/orders/:id
// USER ONLY

export const getMyOrderById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: id,
      customer: userId,
    }).populate("seller", "ownerName email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order.",
    });
  }
};

//--->>> CANCEL MY ORDER
// PUT /api/orders/:id/cancel
// USER ONLY

export const cancelMyOrder = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: id,
      customer: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "This order is already final and cannot be changed.",
      });
    }

    order.status = "Cancelled";

    order.cancelledBy = "Customer";

    order.paymentStatus =
      order.paymentMethod === "COD" ? "Cancelled" : order.paymentStatus;

    order.cancellationReason = req.body.reason || "Cancelled by customer.";

    for (const item of order.items) {
      if (!item.reserved) {
        continue;
      }

      const product = await Product.findById(item.product);

      if (product) {
        product.reservedStock = Math.max(
          0,
          Number(product.reservedStock || 0) - Number(item.quantity),
        );

        const availableStock =
          Number(product.stock) - Number(product.reservedStock || 0);

        product.isAvailable = availableStock > 0;

        await product.save();
      }

      item.reserved = false;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel order.",
    });
  }
};

//--->>> GET SELLER ORDERS
// GET /api/orders/seller
// SELLER ONLY

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = getSellerId(req);

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    const { search, status } = req.query;

    const filter = {
      seller: sellerId,
    };

    if (status && status !== "All") {
      filter.status = status;
    }

    let orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    if (search?.trim()) {
      const query = search.trim().toLowerCase();

      orders = orders.filter((order) => {
        return (
          order.orderNumber?.toLowerCase().includes(query) ||
          order.customer?.name?.toLowerCase().includes(query) ||
          order.customer?.phone?.toLowerCase().includes(query)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller orders.",
    });
  }
};

//--->>>> GET SELLER ORDER
// GET /api/orders/seller/:id
// SELLER ONLY

export const getSellerOrderById = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: id,
      seller: sellerId,
    }).populate("customer", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get seller order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order.",
    });
  }
};

//--->>> UPDATE SELLER ORDER STATUS
// PUT /api/orders/seller/:id/status
// SELLER ONLY

export const updateOrderStatus = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { id } = req.params;
    const { status } = req.body;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const validStatuses = [
      "Pending",
      "Accepted",
      "Preparing",
      "Ready",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findOne({
      _id: id,
      seller: sellerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this seller.",
      });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Final orders cannot be changed.",
      });
    }

    const allowedTransitions = {
      Pending: ["Accepted", "Cancelled"],
      Accepted: ["Preparing", "Cancelled"],
      Preparing: ["Ready", "Cancelled"],
      Ready: ["Delivered", "Cancelled"],
    };

    const allowedNextStatuses = allowedTransitions[order.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order from ${order.status} to ${status}.`,
      });
    }

    order.status = status;

    if (status === "Delivered") {
      order.paymentStatus = "Paid";

      //-->>> FINALIZE STOCK

      for (const item of order.items) {
        if (!item.reserved) {
          continue;
        }

        const product = await Product.findById(item.product);

        if (!product) {
          continue;
        }

        const quantity = Number(item.quantity);

        product.reservedStock = Math.max(
          0,
          Number(product.reservedStock || 0) - quantity,
        );

        product.stock = Math.max(0, Number(product.stock) - quantity);

        const availableStock =
          Number(product.stock) - Number(product.reservedStock || 0);

        product.isAvailable = availableStock > 0;

        await product.save();

        item.reserved = false;
      }
    }

    if (status === "Cancelled") {
      order.paymentStatus =
        order.paymentMethod === "COD" ? "Cancelled" : order.paymentStatus;

      order.cancelledBy = "Seller";

      order.cancellationReason = req.body.reason || "Cancelled by seller.";

      for (const item of order.items) {
        if (!item.reserved) {
          continue;
        }

        const product = await Product.findById(item.product);

        if (product) {
          product.reservedStock = Math.max(
            0,
            Number(product.reservedStock || 0) - Number(item.quantity),
          );

          const availableStock =
            Number(product.stock) - Number(product.reservedStock || 0);

          product.isAvailable = availableStock > 0;

          await product.save();

          item.reserved = false;
        }
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update order status.",
    });
  }
};
