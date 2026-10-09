import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    reserved: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryAddress: {
      type: addressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled", "Failed"],
      default: "Pending",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Preparing",
        "Ready",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    cancelledBy: {
      type: String,
      enum: ["Customer", "Seller", null],
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

//--->>>> GENERATE ORDER NUMBER

// Format: ORD-YYYYMMDD-XXXXXX
// Example: ORD-20260828-X7K92A

function generateOrderNumber() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let randomCode = "";

  for (let i = 0; i < 6; i++) {
    randomCode += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return `ORD-${year}${month}${day}-${randomCode}`;
}

orderSchema.pre("save", function () {
  if (!this.isNew || this.orderNumber) {
    return;
  }

  this.orderNumber = generateOrderNumber();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
