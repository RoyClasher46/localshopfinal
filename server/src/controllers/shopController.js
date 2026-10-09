import mongoose from "mongoose";

import Seller from "../models/Seller.js";
import Shop from "../models/Shop.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import geocodeAddress from "../utils/geocodeAddress.js";

const MAX_GALLERY_IMAGES = 4;

const DEFAULT_PAYMENT_METHODS = ["Cash", "UPI"];

const DEFAULT_DELIVERY_RADIUS = 5;

const DEFAULT_MINIMUM_ORDER = 0;

//--->>> CUSTOM VALIDATION ERROR

class RequestValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "RequestValidationError";
    this.field = field;
    this.statusCode = 400;
  }
}

const isDefined = (value) =>
  value !== undefined && value !== null && value !== "";

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object || {}, key);

const trimString = (value) => String(value ?? "").trim();

const normalizeEmail = (value) => trimString(value).toLowerCase();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

const isValidPincode = (pincode) => {
  return /^[0-9]{6}$/.test(trimString(pincode));
};

const getFilesForField = (files, fieldName) => {
  if (!files) {
    return [];
  }

  if (Array.isArray(files)) {
    return [];
  }

  if (typeof files !== "object") {
    return [];
  }

  const fieldFiles = files[fieldName];

  if (!Array.isArray(fieldFiles)) {
    return [];
  }

  return fieldFiles.filter(
    (file) => file && typeof file === "object" && Buffer.isBuffer(file.buffer),
  );
};

const getFirstFile = (files, fieldName) => {
  const fieldFiles = getFilesForField(files, fieldName);

  return fieldFiles[0] || null;
};

const parseJSONField = (value, fallback, fieldName = "field") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return fallback;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      throw new RequestValidationError(
        `${fieldName} must contain valid JSON.`,
        fieldName,
      );
    }
  }

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  throw new RequestValidationError(
    `${fieldName} must contain valid JSON.`,
    fieldName,
  );
};

//--->>> REQUIRED JSON OBJECT

const parseJSONObjectField = (value, fallback, fieldName) => {
  const parsed = parseJSONField(value, fallback, fieldName);

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new RequestValidationError(
      `${fieldName} must be a JSON object.`,
      fieldName,
    );
  }

  return parsed;
};

//--->>> JSON ARRAY OF STRINGS

const parseStringArrayField = (value, fallback, fieldName) => {
  const parsed = parseJSONField(value, fallback, fieldName);

  if (!Array.isArray(parsed)) {
    throw new RequestValidationError(
      `${fieldName} must be an array.`,
      fieldName,
    );
  }

  const normalized = parsed.map((item, index) => {
    if (typeof item !== "string") {
      throw new RequestValidationError(
        `${fieldName}[${index}] must be a string.`,
        fieldName,
      );
    }

    const trimmed = item.trim();

    if (!trimmed) {
      throw new RequestValidationError(
        `${fieldName}[${index}] cannot be empty.`,
        fieldName,
      );
    }

    return trimmed;
  });

  return normalized;
};

//--->> BOOLEAN PARSER

const parseBoolean = (value, defaultValue, fieldName = "field") => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  throw new RequestValidationError(
    `${fieldName} must be a boolean.`,
    fieldName,
  );
};

//--->>> NUMBER PARSER

const parseNonNegativeNumber = (value, defaultValue, fieldName = "field") => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "string" && !value.trim()) {
    return defaultValue;
  }

  const number =
    typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isFinite(number) || number < 0) {
    throw new RequestValidationError(
      `${fieldName} must be a valid non-negative number.`,
      fieldName,
    );
  }

  return number;
};

//--->>> COORDINATE VALIDATION

const validateCoordinates = (latitude, longitude) => {
  const lat =
    typeof latitude === "number" ? latitude : Number(String(latitude).trim());

  const lng =
    typeof longitude === "number"
      ? longitude
      : Number(String(longitude).trim());

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return {
    latitude: lat,
    longitude: lng,
  };
};

const parseExplicitCoordinates = (latitude, longitude) => {
  const hasLatitude = isDefined(latitude);
  const hasLongitude = isDefined(longitude);

  if (!hasLatitude && !hasLongitude) {
    return null;
  }

  if (!hasLatitude || !hasLongitude) {
    throw new RequestValidationError(
      "Both latitude and longitude are required when updating coordinates.",
      "coordinates",
    );
  }

  const coordinates = validateCoordinates(latitude, longitude);

  if (!coordinates) {
    throw new RequestValidationError(
      "Invalid latitude or longitude.",
      "coordinates",
    );
  }

  return coordinates;
};

//--->>> CREATE GEO LOCATION

const createGeoLocation = ({
  address,
  city,
  state,
  pincode,
  latitude,
  longitude,
}) => {
  const coordinates = validateCoordinates(latitude, longitude);

  return {
    address: trimString(address),
    city: trimString(city),
    state: trimString(state),
    pincode: trimString(pincode),

    coordinates: {
      type: "Point",
      coordinates: coordinates
        ? [coordinates.longitude, coordinates.latitude]
        : [0, 0],
    },
  };
};

//-->>> GET EXISTING SHOP COORDINATES

const getShopCoordinates = (shop) => {
  const coordinates = shop?.location?.coordinates?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return null;
  }

  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  return validateCoordinates(latitude, longitude);
};

const buildShopResponse = (shop) => {
  const data = shop?.toObject ? shop.toObject() : shop;

  return {
    id: data?._id,

    seller: data?.seller,

    name: data?.name,
    category: data?.category,

    description: data?.description,
    about: data?.about,

    phone: data?.phone,
    email: data?.email,

    location: data?.location,

    image: data?.image,
    logo: data?.logo,
    gallery: Array.isArray(data?.gallery) ? data.gallery : [],

    openingHours: data?.openingHours,

    acceptOrders: data?.acceptOrders ?? false,

    deliveryAvailable: data?.deliveryAvailable ?? false,

    takeawayAvailable: data?.takeawayAvailable ?? false,

    deliveryRadius: data?.deliveryRadius ?? 0,

    minimumOrder: data?.minimumOrder ?? 0,

    paymentMethods: Array.isArray(data?.paymentMethods)
      ? data.paymentMethods
      : [],

    facilities: Array.isArray(data?.facilities) ? data.facilities : [],

    policies: Array.isArray(data?.policies) ? data.policies : [],

    ratingAverage: data?.rating?.average ?? 0,

    totalReviews: data?.rating?.totalReviews ?? 0,

    ratingDistribution: data?.rating?.distribution ?? {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
    },

    isVerified: data?.verification?.isVerified ?? false,

    isRegistered: data?.verification?.isRegistered ?? true,

    isCommunityListed: data?.verification?.isCommunityListed ?? false,

    isActive: data?.isActive ?? false,

    isSuspended: data?.isSuspended ?? false,

    registeredAt: data?.registeredAt,

    createdAt: data?.createdAt,

    updatedAt: data?.updatedAt,
  };
};

//--->>> CLOUDINARY UPLOAD - SINGLE

const uploadShopImage = async (file, folder = "shoplocal/shops") => {
  if (!file) {
    return "";
  }

  if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new Error("INVALID_UPLOAD_FILE");
  }

  try {
    const uploadedImage = await uploadToCloudinary(file.buffer, folder);

    if (typeof uploadedImage === "string") {
      return uploadedImage;
    }

    return uploadedImage?.secure_url || uploadedImage?.url || "";
  } catch (error) {
    console.error("Shop image upload failed:", error);

    if (error?.message === "CLOUDINARY_NOT_CONFIGURED") {
      throw new Error("CLOUDINARY_NOT_CONFIGURED");
    }

    if (error?.message === "Must supply api_key" || error?.http_code === 401) {
      throw new Error("CLOUDINARY_CREDENTIALS_INVALID");
    }

    throw new Error("CLOUDINARY_UPLOAD_FAILED");
  }
};

//---->>> CLOUDINARY UPLOAD - MULTIPLE

const uploadShopImages = async (files = [], folder = "shoplocal/shops") => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  return Promise.all(files.map((file) => uploadShopImage(file, folder))).then(
    (images) => images.filter(Boolean),
  );
};

const handleCloudinaryError = (error, res) => {
  if (error?.message === "CLOUDINARY_NOT_CONFIGURED") {
    return res.status(503).json({
      success: false,
      message:
        "Cloudinary is not configured. Please configure your Cloudinary credentials.",
    });
  }

  if (error?.message === "CLOUDINARY_CREDENTIALS_INVALID") {
    return res.status(503).json({
      success: false,
      message:
        "Cloudinary credentials are missing or invalid. Please check the server environment variables.",
    });
  }

  if (error?.message === "CLOUDINARY_UPLOAD_FAILED") {
    return res.status(502).json({
      success: false,
      message: "Unable to upload one or more shop images. Please try again.",
    });
  }

  if (error?.message === "INVALID_UPLOAD_FILE") {
    return res.status(400).json({
      success: false,
      message: "One or more uploaded files are invalid.",
    });
  }

  return null;
};

const getDuplicateKeyMessage = (error) => {
  const keyPattern = error?.keyPattern || {};
  const keyValue = error?.keyValue || {};

  if (keyPattern.seller || keyValue.seller) {
    return "This seller already has a shop.";
  }

  if (keyPattern.email || keyValue.email) {
    return "A shop with this email already exists.";
  }

  if (keyPattern.phone || keyValue.phone) {
    return "A shop with this phone number already exists.";
  }

  const fields = Object.keys(keyPattern);

  if (fields.length > 0) {
    return `A shop with the same ${fields.join(", ")} already exists.`;
  }

  return "A shop with these details already exists.";
};

const handleMongooseError = (error, res, defaultMessage) => {
  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: getDuplicateKeyMessage(error),
    });
  }

  if (error?.name === "ValidationError") {
    const messages = Object.values(error.errors || {})
      .map((item) => item?.message)
      .filter(Boolean);

    return res.status(400).json({
      success: false,
      message:
        messages.length > 0
          ? messages.join(" ")
          : "Shop data failed validation.",
      errors: error.errors,
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${error.path || "shop data"}.`,
    });
  }

  if (
    error?.name === "MongoServerError" ||
    error?.name === "MongoNetworkError"
  ) {
    return res.status(503).json({
      success: false,
      message: "The database is temporarily unavailable. Please try again.",
    });
  }

  return res.status(500).json({
    success: false,
    message: defaultMessage,
  });
};

const validateProtectedVerificationFields = (body) => {
  const protectedFields = ["verification", "isVerified", "isRegistered"];

  const attemptedField = protectedFields.find((field) => hasOwn(body, field));

  if (attemptedField) {
    throw new RequestValidationError(
      `${attemptedField} cannot be changed by a seller.`,
      attemptedField,
    );
  }
};

const getExistingLocationParts = (shop) => ({
  address: trimString(shop?.location?.address),
  city: trimString(shop?.location?.city),
  state: trimString(shop?.location?.state),
  pincode: trimString(shop?.location?.pincode),
});

//--->> GEOCODE ADDRESS

const geocodeShopAddress = async ({ address, city, state, pincode }) => {
  try {
    const geocodedLocation = await geocodeAddress({
      address,
      city,
      state,
      pincode,
    });

    if (!geocodedLocation) {
      return null;
    }

    return validateCoordinates(
      geocodedLocation.latitude,
      geocodedLocation.longitude,
    );
  } catch (error) {
    console.error("Shop geocoding error:", error);

    return null;
  }
};

//--->>> CREATE SHOP
// POST /api/seller/shop

export const createShop = async (req, res) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid seller authentication.",
      });
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller account not found.",
      });
    }

    const existingShop = await Shop.findOne({
      seller: sellerId,
    });

    if (existingShop) {
      return res.status(409).json({
        success: false,
        message: "This seller already has a shop.",
      });
    }

    const body = req.body || {};

    const {
      name,
      category,
      description,
      about,
      phone,
      email,

      address,
      city,
      state,
      pincode,

      latitude,
      longitude,

      openingHours,
      acceptOrders,
      deliveryAvailable,
      takeawayAvailable,
      deliveryRadius,
      minimumOrder,
      paymentMethods,
      facilities,
      policies,
    } = body;

    const finalName = trimString(name);
    const finalCategory = trimString(category);
    const finalDescription = trimString(description);
    const finalAbout = trimString(about);

    if (!finalName) {
      return res.status(400).json({
        success: false,
        message: "Shop name is required.",
      });
    }

    if (!finalCategory) {
      return res.status(400).json({
        success: false,
        message: "Shop category is required.",
      });
    }

    if (!finalDescription) {
      return res.status(400).json({
        success: false,
        message: "Shop description is required.",
      });
    }

    if (!finalAbout) {
      return res.status(400).json({
        success: false,
        message: "Shop about information is required.",
      });
    }

    const finalAddress = trimString(address);
    const finalCity = trimString(city);
    const finalState = trimString(state);
    const finalPincode = trimString(pincode);

    if (!finalAddress) {
      return res.status(400).json({
        success: false,
        message: "Shop address is required.",
      });
    }

    if (!finalCity) {
      return res.status(400).json({
        success: false,
        message: "Shop city is required.",
      });
    }

    if (!finalState) {
      return res.status(400).json({
        success: false,
        message: "Shop state is required.",
      });
    }

    if (!isValidPincode(finalPincode)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 6-digit pincode.",
      });
    }

    const finalPhone = trimString(phone ?? seller.phone);

    if (!finalPhone) {
      return res.status(400).json({
        success: false,
        message: "Shop phone number is required.",
      });
    }

    const finalEmail = normalizeEmail(email ?? seller.email);

    if (!finalEmail) {
      return res.status(400).json({
        success: false,
        message: "Shop email is required.",
      });
    }

    if (!isValidEmail(finalEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const logoFile = getFirstFile(req.files, "logo");

    const imageFile = getFirstFile(req.files, "image");

    const galleryFiles = getFilesForField(req.files, "gallery");

    if (!logoFile) {
      return res.status(400).json({
        success: false,
        message: "Shop logo is required.",
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Shop banner image is required.",
      });
    }

    if (galleryFiles.length > MAX_GALLERY_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `You can upload a maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
      });
    }
    const explicitCoordinates = parseExplicitCoordinates(latitude, longitude);

    const parsedDeliveryRadius = parseNonNegativeNumber(
      deliveryRadius,
      DEFAULT_DELIVERY_RADIUS,
      "deliveryRadius",
    );

    const parsedMinimumOrder = parseNonNegativeNumber(
      minimumOrder,
      DEFAULT_MINIMUM_ORDER,
      "minimumOrder",
    );

    const parsedOpeningHours = parseJSONObjectField(
      openingHours,
      {},
      "openingHours",
    );

    const parsedPaymentMethods = parseStringArrayField(
      paymentMethods,
      DEFAULT_PAYMENT_METHODS,
      "paymentMethods",
    );

    const parsedFacilities = parseStringArrayField(
      facilities,
      [],
      "facilities",
    );

    const parsedPolicies = parseStringArrayField(policies, [], "policies");

    const parsedAcceptOrders = parseBoolean(acceptOrders, true, "acceptOrders");

    const parsedDeliveryAvailable = parseBoolean(
      deliveryAvailable,
      false,
      "deliveryAvailable",
    );

    const parsedTakeawayAvailable = parseBoolean(
      takeawayAvailable,
      true,
      "takeawayAvailable",
    );

    const location = createGeoLocation({
      address: finalAddress,
      city: finalCity,
      state: finalState,
      pincode: finalPincode,
      latitude: explicitCoordinates?.latitude,
      longitude: explicitCoordinates?.longitude,
    });

    let logo = "";
    let image = "";
    let gallery = [];

    try {
      logo = await uploadShopImage(logoFile, "shoplocal/shops/logos");

      image = await uploadShopImage(imageFile, "shoplocal/shops/banners");

      gallery = await uploadShopImages(galleryFiles, "shoplocal/shops/gallery");
    } catch (error) {
      const handled = handleCloudinaryError(error, res);

      if (handled) {
        return handled;
      }

      throw error;
    }

    if (!logo) {
      return res.status(502).json({
        success: false,
        message: "Shop logo upload failed.",
      });
    }

    if (!image) {
      return res.status(502).json({
        success: false,
        message: "Shop banner upload failed.",
      });
    }

    const shop = await Shop.create({
      seller: sellerId,

      name: finalName,

      category: finalCategory,

      description: finalDescription,

      about: finalAbout,

      phone: finalPhone,

      email: finalEmail,

      location,

      logo,

      image,

      gallery,

      openingHours: parsedOpeningHours,

      acceptOrders: parsedAcceptOrders,

      deliveryAvailable: parsedDeliveryAvailable,

      takeawayAvailable: parsedTakeawayAvailable,

      deliveryRadius: parsedDeliveryRadius,

      minimumOrder: parsedMinimumOrder,

      paymentMethods: parsedPaymentMethods,

      facilities: parsedFacilities,

      policies: parsedPolicies,

      verification: {
        isRegistered: true,
        isVerified: seller.approvalStatus === "approved",
        isCommunityListed: false,
        verifiedAt: seller.approvalStatus === "approved" ? new Date() : null,
      },

      isActive: seller.approvalStatus === "approved",

      isSuspended: false,
    });

    return res.status(201).json({
      success: true,
      message: "Shop created successfully.",
      shop: buildShopResponse(shop),
    });
  } catch (error) {
    console.error("Create shop error:", error);

    if (error instanceof RequestValidationError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        field: error.field,
      });
    }

    const cloudinaryResponse = handleCloudinaryError(error, res);

    if (cloudinaryResponse) {
      return cloudinaryResponse;
    }

    return handleMongooseError(error, res, "Unable to create shop.");
  }
};

//--->>> GET SELLER SHOP
// GET /api/seller/shop

export const getSellerShop = async (req, res) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid seller authentication.",
      });
    }

    const shop = await Shop.findOne({
      seller: sellerId,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    return res.status(200).json({
      success: true,
      shop: buildShopResponse(shop),
    });
  } catch (error) {
    console.error("Get seller shop error:", error);

    return handleMongooseError(error, res, "Unable to fetch shop information.");
  }
};

//--->>> UPDATE SELLER SHOP
// PUT /api/seller/shop

export const updateSellerShop = async (req, res) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid seller authentication.",
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

    const body = req.body || {};

    validateProtectedVerificationFields(body);

    const {
      name,
      category,
      description,
      about,
      phone,
      email,

      address,
      city,
      state,
      pincode,

      latitude,
      longitude,

      openingHours,
      acceptOrders,
      deliveryAvailable,
      takeawayAvailable,
      deliveryRadius,
      minimumOrder,
      paymentMethods,
      facilities,
      policies,

      isCommunityListed,
    } = body;

    if (name !== undefined) {
      if (typeof name !== "string" || !trimString(name)) {
        return res.status(400).json({
          success: false,
          message: "Shop name cannot be empty.",
        });
      }
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !trimString(category)) {
        return res.status(400).json({
          success: false,
          message: "Shop category cannot be empty.",
        });
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !trimString(description)) {
        return res.status(400).json({
          success: false,
          message: "Shop description cannot be empty.",
        });
      }
    }

    if (about !== undefined) {
      if (typeof about !== "string" || !trimString(about)) {
        return res.status(400).json({
          success: false,
          message: "Shop about information cannot be empty.",
        });
      }
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || !trimString(phone)) {
        return res.status(400).json({
          success: false,
          message: "Shop phone number cannot be empty.",
        });
      }
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !trimString(email)) {
        return res.status(400).json({
          success: false,
          message: "Shop email cannot be empty.",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address.",
        });
      }
    }

    if (address !== undefined) {
      if (typeof address !== "string" || !trimString(address)) {
        return res.status(400).json({
          success: false,
          message: "Shop address cannot be empty.",
        });
      }
    }

    if (city !== undefined) {
      if (typeof city !== "string" || !trimString(city)) {
        return res.status(400).json({
          success: false,
          message: "Shop city cannot be empty.",
        });
      }
    }

    if (state !== undefined) {
      if (typeof state !== "string" || !trimString(state)) {
        return res.status(400).json({
          success: false,
          message: "Shop state cannot be empty.",
        });
      }
    }

    if (pincode !== undefined) {
      if (typeof pincode !== "string" && typeof pincode !== "number") {
        return res.status(400).json({
          success: false,
          message: "Pincode must be a valid 6-digit value.",
        });
      }

      if (!isValidPincode(pincode)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid 6-digit pincode.",
        });
      }
    }

    const explicitCoordinates = parseExplicitCoordinates(latitude, longitude);

    const addressChanged =
      address !== undefined ||
      city !== undefined ||
      state !== undefined ||
      pincode !== undefined;

    if (addressChanged) {
      const existingLocation = getExistingLocationParts(shop);

      const finalAddress =
        address !== undefined ? trimString(address) : existingLocation.address;

      const finalCity =
        city !== undefined ? trimString(city) : existingLocation.city;

      const finalState =
        state !== undefined ? trimString(state) : existingLocation.state;

      const finalPincode =
        pincode !== undefined ? trimString(pincode) : existingLocation.pincode;

      if (!finalAddress) {
        return res.status(400).json({
          success: false,
          message: "Shop address cannot be empty.",
        });
      }

      if (!finalCity) {
        return res.status(400).json({
          success: false,
          message: "Shop city cannot be empty.",
        });
      }

      if (!finalState) {
        return res.status(400).json({
          success: false,
          message: "Shop state cannot be empty.",
        });
      }

      if (!isValidPincode(finalPincode)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid 6-digit pincode.",
        });
      }

      const coordinates = explicitCoordinates || getShopCoordinates(shop);

      const location = createGeoLocation({
        address: finalAddress,
        city: finalCity,
        state: finalState,
        pincode: finalPincode,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      });

      shop.location = location;
    } else if (explicitCoordinates) {
      if (!shop.location) {
        return res.status(400).json({
          success: false,
          message:
            "Shop location is not configured. Please update the complete address first.",
        });
      }

      const existingLocation = getExistingLocationParts(shop);

      if (
        !existingLocation.address ||
        !existingLocation.city ||
        !existingLocation.state ||
        !isValidPincode(existingLocation.pincode)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Existing shop address is incomplete. Please update the complete address.",
        });
      }

      shop.location.coordinates = {
        type: "Point",

        coordinates: [
          explicitCoordinates.longitude,
          explicitCoordinates.latitude,
        ],
      };
    }

    if (name !== undefined) {
      shop.name = trimString(name);
    }

    if (category !== undefined) {
      shop.category = trimString(category);
    }

    if (description !== undefined) {
      shop.description = trimString(description);
    }

    if (about !== undefined) {
      shop.about = trimString(about);
    }

    if (phone !== undefined) {
      shop.phone = trimString(phone);
    }

    if (email !== undefined) {
      shop.email = normalizeEmail(email);
    }

    if (openingHours !== undefined) {
      shop.openingHours = parseJSONObjectField(
        openingHours,
        {},
        "openingHours",
      );
    }

    if (acceptOrders !== undefined) {
      shop.acceptOrders = parseBoolean(
        acceptOrders,
        shop.acceptOrders ?? false,
        "acceptOrders",
      );
    }

    if (deliveryAvailable !== undefined) {
      shop.deliveryAvailable = parseBoolean(
        deliveryAvailable,
        shop.deliveryAvailable ?? false,
        "deliveryAvailable",
      );
    }

    if (takeawayAvailable !== undefined) {
      shop.takeawayAvailable = parseBoolean(
        takeawayAvailable,
        shop.takeawayAvailable ?? false,
        "takeawayAvailable",
      );
    }

    if (deliveryRadius !== undefined) {
      shop.deliveryRadius = parseNonNegativeNumber(
        deliveryRadius,
        shop.deliveryRadius ?? 0,
        "deliveryRadius",
      );
    }

    if (minimumOrder !== undefined) {
      shop.minimumOrder = parseNonNegativeNumber(
        minimumOrder,
        shop.minimumOrder ?? 0,
        "minimumOrder",
      );
    }

    //--->>> ARRAY FIELDS

    if (paymentMethods !== undefined) {
      shop.paymentMethods = parseStringArrayField(
        paymentMethods,
        [],
        "paymentMethods",
      );
    }

    if (facilities !== undefined) {
      shop.facilities = parseStringArrayField(facilities, [], "facilities");
    }

    if (policies !== undefined) {
      shop.policies = parseStringArrayField(policies, [], "policies");
    }

    const logoFile = getFirstFile(req.files, "logo");

    const imageFile = getFirstFile(req.files, "image");

    const galleryFiles = getFilesForField(req.files, "gallery");

    if (galleryFiles.length > 0) {
      const existingGallery = Array.isArray(shop.gallery) ? shop.gallery : [];

      const remainingSlots = MAX_GALLERY_IMAGES - existingGallery.length;

      if (remainingSlots <= 0) {
        return res.status(400).json({
          success: false,
          message: "Shop already has the maximum of 4 gallery images.",
        });
      }

      if (galleryFiles.length > remainingSlots) {
        return res.status(400).json({
          success: false,
          message: `You can upload only ${remainingSlots} more gallery image(s).`,
        });
      }
    }

    if (logoFile) {
      try {
        const uploadedLogo = await uploadShopImage(
          logoFile,
          "shoplocal/shops/logos",
        );

        if (!uploadedLogo) {
          return res.status(502).json({
            success: false,
            message: "Shop logo upload failed.",
          });
        }

        shop.logo = uploadedLogo;
      } catch (error) {
        const cloudinaryResponse = handleCloudinaryError(error, res);

        if (cloudinaryResponse) {
          return cloudinaryResponse;
        }

        throw error;
      }
    }

    if (imageFile) {
      try {
        const uploadedImage = await uploadShopImage(
          imageFile,
          "shoplocal/shops/banners",
        );

        if (!uploadedImage) {
          return res.status(502).json({
            success: false,
            message: "Shop banner upload failed.",
          });
        }

        shop.image = uploadedImage;
      } catch (error) {
        const cloudinaryResponse = handleCloudinaryError(error, res);

        if (cloudinaryResponse) {
          return cloudinaryResponse;
        }

        throw error;
      }
    }

    if (galleryFiles.length > 0) {
      try {
        const uploadedGallery = await uploadShopImages(
          galleryFiles,
          "shoplocal/shops/gallery",
        );

        const existingGallery = Array.isArray(shop.gallery) ? shop.gallery : [];

        const combinedGallery = [...existingGallery, ...uploadedGallery];

        if (combinedGallery.length > MAX_GALLERY_IMAGES) {
          return res.status(400).json({
            success: false,
            message: "Shop can have a maximum of 4 gallery images.",
          });
        }

        shop.gallery = combinedGallery;
      } catch (error) {
        const cloudinaryResponse = handleCloudinaryError(error, res);

        if (cloudinaryResponse) {
          return cloudinaryResponse;
        }

        throw error;
      }
    }

    if (isCommunityListed !== undefined) {
      const parsedCommunityListed = parseBoolean(
        isCommunityListed,
        false,
        "isCommunityListed",
      );

      if (!shop.verification) {
        shop.verification = {};
      }

      shop.verification.isCommunityListed = parsedCommunityListed;
    }

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Shop information updated successfully.",
      shop: buildShopResponse(shop),
    });
  } catch (error) {
    console.error("Update seller shop error:", error);

    if (error instanceof RequestValidationError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        field: error.field,
      });
    }

    const cloudinaryResponse = handleCloudinaryError(error, res);

    if (cloudinaryResponse) {
      return cloudinaryResponse;
    }

    return handleMongooseError(
      error,
      res,
      "Unable to update shop information.",
    );
  }
};

//--->> GET ALL SHOPS
// GET /api/shops

export const getAllShops = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance, category } = req.query;

    const query = {
      isActive: true,
      isSuspended: false,
    };

    if (category !== undefined) {
      if (typeof category !== "string") {
        return res.status(400).json({
          success: false,
          message: "Category must be a string.",
        });
      }

      const normalizedCategory = category.trim();

      if (normalizedCategory) {
        query.category = normalizedCategory;
      }
    }

    let distanceKm = 20;

    if (maxDistance !== undefined) {
      if (typeof maxDistance === "string" && !maxDistance.trim()) {
        return res.status(400).json({
          success: false,
          message: "maxDistance must be a valid non-negative number.",
        });
      }

      distanceKm = parseNonNegativeNumber(maxDistance, 20, "maxDistance");
    }

    const hasLatitude = isDefined(latitude);
    const hasLongitude = isDefined(longitude);

    if (hasLatitude || hasLongitude) {
      if (!hasLatitude || !hasLongitude) {
        return res.status(400).json({
          success: false,
          message:
            "Both latitude and longitude are required for nearby shop search.",
        });
      }

      const coordinates = validateCoordinates(latitude, longitude);

      if (!coordinates) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates.",
        });
      }

      const distanceMeters = distanceKm * 1000;

      const shops = await Shop.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",

              coordinates: [coordinates.longitude, coordinates.latitude],
            },

            key: "location.coordinates",

            distanceField: "distanceMeters",

            maxDistance: distanceMeters,

            spherical: true,

            query,
          },
        },

        {
          $addFields: {
            distanceKm: {
              $round: [
                {
                  $divide: ["$distanceMeters", 1000],
                },
                1,
              ],
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,

        count: shops.length,

        shops: shops.map((shop) => ({
          ...buildShopResponse(shop),

          distanceKm: shop.distanceKm,
        })),
      });
    }

    const shops = await Shop.find(query)
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,

      count: shops.length,

      shops: shops.map(buildShopResponse),
    });
  } catch (error) {
    console.error("Get all shops error:", error);

    if (error instanceof RequestValidationError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        field: error.field,
      });
    }

    return handleMongooseError(error, res, "Unable to fetch shops.");
  }
};

//--->>> GET SINGLE SHOP
// GET /api/shops/:id

export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID.",
      });
    }

    const shop = await Shop.findOne({
      _id: id,

      isActive: true,

      isSuspended: false,
    }).populate("seller", "ownerName email phone");

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    return res.status(200).json({
      success: true,

      shop: {
        ...buildShopResponse(shop),

        owner: shop.seller
          ? {
              id: shop.seller._id,

              name: shop.seller.ownerName,

              email: shop.seller.email,

              phone: shop.seller.phone,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get shop by ID error:", error);

    return handleMongooseError(error, res, "Unable to fetch shop.");
  }
};
