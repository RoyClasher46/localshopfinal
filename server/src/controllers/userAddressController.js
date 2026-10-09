import mongoose from "mongoose";
import User from "../models/User.js";

//--->> GET MY ADDRESSES
// GET /api/users/me/addresses
// USER

export const getMyAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: user.addresses.length,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch addresses.",
    });
  }
};

//--->>> ADD ADDRESS
// POST /api/users/me/addresses
// USER

export const addAddress = async (req, res) => {
  try {
    const {
      label,
      addressLine,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    if (!addressLine) {
      return res.status(400).json({
        success: false,
        message: "Address line is required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (isDefault === true) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    const shouldBeDefault = user.addresses.length === 0 || isDefault === true;

    user.addresses.push({
      label: label || "Home",
      addressLine: addressLine.trim(),
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude,
      longitude,
      isDefault: shouldBeDefault,
    });

    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add address.",
    });
  }
};

//--->>> UPDATE ADDRESS
// PUT /api/users/me/addresses/:id
// USER

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const {
      label,
      addressLine,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    if (addressLine !== undefined) {
      if (!addressLine.trim()) {
        return res.status(400).json({
          success: false,
          message: "Address line cannot be empty.",
        });
      }

      address.addressLine = addressLine.trim();
    }

    if (label !== undefined) {
      address.label = label;
    }

    if (city !== undefined) {
      address.city = city;
    }

    if (state !== undefined) {
      address.state = state;
    }

    if (pincode !== undefined) {
      address.pincode = pincode;
    }

    if (latitude !== undefined) {
      address.latitude = latitude;
    }

    if (longitude !== undefined) {
      address.longitude = longitude;
    }

    if (isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });

      address.isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update address.",
    });
  }
};

//--->> DELETE ADDRESS
// DELETE /api/users/me/addresses/:id
// USER

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const wasDefault = Boolean(address.isDefault);

    address.deleteOne();

    if (wasDefault) {
      const remainingAddresses = user.addresses.filter(
        (item) => String(item._id) !== String(id),
      );

      remainingAddresses.forEach((item) => {
        item.isDefault = false;
      });

      if (remainingAddresses.length > 0) {
        remainingAddresses[0].isDefault = true;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address removed successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete address.",
    });
  }
};
