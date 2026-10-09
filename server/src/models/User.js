import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    addresses: [
      {
        label: {
          type: String,
          default: "Home",
        },

        addressLine: {
          type: String,
          required: true,
        },

        city: String,
        state: String,
        pincode: String,

        latitude: Number,
        longitude: Number,

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
