import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  Phone,
  Store,
  Clock3,
  Upload,
  X,
  Mail,
  Truck,
  CreditCard,
  Check,
  ShoppingBag,
  Users,
  Trash2,
  Plus,
} from "lucide-react";

//--->>> CONSTANTS

const DAYS = [
  {
    key: "monday",
    label: "Monday",
  },
  {
    key: "tuesday",
    label: "Tuesday",
  },
  {
    key: "wednesday",
    label: "Wednesday",
  },
  {
    key: "thursday",
    label: "Thursday",
  },
  {
    key: "friday",
    label: "Friday",
  },
  {
    key: "saturday",
    label: "Saturday",
  },
  {
    key: "sunday",
    label: "Sunday",
  },
];

const CATEGORY_OPTIONS = [
  "Grocery",
  "Bakery",
  "Pharmacy",
  "Fashion",
  "Electronics",
  "Restaurant",
  "Fresh Produce",
  "Beauty",
  "Home & Kitchen",
  "Other",
];

const PAYMENT_OPTIONS = ["Cash", "UPI", "Card", "Online"];

const FACILITY_OPTIONS = [
  "Home Delivery",
  "UPI Payment",
  "Card Payment",
  "Parking",
  "Takeaway",
];

const MAX_GALLERY_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const DEFAULT_DAY = {
  open: "09:00",
  close: "21:00",
  closed: false,
};

const DEFAULT_OPENING_HOURS = {
  monday: { ...DEFAULT_DAY },
  tuesday: { ...DEFAULT_DAY },
  wednesday: { ...DEFAULT_DAY },
  thursday: { ...DEFAULT_DAY },
  friday: { ...DEFAULT_DAY },
  saturday: { ...DEFAULT_DAY },
  sunday: {
    open: "09:00",
    close: "21:00",
    closed: true,
  },
};

//---->>> HELPERS

function createDefaultOpeningHours() {
  return {
    monday: { ...DEFAULT_OPENING_HOURS.monday },
    tuesday: { ...DEFAULT_OPENING_HOURS.tuesday },
    wednesday: { ...DEFAULT_OPENING_HOURS.wednesday },
    thursday: { ...DEFAULT_OPENING_HOURS.thursday },
    friday: { ...DEFAULT_OPENING_HOURS.friday },
    saturday: { ...DEFAULT_OPENING_HOURS.saturday },
    sunday: { ...DEFAULT_OPENING_HOURS.sunday },
  };
}

function normalizeOpeningHours(value) {
  const defaults = createDefaultOpeningHours();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaults;
  }

  const normalized = {};

  DAYS.forEach((day) => {
    const existing = value?.[day.key];

    normalized[day.key] = {
      open: existing?.open || defaults[day.key].open,
      close: existing?.close || defaults[day.key].close,
      closed: Boolean(existing?.closed),
    };
  });

  return normalized;
}

function arrayToList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return item?.name || item?.label || item?.text || item?.description || "";
    })
    .filter(Boolean);
}

function uniqueArray(value) {
  return [...new Set(Array.isArray(value) ? value : [])];
}

//--->>> SAFE COORDINATE HELPERS

function normalizeCoordinates(coordinates) {
  if (!coordinates) {
    return null;
  }

  //-->>> Already an array: [longitude, latitude]
  if (Array.isArray(coordinates)) {
    return coordinates;
  }

  if (typeof coordinates === "string") {
    return coordinates;
  }

  if (typeof coordinates === "object") {
    //--->>> GeoJSON-style nested coordinates
    if (Array.isArray(coordinates.coordinates)) {
      return coordinates.coordinates;
    }

    //-->>> { lat, lng }
    if (
      (coordinates.lat !== undefined || coordinates.latitude !== undefined) &&
      (coordinates.lng !== undefined ||
        coordinates.lon !== undefined ||
        coordinates.longitude !== undefined)
    ) {
      return {
        lat:
          coordinates.lat !== undefined
            ? coordinates.lat
            : coordinates.latitude,

        lng:
          coordinates.lng !== undefined
            ? coordinates.lng
            : coordinates.lon !== undefined
              ? coordinates.lon
              : coordinates.longitude,
      };
    }
  }

  return null;
}

function formatCoordinates(coordinates) {
  if (!coordinates) {
    return "";
  }

  //-->> Array
  if (Array.isArray(coordinates)) {
    return coordinates.length > 0 ? coordinates.join(", ") : "";
  }

  //--->>> String
  if (typeof coordinates === "string") {
    return coordinates;
  }

  //-->> Object
  if (typeof coordinates === "object") {
    //--->> Nested GeoJSON coordinates
    if (Array.isArray(coordinates.coordinates)) {
      return coordinates.coordinates.join(", ");
    }

    const latitude = coordinates.lat ?? coordinates.latitude;

    const longitude =
      coordinates.lng ?? coordinates.lon ?? coordinates.longitude;

    if (latitude !== undefined && longitude !== undefined) {
      return `${latitude}, ${longitude}`;
    }
  }

  return "";
}

function normalizeLocation(shop) {
  const location =
    shop?.location && typeof shop.location === "object" ? shop.location : {};

  return {
    address: shop?.address || location.address || "",

    city: shop?.city || location.city || "",

    state: shop?.state || location.state || "",

    pincode: shop?.pincode || location.pincode || location.zipCode || "",

    coordinates: normalizeCoordinates(location.coordinates),

    type: location.type || "Point",
  };
}

function buildInitialFormData(shop) {
  const location = normalizeLocation(shop);

  return {
    name: shop?.name || "",

    category: shop?.category || "",

    description: shop?.description || "",

    about: shop?.about || "",

    phone: shop?.phone || "",

    email: shop?.email || "",

    address: location.address,

    city: location.city,

    state: location.state,

    pincode: location.pincode,

    //-->>> Main banner
    image: null,

    //--->>> Logo
    logo: null,

    //--->>> New gallery files
    gallery: [],

    //--->>> Existing gallery URLs
    existingGallery: arrayToList(shop?.gallery),

    openingHours: normalizeOpeningHours(shop?.openingHours),

    acceptOrders: Boolean(shop?.acceptOrders),

    deliveryAvailable: Boolean(shop?.deliveryAvailable),

    takeawayAvailable: Boolean(shop?.takeawayAvailable),

    deliveryRadius:
      shop?.deliveryRadius !== undefined && shop?.deliveryRadius !== null
        ? String(shop.deliveryRadius)
        : "",

    minimumOrder:
      shop?.minimumOrder !== undefined && shop?.minimumOrder !== null
        ? String(shop.minimumOrder)
        : "",

    paymentMethods: uniqueArray(arrayToList(shop?.paymentMethods)),

    facilities: uniqueArray(arrayToList(shop?.facilities)),

    policies: arrayToList(shop?.policies),

    isCommunityListed: Boolean(shop?.isCommunityListed),
  };
}

//---->>> COMPONENT

function ShopForm({ shop, onCancel, onSave, error: parentError = "" }) {
  const [formData, setFormData] = useState(buildInitialFormData(shop));

  const [imagePreview, setImagePreview] = useState(shop?.image || "");

  const [logoPreview, setLogoPreview] = useState(shop?.logo || "");

  const [galleryPreviews, setGalleryPreviews] = useState(
    arrayToList(shop?.gallery).map((url) => ({
      type: "existing",
      url,
    })),
  );

  const [policyInput, setPolicyInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  //---->>> LOAD SHOP

  useEffect(() => {
    if (!shop) {
      return;
    }

    const nextFormData = buildInitialFormData(shop);

    setFormData(nextFormData);

    setImagePreview(shop?.image || "");

    setLogoPreview(shop?.logo || "");

    setGalleryPreviews(
      arrayToList(shop?.gallery).map((url) => ({
        type: "existing",
        url,
      })),
    );

    setPolicyInput("");

    setError("");
  }, [shop]);

  //--->>> CLEANUP BLOB URLS

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }

      galleryPreviews.forEach((preview) => {
        if (preview?.type === "new" && preview?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreview, logoPreview, galleryPreviews]);

  //-->>> BASIC CHANGE

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setError("");

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //---->>> IMAGE VALIDATION

  const validateImageFile = (file, fieldName = "Image") => {
    if (!file) {
      return `${fieldName} is required.`;
    }

    if (!file.type.startsWith("image/")) {
      return `Please select a valid ${fieldName.toLowerCase()} file.`;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return `${fieldName} must be less than 5 MB.`;
    }

    return "";
  };

  //--->> MAIN IMAGE

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const validationError = validateImageFile(file, "Shop banner");

    if (validationError) {
      setError(validationError);

      event.target.value = "";

      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));

    event.target.value = "";
  };

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    setFormData((previous) => ({
      ...previous,
      image: null,
    }));
  };

  //---->>> LOGO

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const validationError = validateImageFile(file, "Shop logo");

    if (validationError) {
      setError(validationError);

      event.target.value = "";

      return;
    }

    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setLogoPreview(previewUrl);

    setFormData((previous) => ({
      ...previous,
      logo: file,
    }));

    event.target.value = "";
  };

  const handleRemoveLogo = () => {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoPreview("");

    setFormData((previous) => ({
      ...previous,
      logo: null,
    }));
  };

  //-->>> GALLERY

  const handleGalleryChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setError("");

    const remainingSlots = MAX_GALLERY_IMAGES - galleryPreviews.length;

    if (remainingSlots <= 0) {
      setError(
        `You can have a maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
      );

      event.target.value = "";

      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} gallery image${
          remainingSlots === 1 ? "" : "s"
        } can be added.`,
      );
    }

    const validFiles = [];

    for (const file of filesToAdd) {
      const validationError = validateImageFile(file, "Gallery image");

      if (validationError) {
        setError(validationError);

        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      event.target.value = "";

      return;
    }

    const newPreviews = validFiles.map((file) => ({
      type: "new",
      file,
      url: URL.createObjectURL(file),
    }));

    setGalleryPreviews((previous) => [...previous, ...newPreviews]);

    setFormData((previous) => ({
      ...previous,

      gallery: [...previous.gallery, ...validFiles],
    }));

    event.target.value = "";
  };

  const handleRemoveGalleryImage = (index) => {
    const preview = galleryPreviews[index];

    if (preview?.type === "new" && preview?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(preview.url);
    }

    setGalleryPreviews((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );

    if (preview?.type === "new") {
      setFormData((previous) => {
        const newFiles = previous.gallery.filter(
          (file) => file !== preview.file,
        );

        return {
          ...previous,
          gallery: newFiles,
        };
      });
    } else {
      setFormData((previous) => ({
        ...previous,

        existingGallery: previous.existingGallery.filter(
          (url) => url !== preview.url,
        ),
      }));
    }
  };

  //---->>> OPENING HOURS

  const handleOpeningHoursChange = (day, field, value) => {
    setError("");

    setFormData((previous) => ({
      ...previous,

      openingHours: {
        ...previous.openingHours,

        [day]: {
          ...previous.openingHours[day],

          [field]: value,
        },
      },
    }));
  };

  //---->>> PAYMENT METHODS

  const togglePaymentMethod = (paymentMethod) => {
    setError("");

    setFormData((previous) => {
      const exists = previous.paymentMethods.includes(paymentMethod);

      return {
        ...previous,

        paymentMethods: exists
          ? previous.paymentMethods.filter((item) => item !== paymentMethod)
          : [...previous.paymentMethods, paymentMethod],
      };
    });
  };

  //--->> FACILITIES

  const toggleFacility = (facility) => {
    setError("");

    setFormData((previous) => {
      const exists = previous.facilities.includes(facility);

      return {
        ...previous,

        facilities: exists
          ? previous.facilities.filter((item) => item !== facility)
          : [...previous.facilities, facility],
      };
    });
  };

  //--->>> POLICIES

  const addPolicy = () => {
    const policy = policyInput.trim();

    if (!policy) {
      return;
    }

    if (formData.policies.includes(policy)) {
      setPolicyInput("");

      return;
    }

    setFormData((previous) => ({
      ...previous,

      policies: [...previous.policies, policy],
    }));

    setPolicyInput("");
  };

  const removePolicy = (policy) => {
    setFormData((previous) => ({
      ...previous,

      policies: previous.policies.filter((item) => item !== policy),
    }));
  };

  //-->> TOGGLE SERVICE

  const handleBooleanChange = (name, value) => {
    setError("");

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  //--->>> VALIDATION

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Shop name is required.";
    }

    if (!formData.category.trim()) {
      return "Shop category is required.";
    }

    if (!formData.description.trim()) {
      return "Shop description is required.";
    }

    if (!formData.about.trim()) {
      return "Shop about information is required.";
    }

    if (!formData.phone.trim()) {
      return "Shop phone number is required.";
    }

    if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone.trim())) {
      return "Please enter a valid shop phone number.";
    }

    if (!formData.email.trim()) {
      return "Shop email is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Please enter a valid shop email address.";
    }

    if (!formData.address.trim()) {
      return "Shop address is required.";
    }

    if (!formData.city.trim()) {
      return "Shop city is required.";
    }

    if (!formData.state.trim()) {
      return "Shop state is required.";
    }

    if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      return "Please enter a valid 6-digit pincode.";
    }

    const radius = Number(formData.deliveryRadius);

    if (
      formData.deliveryAvailable &&
      (!Number.isFinite(radius) || radius <= 0)
    ) {
      return "Delivery radius must be greater than 0 when delivery is enabled.";
    }

    if (
      formData.deliveryRadius !== "" &&
      (!Number.isFinite(radius) || radius < 0)
    ) {
      return "Delivery radius must be a valid non-negative number.";
    }

    const minimumOrder = Number(formData.minimumOrder);

    if (
      formData.minimumOrder !== "" &&
      (!Number.isFinite(minimumOrder) || minimumOrder < 0)
    ) {
      return "Minimum order must be a valid non-negative number.";
    }

    if (formData.paymentMethods.length === 0) {
      return "Please select at least one payment method.";
    }

    if (
      formData.existingGallery.length + formData.gallery.length >
      MAX_GALLERY_IMAGES
    ) {
      return `You can have a maximum of ${MAX_GALLERY_IMAGES} gallery images.`;
    }

    return "";
  };

  //--->>> SUBMIT

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);

      const payload = new FormData();

      //--->>> BASIC INFORMATION

      payload.append("name", formData.name.trim());
      payload.append("category", formData.category.trim());
      payload.append("description", formData.description.trim());
      payload.append("about", formData.about.trim());

      //--->> CONTACT

      payload.append("phone", formData.phone.trim());
      payload.append("email", formData.email.trim().toLowerCase());

      //--->>> LOCATION

      payload.append("address", formData.address.trim());
      payload.append("city", formData.city.trim());
      payload.append("state", formData.state.trim());
      payload.append("pincode", formData.pincode.trim());

      //--->> IMAGES

      //--->> New banner
      if (formData.image instanceof File) {
        payload.append("image", formData.image);
      }

      //-->> New logo
      if (formData.logo instanceof File) {
        payload.append("logo", formData.logo);
      }

      payload.append("removeImage", String(!imagePreview));

      payload.append("removeLogo", String(!logoPreview));

      payload.append(
        "existingGallery",
        JSON.stringify(formData.existingGallery),
      );

      formData.gallery.forEach((file) => {
        if (file instanceof File) {
          payload.append("gallery", file);
        }
      });

      payload.append("openingHours", JSON.stringify(formData.openingHours));

      //--->>> SERVICES

      payload.append("acceptOrders", String(formData.acceptOrders));

      payload.append("deliveryAvailable", String(formData.deliveryAvailable));

      payload.append("takeawayAvailable", String(formData.takeawayAvailable));

      payload.append(
        "deliveryRadius",
        formData.deliveryRadius === ""
          ? ""
          : String(Number(formData.deliveryRadius)),
      );

      payload.append(
        "minimumOrder",
        formData.minimumOrder === ""
          ? ""
          : String(Number(formData.minimumOrder)),
      );

      //---->>> PAYMENT / FACILITIES / POLICIES

      payload.append("paymentMethods", JSON.stringify(formData.paymentMethods));

      payload.append("facilities", JSON.stringify(formData.facilities));

      payload.append("policies", JSON.stringify(formData.policies));

      //--->> VISIBILITY

      payload.append("isCommunityListed", String(formData.isCommunityListed));

      //-->>> SAVE

      await onSave(payload);
    } catch (saveError) {
      setError(saveError?.message || "Unable to update shop information.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}

      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="
            flex h-10 w-10 shrink-0 cursor-pointer
            items-center justify-center rounded-xl
            border border-[#DDE4E2] bg-white
            text-[#022B3A] transition
            hover:bg-[#FFF0D9]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="Back to shop information"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <p className="text-sm font-semibold text-[#FF8C00]">
            Shop Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#022B3A]">
            Edit Shop Information
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Update all customer-facing shop information, services, visibility
            and business hours.
          </p>
        </div>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="
          space-y-8
          rounded-3xl
          border border-[#DDE4E2]
          bg-white
          p-6
          shadow-sm
          sm:p-8
        "
      >
        {/* IMAGES*/}

        <FormSection
          title="Shop Images"
          description="Manage the main shop image, logo and gallery."
          icon={<ImageIcon size={20} />}
        >
          {/* MAIN IMAGE */}

          <div>
            <label className={labelClassName}>Shop Banner / Main Image</label>

            <div className={imageContainerClassName}>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Shop banner preview"
                    className="
                      h-64 w-full object-cover
                      sm:h-80
                    "
                  />

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSaving}
                    className={removeButtonClassName}
                    aria-label="Remove shop image"
                  >
                    <X size={18} />
                  </button>

                  <label
                    htmlFor="shop-image"
                    className="
                      absolute bottom-4 right-4
                      flex cursor-pointer items-center gap-2
                      rounded-xl bg-white px-4 py-2.5
                      text-xs font-bold text-[#022B3A]
                      shadow-lg transition
                      hover:bg-[#FFF0D9]
                    "
                  >
                    <Upload size={15} />
                    Change Image
                  </label>
                </div>
              ) : (
                <label htmlFor="shop-image" className={uploadBoxClassName}>
                  <div className={uploadIconClassName}>
                    <ImageIcon size={26} />
                  </div>

                  <p className="mt-4 text-sm font-bold text-[#022B3A]">
                    Upload shop image
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    JPG, JPEG, PNG or WEBP
                  </p>

                  <p className="mt-1 text-[11px] text-[#94A3B8]">
                    Maximum 5 MB
                  </p>
                </label>
              )}

              <input
                id="shop-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageChange}
                disabled={isSaving}
                className="hidden"
              />
            </div>
          </div>

          {/* LOGO */}

          <div>
            <label className={labelClassName}>Shop Logo</label>

            <div className={imageContainerClassName}>
              {logoPreview ? (
                <div className="relative flex min-h-[240px] items-center justify-center p-6">
                  <img
                    src={logoPreview}
                    alt="Shop logo preview"
                    className="
                      h-44 w-44 rounded-2xl
                      object-contain
                    "
                  />

                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isSaving}
                    className={removeButtonClassName}
                    aria-label="Remove shop logo"
                  >
                    <X size={18} />
                  </button>

                  <label
                    htmlFor="shop-logo"
                    className="
                      absolute bottom-4 right-4
                      flex cursor-pointer items-center gap-2
                      rounded-xl bg-white px-4 py-2.5
                      text-xs font-bold text-[#022B3A]
                      shadow-lg transition
                      hover:bg-[#FFF0D9]
                    "
                  >
                    <Upload size={15} />
                    Change Logo
                  </label>
                </div>
              ) : (
                <label htmlFor="shop-logo" className={uploadBoxClassName}>
                  <div className={uploadIconClassName}>
                    <Store size={26} />
                  </div>

                  <p className="mt-4 text-sm font-bold text-[#022B3A]">
                    Upload shop logo
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    JPG, JPEG, PNG or WEBP
                  </p>

                  <p className="mt-1 text-[11px] text-[#94A3B8]">
                    Maximum 5 MB
                  </p>
                </label>
              )}

              <input
                id="shop-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleLogoChange}
                disabled={isSaving}
                className="hidden"
              />
            </div>
          </div>

          {/* GALLERY */}

          <div className="md:col-span-2">
            <label className={labelClassName}>Shop Gallery</label>

            <div
              className="
                rounded-2xl
                border border-dashed border-[#CBD5E1]
                bg-[#F8FAF9]
                p-4
              "
            >
              {galleryPreviews.length > 0 && (
                <div
                  className="
                    mb-4 grid grid-cols-2 gap-3
                    sm:grid-cols-4
                  "
                >
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={`${preview.url}-${index}`}
                      className="
                          relative aspect-square
                          overflow-hidden rounded-xl
                          border border-[#DDE4E2]
                          bg-white
                        "
                    >
                      <img
                        src={preview.url}
                        alt={`Gallery ${index + 1}`}
                        className="
                            h-full w-full object-cover
                          "
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        disabled={isSaving}
                        className="
                        cursor-pointer
                            absolute right-2 top-2
                            flex h-8 w-8 items-center
                            justify-center rounded-full
                            bg-black/60 text-white
                            transition hover:bg-red-500
                          "
                        aria-label={`Remove gallery image ${index + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>

                      <div
                        className="
                            absolute bottom-2 left-2
                            rounded-md bg-black/60
                            px-2 py-1
                            text-[10px] font-semibold text-white
                          "
                      >
                        {index + 1}/{MAX_GALLERY_IMAGES}
                      </div>

                      {preview.type === "existing" && (
                        <div
                          className="
                              absolute left-2 top-2
                              rounded-md bg-black/60
                              px-2 py-1
                              text-[9px] font-semibold
                              text-white
                            "
                        >
                          Existing
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {galleryPreviews.length < MAX_GALLERY_IMAGES && (
                <label
                  htmlFor="shop-gallery"
                  className="
                    flex min-h-[150px]
                    cursor-pointer flex-col
                    items-center justify-center
                    px-5 text-center
                  "
                >
                  <div className={uploadIconClassName}>
                    <ImageIcon size={26} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#022B3A]">
                    Add gallery images
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {MAX_GALLERY_IMAGES - galleryPreviews.length} slot
                    {MAX_GALLERY_IMAGES - galleryPreviews.length !== 1
                      ? "s"
                      : ""}{" "}
                    remaining
                  </p>
                </label>
              )}

              {galleryPreviews.length === MAX_GALLERY_IMAGES && (
                <div
                  className="
                    rounded-xl bg-[#FFF0D9]
                    px-4 py-3 text-center
                    text-xs font-semibold text-[#D66F00]
                  "
                >
                  Maximum 4 gallery images reached.
                </div>
              )}

              <input
                id="shop-gallery"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple
                onChange={handleGalleryChange}
                disabled={
                  isSaving || galleryPreviews.length >= MAX_GALLERY_IMAGES
                }
                className="hidden"
              />
            </div>
          </div>
        </FormSection>

        {/* BASIC INFORMATION */}

        <FormSection
          title="Basic Information"
          description="Update your shop identity and customer-facing information."
          icon={<Store size={20} />}
        >
          <FormField
            id="shop-name"
            name="name"
            label="Shop Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your shop name"
            icon={<Store size={18} />}
            required
            disabled={isSaving}
          />

          <SelectField
            id="shop-category"
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={isSaving}
          />

          <div className="md:col-span-2">
            <TextAreaField
              id="shop-description"
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers about your shop..."
              rows={5}
              maxLength={2000}
              required
              disabled={isSaving}
            />
          </div>

          <div className="md:col-span-2">
            <TextAreaField
              id="shop-about"
              name="about"
              label="About Shop"
              value={formData.about}
              onChange={handleChange}
              placeholder="Add detailed information about your shop..."
              rows={5}
              maxLength={5000}
              required
              disabled={isSaving}
            />
          </div>
        </FormSection>

        {/* CONTACT & LOCATION */}

        <FormSection
          title="Contact & Location"
          description="Update the address and contact information customers use."
          icon={<MapPin size={20} />}
        >
          <div className="md:col-span-2">
            <TextAreaField
              id="shop-address"
              name="address"
              label="Complete Address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete shop address"
              rows={3}
              required
              icon={<MapPin size={18} />}
              disabled={isSaving}
            />
          </div>

          <FormField
            id="shop-city"
            name="city"
            label="City"
            value={formData.city}
            onChange={handleChange}
            placeholder="Nagpur"
            icon={<MapPin size={18} />}
            required
            disabled={isSaving}
          />

          <FormField
            id="shop-state"
            name="state"
            label="State"
            value={formData.state}
            onChange={handleChange}
            placeholder="Maharashtra"
            icon={<MapPin size={18} />}
            required
            disabled={isSaving}
          />

          <FormField
            id="shop-pincode"
            name="pincode"
            label="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="440001"
            icon={<MapPin size={18} />}
            required
            inputMode="numeric"
            disabled={isSaving}
          />

          <FormField
            id="shop-phone"
            name="phone"
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9890898546"
            icon={<Phone size={18} />}
            required
            disabled={isSaving}
          />

          <FormField
            id="shop-email"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="shop@example.com"
            icon={<Mail size={18} />}
            required
            disabled={isSaving}
          />

          {/* FIXED COORDINATES SECTION */}

          <div
            className="
              md:col-span-2
              rounded-2xl
              border border-[#DDE4E2]
              bg-[#F8FAF9]
              p-4
            "
          >
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[#FF8C00]" />

              <div>
                <p className="text-sm font-bold text-[#022B3A]">
                  Map Coordinates
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Your map location is managed automatically. Updating the
                  address will update the coordinates when geocoding is
                  available.
                </p>

                {formatCoordinates(shop?.location?.coordinates) && (
                  <p className="mt-2 text-xs font-medium text-[#022B3A]">
                    Current: {formatCoordinates(shop?.location?.coordinates)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </FormSection>

        {/* BUSINESS HOURS */}

        <FormSection
          title="Business Hours"
          description="Edit the opening and closing schedule for every day."
          icon={<Clock3 size={20} />}
        >
          <div className="md:col-span-2">
            <div
              className="
                overflow-hidden rounded-2xl
                border border-[#DDE4E2]
              "
            >
              {DAYS.map((day) => {
                const hours = formData.openingHours?.[day.key] || DEFAULT_DAY;

                return (
                  <div
                    key={day.key}
                    className="
                      grid gap-3
                      border-b border-[#DDE4E2]
                      p-4 last:border-b-0
                      sm:grid-cols-[130px_1fr_1fr_auto]
                      sm:items-center
                    "
                  >
                    <div
                      className="
                        text-sm font-bold
                        text-[#022B3A]
                      "
                    >
                      {day.label}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#64748B]">
                        Opens
                      </label>

                      <input
                        type="time"
                        value={hours.open}
                        disabled={hours.closed || isSaving}
                        onChange={(event) =>
                          handleOpeningHoursChange(
                            day.key,
                            "open",
                            event.target.value,
                          )
                        }
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#64748B]">
                        Closes
                      </label>

                      <input
                        type="time"
                        value={hours.close}
                        disabled={hours.closed || isSaving}
                        onChange={(event) =>
                          handleOpeningHoursChange(
                            day.key,
                            "close",
                            event.target.value,
                          )
                        }
                        className={inputClassName}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-[#64748B]">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        disabled={isSaving}
                        onChange={(event) =>
                          handleOpeningHoursChange(
                            day.key,
                            "closed",
                            event.target.checked,
                          )
                        }
                        className="
                          h-4 w-4
                          accent-[#FF8C00]
                        "
                      />
                      Closed
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* SERVICES */}

        <FormSection
          title="Services & Ordering"
          description="Control whether customers can order, get delivery or use takeaway."
          icon={<Truck size={20} />}
        >
          <ToggleField
            label="Accept Orders"
            description="Allow customers to place orders."
            checked={formData.acceptOrders}
            onChange={(value) => handleBooleanChange("acceptOrders", value)}
            icon={<ShoppingBag size={20} />}
            disabled={isSaving}
          />

          <ToggleField
            label="Home Delivery"
            description="Offer delivery to customers."
            checked={formData.deliveryAvailable}
            onChange={(value) =>
              handleBooleanChange("deliveryAvailable", value)
            }
            icon={<Truck size={20} />}
            disabled={isSaving}
          />

          <ToggleField
            label="Takeaway"
            description="Allow customers to collect orders."
            checked={formData.takeawayAvailable}
            onChange={(value) =>
              handleBooleanChange("takeawayAvailable", value)
            }
            icon={<Store size={20} />}
            disabled={isSaving}
          />

          <FormField
            id="delivery-radius"
            name="deliveryRadius"
            label="Delivery Radius (km)"
            type="number"
            value={formData.deliveryRadius}
            onChange={handleChange}
            placeholder="e.g. 8"
            min="0"
            step="0.5"
            icon={<MapPin size={18} />}
            disabled={isSaving}
          />

          <FormField
            id="minimum-order"
            name="minimumOrder"
            label="Minimum Order (₹)"
            type="number"
            value={formData.minimumOrder}
            onChange={handleChange}
            placeholder="e.g. 100"
            min="0"
            step="1"
            icon={<CreditCard size={18} />}
            disabled={isSaving}
          />
        </FormSection>

        {/* PAYMENTS */}

        <FormSection
          title="Payment Methods"
          description="Select all payment methods accepted by the shop."
          icon={<CreditCard size={20} />}
        >
          <div className="md:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PAYMENT_OPTIONS.map((paymentMethod) => {
                const selected =
                  formData.paymentMethods.includes(paymentMethod);

                return (
                  <button
                    key={paymentMethod}
                    type="button"
                    disabled={isSaving}
                    onClick={() => togglePaymentMethod(paymentMethod)}
                    className={`
                      cursor-pointer
                        flex items-center gap-3
                        rounded-xl border px-4 py-3
                        text-left text-sm font-semibold
                        transition
                        ${
                          selected
                            ? "border-[#FF8C00] bg-[#FFF0D9] text-[#022B3A]"
                            : "border-[#DDE4E2] bg-white text-[#64748B] hover:border-[#FFB45C]"
                        }
                      `}
                  >
                    <span
                      className={`
                          flex h-5 w-5
                          items-center justify-center
                          rounded-md border text-xs
                          ${
                            selected
                              ? "border-[#FF8C00] bg-[#FF8C00] text-white"
                              : "border-[#CBD5E1]"
                          }
                        `}
                    >
                      {selected ? "✓" : ""}
                    </span>

                    <CreditCard size={17} />

                    {paymentMethod}
                  </button>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* FACILITIES */}

        <FormSection
          title="Shop Facilities"
          description="Select facilities available at the shop."
          icon={<Check size={20} />}
        >
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-3">
              {FACILITY_OPTIONS.map((facility) => {
                const selected = formData.facilities.includes(facility);

                return (
                  <button
                    key={facility}
                    type="button"
                    disabled={isSaving}
                    onClick={() => toggleFacility(facility)}
                    className={`
                      cursor-pointer
                        rounded-full border
                        px-4 py-2
                        text-sm font-medium
                        transition
                        ${
                          selected
                            ? "border-[#FF8C00] bg-[#FFF0D9] text-[#D66F00]"
                            : "border-[#DDE4E2] bg-white text-[#64748B] hover:border-[#FFB45C]"
                        }
                      `}
                  >
                    {selected && <span className="mr-1">✓</span>}

                    {facility}
                  </button>
                );
              })}
            </div>

            {formData.facilities.length > 0 && (
              <p className="mt-3 text-xs text-[#64748B]">
                Selected:{" "}
                <span className="font-semibold text-[#022B3A]">
                  {formData.facilities.join(", ")}
                </span>
              </p>
            )}
          </div>
        </FormSection>

        {/* POLICIES */}

        <FormSection
          title="Shop Policies"
          description="Manage the policies customers should know before ordering."
          icon={<FileIcon />}
        >
          <div className="md:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <FileIcon
                  className="
                    pointer-events-none
                    absolute left-4 top-1/2
                    -translate-y-1/2
                    text-[#64748B]
                  "
                />

                <input
                  value={policyInput}
                  onChange={(event) => setPolicyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();

                      addPolicy();
                    }
                  }}
                  placeholder="Example: Products can be returned within 24 hours."
                  disabled={isSaving}
                  className={`
                    ${inputClassName}
                    pl-11
                  `}
                />
              </div>

              <button
                type="button"
                onClick={addPolicy}
                disabled={isSaving || !policyInput.trim()}
                className="
                  flex h-12 shrink-0
                  items-center justify-center
                  gap-2 rounded-xl
                  bg-[#022B3A] px-5
                  text-sm font-semibold text-white
                  transition hover:bg-[#03455B]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Plus size={17} />
                Add Policy
              </button>
            </div>

            {formData.policies.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.policies.map((policy, index) => (
                  <div
                    key={`${policy}-${index}`}
                    className="
                        flex items-start
                        justify-between gap-3
                        rounded-xl
                        bg-[#F8FAF9]
                        px-4 py-3
                      "
                  >
                    <div className="flex items-start gap-3">
                      <Check
                        size={17}
                        className="
                            mt-0.5 shrink-0
                            text-[#FF8C00]
                          "
                      />

                      <span
                        className="
                            text-sm leading-6
                            text-[#022B3A]
                          "
                      >
                        {policy}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removePolicy(policy)}
                      disabled={isSaving}
                      className="
                      cursor-pointer
                          shrink-0
                          text-[#94A3B8]
                          transition
                          hover:text-red-500
                        "
                      aria-label="Remove policy"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.policies.length === 0 && (
              <div
                className="
                  mt-4 rounded-xl
                  border border-dashed
                  border-[#DDE4E2]
                  px-4 py-5
                  text-center text-xs
                  text-[#94A3B8]
                "
              >
                No shop policies added yet.
              </div>
            )}
          </div>
        </FormSection>

        {/* SHOP VISIBILITY */}

        <FormSection
          title="Shop Visibility"
          description="Control the shop's public/community visibility."
          icon={<Users size={20} />}
        >
          <div className="md:col-span-2">
            {/* COMMUNITY LISTED NOTE */}
            <div
              className="
        mt-2 rounded-xl
        border border-[#FFB45C]
        bg-[#FFF8ED]
        px-4 py-3
        mb-2
      "
            >
              <p className="text-xs font-bold text-[#D66F00]">
                ⚠️ Community Listed
              </p>

              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                This shop is listed to help users discover and suggest local
                shops. Products and ordering will not be visible to end users.
                Only the shop card with{" "}
                <span className="font-semibold text-[#D66F00]">
                  Community Listed
                </span>{" "}
                label and shop details will be shown.
              </p>
            </div>

            <ToggleField
              label="Community Listed"
              description="List the shop for discovery without enabling products or ordering."
              checked={formData.isCommunityListed}
              onChange={(value) =>
                handleBooleanChange("isCommunityListed", value)
              }
              icon={<Users size={20} />}
              disabled={isSaving}
            />

            <br />
            <br />
            <div
              className="
        mt-4 rounded-2xl
        border border-[#DDE4E2]
        bg-[#F8FAF9]
        p-5
      "
            >
              <p className="text-sm font-bold text-[#022B3A]">
                Platform-managed status
              </p>

              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                Verification, registration status, suspension status, ratings
                and review statistics are managed by the platform and are
                intentionally not editable here.
              </p>

              <div
                className="
          mt-4 grid gap-3
          sm:grid-cols-2
          lg:grid-cols-4
        "
              >
                <StatusBadge label="Verified" value={shop?.isVerified} />

                <StatusBadge label="Registered" value={shop?.isRegistered} />

                <StatusBadge label="Active" value={shop?.isActive} />

                <StatusBadge
                  label="Suspended"
                  value={shop?.isSuspended}
                  inverse
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* ERROR */}

        {(error || parentError) && (
          <div
            className="
              rounded-2xl
              border border-red-200
              bg-red-50
              px-5 py-4
              text-sm font-medium
              text-red-600
            "
          >
            {error || parentError}
          </div>
        )}

        {/* ACTIONS */}

        <div
          className="
            flex flex-col-reverse gap-3
            border-t border-[#DDE4E2]
            pt-6
            sm:flex-row
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="
              cursor-pointer
              rounded-xl
              border border-[#DDE4E2]
              bg-white
              px-6 py-3
              text-sm font-semibold
              text-[#022B3A]
              transition
              hover:bg-[#F8F4E9]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="
              flex cursor-pointer
              items-center justify-center
              gap-2 rounded-xl
              bg-[#FF8C00]
              px-7 py-3
              text-sm font-bold
              text-white
              transition
              hover:bg-[#E67E00]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Upload size={18} />

            {isSaving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

//---->>>> FORM SECTION

function FormSection({ title, description, icon, children }) {
  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <div
          className="
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-xl bg-orange-100
            text-[#FF8C00]
          "
        >
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#022B3A]">{title}</h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[#64748B]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div
        className="
          grid gap-5
          md:grid-cols-2
        "
      >
        {children}
      </div>
    </section>
  );
}

//--->>> FORM FIELD

function FormField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  required = false,
  min,
  step,
  inputMode,
  disabled = false,
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}

        {required && <span className="ml-1 text-[#FF8C00]">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div
            className="
              pointer-events-none
              absolute left-4 top-1/2
              -translate-y-1/2
              text-[#64748B]
            "
          >
            {icon}
          </div>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
          inputMode={inputMode}
          disabled={disabled}
          className={`
            ${inputClassName}
            ${icon ? "pl-11" : ""}
          `}
        />
      </div>
    </div>
  );
}

//--->>> TEXT AREA

function TextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  required = false,
  hint,
  icon,
  disabled = false,
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}

        {required && <span className="ml-1 text-[#FF8C00]">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div
            className="
              pointer-events-none
              absolute left-4 top-4
              text-[#64748B]
            "
          >
            {icon}
          </div>
        )}

        <textarea
          id={id}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          className={`
            w-full resize-none
            rounded-xl
            border border-[#DDE4E2]
            bg-white
            px-4 py-3.5
            ${icon ? "pl-11" : ""}
            text-sm leading-6
            text-[#022B3A]
            outline-none
            transition
            placeholder:text-[#94A3B8]
            focus:border-[#FF8C00]
            focus:ring-2
            focus:ring-[#FF8C00]/20
            disabled:cursor-not-allowed
            disabled:bg-[#F8FAF9]
            disabled:opacity-70
          `}
        />
      </div>

      <div className="mt-1 flex justify-between gap-4">
        {hint ? <p className="text-xs text-[#94A3B8]">{hint}</p> : <span />}

        {maxLength && (
          <span className="text-xs text-[#64748B]">
            {(value || "").length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

//--->>> SELECT

function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}

        {required && <span className="ml-1 text-[#FF8C00]">*</span>}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={inputClassName}
      >
        <option value="">Select category</option>

        {CATEGORY_OPTIONS.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}

//--->>> TOGGLE

function ToggleField({
  label,
  description,
  checked,
  onChange,
  icon,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className="
        flex w-full
        items-center justify-between
        gap-4 rounded-2xl
        border border-[#DDE4E2]
        bg-white p-5
        text-left transition
        hover:border-[#FFB45C]
        disabled:cursor-not-allowed
        disabled:opacity-70
      "
    >
      <div
        className="
          flex min-w-0
          items-center gap-3
        "
      >
        <div
          className="
            flex h-11 w-11
            shrink-0
            items-center justify-center
            rounded-xl
            bg-[#FFF0D9]
            text-[#FF8C00]
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-[#022B3A]">{label}</p>

          <p className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p>
        </div>
      </div>

      <div
        className={`
          relative h-6 w-11
          shrink-0 rounded-full
          transition
          ${checked ? "bg-[#FF8C00]" : "bg-[#CBD5E1]"}
        `}
      >
        <div
          className={`
            absolute top-1
            h-4 w-4 rounded-full
            bg-white shadow
            transition
            ${checked ? "left-6" : "left-1"}
          `}
        />
      </div>
    </button>
  );
}

//--->>> STATUS BADGE

function StatusBadge({ label, value, inverse = false }) {
  const active = inverse ? !value : Boolean(value);

  return (
    <div
      className="
        rounded-xl
        border border-[#DDE4E2]
        bg-white
        px-3 py-3
      "
    >
      <p
        className="
          text-[10px] font-semibold
          uppercase tracking-wide
          text-[#94A3B8]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1 text-xs font-bold
          ${active ? "text-emerald-600" : "text-red-500"}
        `}
      >
        {value ? "Yes" : "No"}
      </p>
    </div>
  );
}

//--->>> FILE ICON

function FileIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />

      <polyline points="14 2 14 8 20 8" />

      <line x1="16" y1="13" x2="8" y2="13" />

      <line x1="16" y1="17" x2="8" y2="17" />

      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

//--->>> STYLES

const labelClassName = `
  mb-2 block
  text-sm font-semibold
  text-[#022B3A]
`;

const inputClassName = `
  h-12 w-full
  rounded-xl
  border border-[#DDE4E2]
  bg-white
  px-4
  text-sm
  text-[#022B3A]
  outline-none
  transition
  placeholder:text-[#94A3B8]
  focus:border-[#FF8C00]
  focus:ring-2
  focus:ring-[#FF8C00]/20
  disabled:cursor-not-allowed
  disabled:bg-[#F8FAF9]
  disabled:opacity-70
`;

const imageContainerClassName = `
  overflow-hidden
  rounded-2xl
  border border-dashed
  border-[#CBD5E1]
  bg-[#F8FAF9]
`;

const uploadBoxClassName = `
  flex min-h-[240px]
  cursor-pointer
  flex-col items-center justify-center
  px-6 py-10
  text-center
`;

const uploadIconClassName = `
  flex h-14 w-14
  items-center justify-center
  rounded-2xl
  bg-[#FFF0D9]
  text-[#FF8C00]
`;

const removeButtonClassName = `
  absolute right-4 top-4
  flex h-10 w-10
  items-center justify-center
  rounded-full
  bg-black/60
  text-white
  transition
  hover:bg-red-500
`;

export default ShopForm;
