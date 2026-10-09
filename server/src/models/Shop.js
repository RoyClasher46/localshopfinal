import mongoose from "mongoose";

const daySchema = new mongoose.Schema(
  {
    open: {
      type: String,
      default: "09:00",
    },

    close: {
      type: String,
      default: "21:00",
    },

    closed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const openingHoursSchema = new mongoose.Schema(
  {
    monday: {
      type: daySchema,
      default: () => ({}),
    },

    tuesday: {
      type: daySchema,
      default: () => ({}),
    },

    wednesday: {
      type: daySchema,
      default: () => ({}),
    },

    thursday: {
      type: daySchema,
      default: () => ({}),
    },

    friday: {
      type: daySchema,
      default: () => ({}),
    },

    saturday: {
      type: daySchema,
      default: () => ({}),
    },

    sunday: {
      type: daySchema,
      default: () => ({
        closed: true,
      }),
    },
  },
  { _id: false },
);

//--->> LOCATION

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    // GeoJSON
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { _id: false },
);

//--->>>> RATING SUMMARY

const ratingSummarySchema = new mongoose.Schema(
  {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    distribution: {
      one: {
        type: Number,
        default: 0,
      },

      two: {
        type: Number,
        default: 0,
      },

      three: {
        type: Number,
        default: 0,
      },

      four: {
        type: Number,
        default: 0,
      },

      five: {
        type: Number,
        default: 0,
      },
    },
  },
  { _id: false },
);

//--->>> SHOP SCHEMA

const shopSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    about: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    //--->>> IMAGES

    image: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    gallery: {
      type: [String],
      default: [],
    },

    //---->>> LOCATION

    location: {
      type: locationSchema,
      required: true,
    },

    openingHours: {
      type: openingHoursSchema,
      default: () => ({}),
    },

    acceptOrders: {
      type: Boolean,
      default: true,
    },

    deliveryAvailable: {
      type: Boolean,
      default: false,
    },

    takeawayAvailable: {
      type: Boolean,
      default: true,
    },

    deliveryRadius: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethods: {
      type: [String],
      enum: ["Cash", "UPI", "Card", "Online"],
      default: ["Cash", "UPI"],
    },

    rating: {
      type: ratingSummarySchema,
      default: () => ({}),
    },

    //--->>> VERIFICATION / DISCOVERY LABELS

    verification: {
      isVerified: {
        type: Boolean,
        default: false,
        index: true,
      },

      isRegistered: {
        type: Boolean,
        default: true,
      },

      isCommunityListed: {
        type: Boolean,
        default: false,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },

    facilities: {
      type: [String],
      default: [],
    },

    policies: {
      type: [String],
      default: [],
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

//--->>> GEO INDEX

shopSchema.index({
  "location.coordinates": "2dsphere",
});

//--->>> TEXT SEARCH

shopSchema.index({
  name: "text",
  category: "text",
  description: "text",
  about: "text",
});

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
