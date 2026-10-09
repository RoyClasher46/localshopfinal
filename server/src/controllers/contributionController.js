import mongoose from "mongoose";

import UserContribution from "../models/UserContribution.js";
import Shop from "../models/Shop.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

//---->>> HELPERS

const parseJSON = (value) => {
  if (!value) return {};

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getFile = (files, fieldName) => {
  return files?.[fieldName]?.[0] || null;
};

const getFiles = (files, fieldName) => {
  return files?.[fieldName] || [];
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};

const isValidLatitude = (value) => {
  const latitude = Number(value);

  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
};

const isValidLongitude = (value) => {
  const longitude = Number(value);

  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
};

//--->>> ERROR FORMATTER

const getValidationErrors = (validationError) => {
  const errors = {};

  for (const [field, error] of Object.entries(validationError?.errors || {})) {
    errors[field] = error.message;
  }

  return errors;
};

export const submitContribution = async (req, res) => {
  let createdDocument = null;

  try {
    //--->>> AUTHENTICATED USER

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user.",
      });
    }

    //--->>>> CONTRIBUTION TYPE

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Contribution type is required.",
      });
    }

    if (type !== "shop") {
      return res.status(400).json({
        success: false,
        message: "Contribution type must be 'shop'.",
      });
    }

    //-->> PARSE DATA

    const data = parseJSON(req.body.data);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Contribution data must be a valid JSON object.",
      });
    }

    //--->>> FILES

    const files = req.files || {};

    if (type === "shop") {
      const shopLogo = getFile(files, "shopLogo");
      const shopBanner = getFile(files, "shopBanner");
      const shopGallery = getFiles(files, "shopGallery");

      const requiredFields = [
        "shopName",
        "category",
        "shopAddress",
        "shopPhone",
        "shopOpeningTime",
        "shopClosingTime",
        "shopLatitude",
        "shopLongitude",
        "shopCity",
        "shopState",
      ];

      const missingFields = requiredFields.filter(
        (field) =>
          data[field] === undefined ||
          data[field] === null ||
          String(data[field]).trim() === "",
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Required shop fields are missing.",
          fields: missingFields,
        });
      }

      //--->>> COORDINATES

      if (!isValidLatitude(data.shopLatitude)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid shop latitude. Latitude must be between -90 and 90.",
          fields: ["shopLatitude"],
        });
      }

      if (!isValidLongitude(data.shopLongitude)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid shop longitude. Longitude must be between -180 and 180.",
          fields: ["shopLongitude"],
        });
      }

      //---->>> REQUIRED BANNER

      if (!shopBanner) {
        return res.status(400).json({
          success: false,
          message: "Shop banner image is required.",
          fields: ["shopBanner"],
        });
      }

      //--->> UPLOAD LOGO

      const uploadedLogo = shopLogo
        ? await uploadToCloudinary(
            shopLogo.buffer,
            "shoplocal/contributions/shops/logo",
          )
        : null;

      //--->>> UPLOAD BANNER

      const uploadedBanner = await uploadToCloudinary(
        shopBanner.buffer,
        "shoplocal/contributions/shops/banner",
      );

      //--->>> UPLOAD GALLERY

      const uploadedGallery = [];

      for (const file of shopGallery) {
        const uploaded = await uploadToCloudinary(
          file.buffer,
          "shoplocal/contributions/shops/gallery",
        );

        uploadedGallery.push(uploaded);
      }

      //--->>> BUILD SHOP

      const shopData = {
        name: String(data.shopName).trim(),

        category: String(data.category).trim(),

        description: data.shopDescription
          ? String(data.shopDescription).trim()
          : data.shopAbout
            ? String(data.shopAbout).trim()
            : "",

        about: data.shopAbout ? String(data.shopAbout).trim() : "",

        phone: data.shopPhone ? String(data.shopPhone).trim() : "",

        email: data.shopEmail ? String(data.shopEmail).trim() : "",

        image: uploadedBanner.url,

        logo: uploadedLogo?.url || "",

        gallery: uploadedGallery.map((image) => image.url),

        //--->>> LOCATION

        location: {
          address: String(data.shopAddress).trim(),

          city: String(data.shopCity).trim(),

          state: String(data.shopState).trim(),

          pincode: data.shopPincode ? String(data.shopPincode).trim() : "",

          coordinates: {
            type: "Point",

            // GeoJSON = [longitude, latitude]
            coordinates: [
              parseNumber(data.shopLongitude),
              parseNumber(data.shopLatitude),
            ],
          },
        },

        //--->>> OPENING HOURS

        openingHours: {
          monday: {
            open: data.shopOpeningTime,
            close: data.shopClosingTime,
            closed: false,
          },

          tuesday: {
            open: data.shopOpeningTime,
            close: data.shopClosingTime,
            closed: false,
          },

          wednesday: {
            open: data.shopOpeningTime,
            close: data.shopClosingTime,
            closed: false,
          },

          thursday: {
            open: data.shopOpeningTime,
            close: data.shopClosingTime,
            closed: false,
          },

          friday: {
            open: data.shopOpeningTime,
            close: data.shopClosingTime,
            closed: false,
          },

          saturday: {
            open: data.shopOpeningTime,
            close: data.shopClosingTime,
            closed: false,
          },

          sunday: {
            open: data.shopOpeningTime,
            close: data.shopClosingTime,
            closed: false,
          },
        },

        //-->>> DEFAULT SETTINGS

        acceptOrders: true,

        deliveryAvailable: false,

        takeawayAvailable: true,

        deliveryRadius: 0,

        minimumOrder: 0,

        paymentMethods: ["Cash", "UPI"],

        verification: {
          isVerified: true,
          isRegistered: true,
          isCommunityListed: true,
          verifiedAt: new Date(),
        },

        isActive: true,

        isSuspended: false,

        facilities: [],

        policies: [],
      };

      //---->>>> VALIDATE SHOP

      const shopDocument = new Shop(shopData);

      try {
        await shopDocument.validate();
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: "Invalid shop data.",
          errors: getValidationErrors(validationError),
        });
      }

      //--->>> NORMALIZE

      const normalizedData = shopDocument.toObject({
        depopulate: true,
      });

      normalizedData.verification = {
        isVerified: true,
        isRegistered: true,
        isCommunityListed: true,
        verifiedAt: new Date(),
      };

      createdDocument = await Shop.create(normalizedData);

      const contribution = await UserContribution.create({
        type: "shop",

        submittedBy: userId,

        data: normalizedData,

        //-->>> AUTOMATIC APPROVAL
        status: "approved",

        reviewedAt: new Date(),

        reviewedBy: null,

        //--->>> REAL SHOP ID
        promotedDocumentId: createdDocument._id,

        promotedModel: "Shop",
      });

      //--->>> SUCCESS

      return res.status(201).json({
        success: true,

        message: "Shop contribution submitted and automatically approved.",

        autoApproved: true,

        contribution: {
          id: contribution._id,

          type: contribution.type,

          status: contribution.status,

          submittedBy: contribution.submittedBy,

          promotedDocumentId: contribution.promotedDocumentId,

          promotedModel: contribution.promotedModel,

          createdAt: contribution.createdAt,

          reviewedAt: contribution.reviewedAt,
        },

        shop: {
          id: createdDocument._id,

          name: createdDocument.name,

          status: "approved",

          isActive: createdDocument.isActive,
        },
      });
    }


    return res.status(400).json({
      success: false,
      message: "Unsupported contribution type.",
    });
  } catch (error) {
    console.error("submitContribution error:", error);

    //-->> CLEANUP CREATED DOCUMENT

    if (createdDocument?._id) {
      try {
        await Shop.findByIdAndDelete(createdDocument._id);
      } catch (cleanupError) {
        console.error("Contribution cleanup error:", cleanupError);
      }
    }

    //--->>> MULTER ERROR
    if (error.name === "MulterError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    //---->>>> DUPLICATE KEY

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A contribution with the same information already exists.",
      });
    }

    //---->>> GENERAL ERROR

    return res.status(500).json({
      success: false,
      message: "Failed to submit contribution.",
    });
  }
};
