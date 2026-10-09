import Seller from "../models/Seller.js";
import Shop from "../models/Shop.js";

export const getSellerSettings = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller?.id || req.user?.id).select(
      "-password",
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    const shop = await Shop.findOne({
      seller: seller._id,
      isActive: true,
    });

    return res.status(200).json({
      success: true,

      settings: {
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone,

        shop: shop
          ? {
              id: shop._id,
              name: shop.name,
              category: shop.category,
              description: shop.description,
              phone: shop.phone,
              email: shop.email,
              location: shop.location,
              image: shop.image,
              openingHours: shop.openingHours,
              acceptOrders: shop.acceptOrders,
              deliveryAvailable: shop.deliveryAvailable,
              minimumOrder: shop.minimumOrder,
              isActive: shop.isActive,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get seller settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller settings.",
    });
  }
};

export const updateSellerSettings = async (req, res) => {
  try {
    const sellerId = req.seller?.id || req.user?.id;

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    const shop = await Shop.findOne({
      seller: sellerId,
      isActive: true,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    const {
      name,
      category,
      description,
      phone,
      email,
      acceptOrders,
      deliveryAvailable,
      minimumOrder,
    } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Shop name cannot be empty.",
        });
      }

      shop.name = String(name).trim();
    }

    if (category !== undefined) {
      shop.category = String(category).trim();
    }

    if (description !== undefined) {
      shop.description = String(description).trim();
    }

    if (phone !== undefined) {
      shop.phone = String(phone).trim();
    }

    if (email !== undefined) {
      shop.email = String(email).trim().toLowerCase();
    }

    if (acceptOrders !== undefined) {
      shop.acceptOrders =
        String(acceptOrders) === "true" || acceptOrders === true;
    }

    if (deliveryAvailable !== undefined) {
      shop.deliveryAvailable =
        String(deliveryAvailable) === "true" || deliveryAvailable === true;
    }

    if (minimumOrder !== undefined) {
      const value = Number(minimumOrder);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid minimum order.",
        });
      }

      shop.minimumOrder = value;
    }

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      settings: {
        shop,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone,
      },
    });
  } catch (error) {
    console.error("Update seller settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update settings.",
    });
  }
};
