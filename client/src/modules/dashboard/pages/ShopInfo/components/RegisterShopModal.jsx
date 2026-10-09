import { useEffect, useState } from "react";

import {
  Store,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Upload,
  X,
  Truck,
  ShoppingBag,
  CreditCard,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

//--->> CONSTANTS

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

const PAYMENT_OPTIONS = ["Cash", "UPI", "Card", "Online"];

const FACILITY_OPTIONS = [
  "Home Delivery",
  "UPI Payment",
  "Card Payment",
  "Parking",
  "Takeaway",
  "Wheelchair Accessible",
  "Air Conditioned",
];

const DEFAULT_OPENING_HOURS = {
  monday: {
    open: "09:00",
    close: "21:00",
    closed: false,
  },

  tuesday: {
    open: "09:00",
    close: "21:00",
    closed: false,
  },

  wednesday: {
    open: "09:00",
    close: "21:00",
    closed: false,
  },

  thursday: {
    open: "09:00",
    close: "21:00",
    closed: false,
  },

  friday: {
    open: "09:00",
    close: "21:00",
    closed: false,
  },

  saturday: {
    open: "09:00",
    close: "21:00",
    closed: false,
  },

  sunday: {
    open: "09:00",
    close: "21:00",
    closed: true,
  },
};

const MAX_GALLERY_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

//--->>> COMPONENT

function RegisterShopModal({ onCreated, createShop }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    about: "",

    phone: "",
    email: "",

    address: "",
    city: "",
    state: "",
    pincode: "",

    //-->>> Banner / main shop image
    image: null,

    //-->>> Shop logo
    logo: null,

    //->>> Maximum 4 gallery images
    gallery: [],

    openingHours: DEFAULT_OPENING_HOURS,

    acceptOrders: true,
    deliveryAvailable: false,
    takeawayAvailable: true,

    deliveryRadius: "5",
    minimumOrder: "0",

    paymentMethods: ["Cash", "UPI"],

    facilities: [],

    policies: [],
  });

  const [imagePreview, setImagePreview] = useState("");

  const [logoPreview, setLogoPreview] = useState("");

  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [policyInput, setPolicyInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  //--->>> CLEANUP IMAGE PREVIEWS

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }

      galleryPreviews.forEach((preview) => {
        if (preview?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreview, logoPreview, galleryPreviews]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  //-->>> IMAGE VALIDATION

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

  //--->>> BANNER / SHOP IMAGE

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

  //--->>> LOGO

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

  //---->> GALLERY

  const handleGalleryChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");

    const remainingSlots = MAX_GALLERY_IMAGES - formData.gallery.length;

    if (remainingSlots <= 0) {
      setError("You can upload a maximum of 4 gallery images.");

      event.target.value = "";

      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can upload a maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
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

    if (validFiles.length === 0) {
      event.target.value = "";

      return;
    }

    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setFormData((previous) => ({
      ...previous,
      gallery: [...previous.gallery, ...validFiles],
    }));

    setGalleryPreviews((previous) => [...previous, ...newPreviews]);

    event.target.value = "";
  };

  const handleRemoveGalleryImage = (index) => {
    const preview = galleryPreviews[index];

    if (preview?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(preview.url);
    }

    setGalleryPreviews((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );

    setFormData((previous) => ({
      ...previous,
      gallery: previous.gallery.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  //---->>> OPENING HOURS

  const handleOpeningHoursChange = (day, field, value) => {
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

  //--->>> PAYMENT METHODS

  const togglePaymentMethod = (paymentMethod) => {
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

  //--->>> FACILITIES

  function toggleFacility(facility) {
    setFormData((previous) => {
      const exists = previous.facilities.includes(facility);

      return {
        ...previous,

        facilities: exists
          ? previous.facilities.filter((item) => item !== facility)
          : [...previous.facilities, facility],
      };
    });
  }

  //--->> POLICY

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

  //--->> VALIDATION

  const validateForm = () => {
    if (!formData.image) {
      return "Shop banner image is required.";
    }

    if (!formData.logo) {
      return "Shop logo is required.";
    }

    if (formData.gallery.length > MAX_GALLERY_IMAGES) {
      return "You can upload a maximum of 4 gallery images.";
    }

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

    if (!Number.isFinite(radius) || radius < 0) {
      return "Delivery radius must be a valid number.";
    }

    const minimumOrder = Number(formData.minimumOrder);

    if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
      return "Minimum order must be a valid non-negative number.";
    }

    if (formData.paymentMethods.length === 0) {
      return "Please select at least one payment method.";
    }

    if (formData.deliveryAvailable && radius <= 0) {
      return "Please enter a delivery radius greater than 0.";
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

      payload.append("name", formData.name.trim());

      payload.append("category", formData.category.trim());

      payload.append("description", formData.description.trim());

      payload.append("about", formData.about.trim());

      //-->>> CONTACT

      payload.append("phone", formData.phone.trim());

      payload.append("email", formData.email.trim().toLowerCase());

      //-->> LOCATION

      payload.append("address", formData.address.trim());

      payload.append("city", formData.city.trim());

      payload.append("state", formData.state.trim());

      payload.append("pincode", formData.pincode.trim());

      //--->>> LOGO

      if (formData.logo) {
        payload.append("logo", formData.logo);
      }

      //--->>> BANNER / MAIN IMAGE

      if (formData.image) {
        payload.append("image", formData.image);
      }

      //--->> GALLERY

      formData.gallery.forEach((file) => {
        payload.append("gallery", file);
      });

      //--->> OPENING HOURS

      payload.append("openingHours", JSON.stringify(formData.openingHours));

      //--->>>> SERVICE OPTIONS

      payload.append("acceptOrders", String(formData.acceptOrders));

      payload.append("deliveryAvailable", String(formData.deliveryAvailable));

      payload.append("takeawayAvailable", String(formData.takeawayAvailable));

      payload.append("deliveryRadius", String(formData.deliveryRadius));

      payload.append("minimumOrder", String(formData.minimumOrder));

      //--->> PAYMENT

      payload.append("paymentMethods", JSON.stringify(formData.paymentMethods));

      //--->> FACILITIES

      payload.append("facilities", JSON.stringify(formData.facilities));

      //--->>> POLICIES

      payload.append("policies", JSON.stringify(formData.policies));

      const response = await createShop(payload);

      const createdShop = response?.shop || response?.data?.shop;

      if (!createdShop) {
        throw new Error("Shop was created but no shop data was returned.");
      }

      onCreated(createdShop);
    } catch (saveError) {
      console.error("Shop registration failed:", saveError);

      setError(saveError?.message || "Unable to create your shop.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        sm:p-5
      "
    >
      <div
        className="
          relative
          flex
          max-h-[95vh]
          w-full
          max-w-4xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            shrink-0
            border-b
            border-[#DDE4E2]
            bg-white
            p-5
            sm:p-6
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#FF8C00]">
                Seller Setup
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#022B3A]">
                Register Your Shop
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
                Complete your shop profile before you start selling. Fields
                marked with
                <span className="mx-1 font-bold text-[#FF8C00]">*</span>
                are required.
              </p>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#FFF0D9]
                text-[#FF8C00]
              "
            >
              <Store size={21} />
            </div>
          </div>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7">
          {/* SECTION 1 - BASIC INFORMATION */}

          <FormSection
            number="01"
            title="Basic Shop Information"
            description="Tell customers what your shop is and what it offers."
          >
            {/* LOGO  */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Shop Logo
                <span className="ml-1 text-[#FF8C00]">*</span>
              </label>

              <div
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-dashed
                  border-[#CBD5E1]
                  bg-[#F8FAF9]
                "
              >
                {logoPreview ? (
                  <div className="relative flex min-h-[180px] items-center justify-center p-5">
                    <img
                      src={logoPreview}
                      alt="Shop logo preview"
                      className="
                        h-40
                        w-40
                        rounded-xl
                        object-contain
                      "
                    />

                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={isSaving}
                      className="
                      cursor-pointer
                        absolute
                        right-3
                        top-3
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-black/60
                        text-white
                        hover:bg-red-500
                      "
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="register-shop-logo"
                    className="
                      flex
                      min-h-[180px]
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      px-5
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#FFF0D9]
                        text-[#FF8C00]
                      "
                    >
                      <Store size={26} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#022B3A]">
                      Upload shop logo
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      JPG, PNG or WEBP • Maximum 5 MB
                    </p>
                  </label>
                )}

                <input
                  id="register-shop-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleLogoChange}
                  disabled={isSaving}
                  className="hidden"
                />
              </div>
            </div>

            {/* BANNER / SHOP IMAGE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Shop Banner
                <span className="ml-1 text-[#FF8C00]">*</span>
              </label>

              <div
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-dashed
                  border-[#CBD5E1]
                  bg-[#F8FAF9]
                "
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Shop banner preview"
                      className="
                        h-52
                        w-full
                        object-cover
                      "
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSaving}
                      className="
                      cursor-pointer
                        absolute
                        right-3
                        top-3
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-black/60
                        text-white
                        hover:bg-red-500
                      "
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="register-shop-image"
                    className="
                      flex
                      min-h-[180px]
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      px-5
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#FFF0D9]
                        text-[#FF8C00]
                      "
                    >
                      <ImageIcon size={26} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#022B3A]">
                      Upload shop banner
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      JPG, PNG or WEBP • Maximum 5 MB
                    </p>
                  </label>
                )}

                <input
                  id="register-shop-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  disabled={isSaving}
                  className="hidden"
                />
              </div>
            </div>

            {/* GALLERY */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Shop Gallery
              </label>

              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-[#CBD5E1]
                  bg-[#F8FAF9]
                  p-4
                "
              >
                {galleryPreviews.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {galleryPreviews.map((preview, index) => (
                      <div
                        key={`${preview.url}-${index}`}
                        className="
                          relative
                          aspect-square
                          overflow-hidden
                          rounded-xl
                          border
                          border-[#DDE4E2]
                          bg-white
                        "
                      >
                        <img
                          src={preview.url}
                          alt={`Gallery preview ${index + 1}`}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          disabled={isSaving}
                          className="
                          cursor-pointer
                            absolute
                            right-2
                            top-2
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-black/60
                            text-white
                            hover:bg-red-500
                          "
                        >
                          <X size={15} />
                        </button>

                        <div
                          className="
                            absolute
                            bottom-2
                            left-2
                            rounded-md
                            bg-black/60
                            px-2
                            py-1
                            text-[10px]
                            font-semibold
                            text-white
                          "
                        >
                          {index + 1}/4
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {galleryPreviews.length < MAX_GALLERY_IMAGES && (
                  <label
                    htmlFor="register-shop-gallery"
                    className="
                      flex
                      min-h-[150px]
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      px-5
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#FFF0D9]
                        text-[#FF8C00]
                      "
                    >
                      <ImageIcon size={26} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#022B3A]">
                      Add gallery images
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Select up to {MAX_GALLERY_IMAGES - galleryPreviews.length}{" "}
                      more image
                      {MAX_GALLERY_IMAGES - galleryPreviews.length !== 1
                        ? "s"
                        : ""}{" "}
                      • Maximum 4 total • 5 MB each
                    </p>
                  </label>
                )}

                {galleryPreviews.length === MAX_GALLERY_IMAGES && (
                  <div
                    className="
                      rounded-lg
                      bg-[#FFF0D9]
                      px-4
                      py-3
                      text-center
                      text-xs
                      font-semibold
                      text-[#D66F00]
                    "
                  >
                    Maximum 4 gallery images reached.
                  </div>
                )}

                <input
                  id="register-shop-gallery"
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

            <FormField
              label="Shop Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: FreshMart Grocery Store"
              icon={<Store size={18} />}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Category
                <span className="ml-1 text-[#FF8C00]">*</span>
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isSaving}
                className={inputClassName}
              >
                <option value="">Select category</option>

                <option value="Grocery">Grocery</option>

                <option value="Bakery">Bakery</option>

                <option value="Pharmacy">Pharmacy</option>

                <option value="Fashion">Fashion</option>

                <option value="Electronics">Electronics</option>

                <option value="Restaurant">Restaurant</option>

                <option value="Fresh Produce">Fresh Produce</option>

                <option value="Beauty">Beauty</option>

                <option value="Home & Kitchen">Home & Kitchen</option>

                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <TextAreaField
                label="Short Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Example: Fresh groceries, fruits, vegetables, dairy products and daily essentials."
                maxLength={2000}
                required
              />
            </div>

            <div className="md:col-span-2">
              <TextAreaField
                label="About Your Shop"
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Tell customers about your business, experience, products and what makes your shop special."
                maxLength={5000}
                required
              />
            </div>
          </FormSection>

          {/* SECTION 2 - CONTACT */}

          <FormSection
            number="02"
            title="Contact Information"
            description="Customers and the platform can use these details to contact your business."
          >
            <FormField
              label="Shop Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9890898546"
              icon={<Phone size={18} />}
              required
            />

            <FormField
              label="Shop Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="shop@example.com"
              icon={<Mail size={18} />}
              required
            />
          </FormSection>

          {/* SECTION 3 - LOCATION */}

          <FormSection
            number="03"
            title="Shop Location"
            description="This address is used for your shop location and nearby-shop discovery."
          >
            <div className="md:col-span-2">
              <FormField
                label="Complete Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Market Road, Near Central Market"
                icon={<MapPin size={18} />}
                required
              />
            </div>

            <FormField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Nagpur"
              icon={<MapPin size={18} />}
              required
            />

            <FormField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Maharashtra"
              icon={<MapPin size={18} />}
              required
            />

            <FormField
              label="Pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="440001"
              icon={<MapPin size={18} />}
              required
            />

            <div
              className="
                rounded-xl
                border
                border-[#DDE4E2]
                bg-[#F8FAF9]
                p-4
                text-sm
                leading-6
                text-[#64748B]
                md:col-span-2
              "
            >
              <strong className="text-[#022B3A]">Location note:</strong> Enter
              your shop's address, city, state, and pincode to register your shop.
            </div>
          </FormSection>

          {/* SECTION 4 - BUSINESS HOURS */}

          <FormSection
            number="04"
            title="Business Hours"
            description="Set the opening and closing time for each day."
          >
            <div className="md:col-span-2">
              <div className="overflow-hidden rounded-xl border border-[#DDE4E2]">
                {DAYS.map((day) => {
                  const hours = formData.openingHours[day.key];

                  return (
                    <div
                      key={day.key}
                      className="
                        grid
                        gap-3
                        border-b
                        border-[#DDE4E2]
                        p-4
                        last:border-b-0
                        sm:grid-cols-[130px_1fr_1fr_auto]
                        sm:items-center
                      "
                    >
                      <div className="text-sm font-semibold text-[#022B3A]">
                        {day.label}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#64748B]">
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
                        <label className="mb-1 block text-xs text-[#64748B]">
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
                          className="h-4 w-4 accent-[#FF8C00]"
                        />
                        Closed
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </FormSection>

          {/* SECTION 5 - SERVICE OPTIONS */}

          <FormSection
            number="05"
            title="Order & Delivery Settings"
            description="Configure how customers can order from your shop."
          >
            <ToggleField
              label="Accept Orders"
              description="Allow customers to place orders."
              checked={formData.acceptOrders}
              onChange={(checked) =>
                setFormData((previous) => ({
                  ...previous,
                  acceptOrders: checked,
                }))
              }
              icon={<ShoppingBag size={18} />}
            />

            <ToggleField
              label="Home Delivery"
              description="Offer delivery to customers."
              checked={formData.deliveryAvailable}
              onChange={(checked) =>
                setFormData((previous) => ({
                  ...previous,
                  deliveryAvailable: checked,
                }))
              }
              icon={<Truck size={18} />}
            />

            <ToggleField
              label="Takeaway"
              description="Allow customers to collect orders."
              checked={formData.takeawayAvailable}
              onChange={(checked) =>
                setFormData((previous) => ({
                  ...previous,
                  takeawayAvailable: checked,
                }))
              }
              icon={<ShoppingBag size={18} />}
            />

            <FormField
              label="Delivery Radius (km)"
              name="deliveryRadius"
              type="number"
              value={formData.deliveryRadius}
              onChange={handleChange}
              placeholder="5"
              min="0"
              step="0.5"
              icon={<Truck size={18} />}
            />

            <FormField
              label="Minimum Order Amount (₹)"
              name="minimumOrder"
              type="number"
              value={formData.minimumOrder}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="1"
              icon={<ShoppingBag size={18} />}
            />
          </FormSection>

          {/* SECTION 6 - PAYMENTS */}

          <FormSection
            number="06"
            title="Payment Methods"
            description="Select all payment methods your shop accepts."
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
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        px-4
                        py-3
                        text-left
                        text-sm
                        font-semibold
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
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-md
                          border
                          text-xs
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

          {/* SECTION 7 - FACILITIES */}

          <FormSection
            number="07"
            title="Shop Facilities"
            description="Choose the facilities available at your shop."
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
                        rounded-full
                        border
                        px-4
                        py-2
                        text-sm
                        font-medium
                        transition
                        ${
                          selected
                            ? "border-[#FF8C00] bg-[#FFF0D9] text-[#D66F00]"
                            : "border-[#DDE4E2] bg-white text-[#64748B] hover:border-[#FFB45C]"
                        }
                      `}
                    >
                      {facility}
                    </button>
                  );
                })}
              </div>
            </div>
          </FormSection>

          {/* SECTION 8 - POLICIES */}

          <FormSection
            number="08"
            title="Shop Policies"
            description="Add important policies customers should know."
          >
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FileText
                    size={18}
                    className="
                      absolute
                      left-4
                      top-1/2
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
                  cursor-pointer
                    flex
                    h-12
                    shrink-0
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#022B3A]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-[#03455B]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Plus size={17} />
                  Add
                </button>
              </div>

              {formData.policies.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.policies.map((policy) => (
                    <div
                      key={policy}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        bg-[#F8FAF9]
                        px-4
                        py-3
                      "
                    >
                      <div className="flex items-start gap-3">
                        <FileText
                          size={17}
                          className="mt-0.5 shrink-0 text-[#FF8C00]"
                        />

                        <span className="text-sm text-[#022B3A]">{policy}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePolicy(policy)}
                        disabled={isSaving}
                        className="
                        cursor-pointer
                          shrink-0
                          text-[#94A3B8]
                          hover:text-red-500
                        "
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          {/* ERROR */}

          {error && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* FOOTER */}

          <div
            className="
              mt-7
              border-t
              border-[#DDE4E2]
              pt-6
            "
          >
            <div
              className="
                mb-5
                rounded-xl
                border
                border-[#FFE0B2]
                bg-[#FFF9F0]
                px-4
                py-3
                text-sm
                leading-6
                text-[#64748B]
              "
            >
              <strong className="text-[#022B3A]">Before registering:</strong>{" "}
              Please make sure your shop name, contact details, address,
              business hours and payment methods are correct. Your address will
              be used to locate your shop on the platform.
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="
              cursor-pointer
                flex
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#FF8C00]
                px-6
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#E67E00]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Upload size={18} />

              {isSaving
                ? "Registering Your Shop..."
                : "Register Shop & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//--->>> FORM SECTION

function FormSection({ number, title, description, children }) {
  return (
    <section className="mb-8">
      <div className="mb-5 flex items-start gap-3">
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#FFF0D9]
            text-xs
            font-bold
            text-[#FF8C00]
          "
        >
          {number}
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#022B3A]">{title}</h3>

          <p className="mt-1 text-sm text-[#64748B]">{description}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

//--->>> FORM FIELD

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  min,
  step,
  inputMode,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
        {label}

        {required && <span className="ml-1 text-[#FF8C00]">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#64748B]
            "
          >
            {icon}
          </div>
        )}

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={false}
          min={min}
          step={step}
          inputMode={inputMode}
          className={`
            ${inputClassName}
            ${icon ? "pl-11" : ""}
          `}
        />
      </div>
    </div>
  );
}

//---->>> TEXT AREA

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
        {label}

        {required && <span className="ml-1 text-[#FF8C00]">*</span>}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        rows={4}
        className="
          w-full
          resize-none
          rounded-xl
          border
          border-[#DDE4E2]
          bg-white
          p-4
          text-sm
          text-[#022B3A]
          outline-none
          placeholder:text-[#94A3B8]
          focus:border-[#FF8C00]
          focus:ring-2
          focus:ring-[#FF8C00]/20
        "
      />
    </div>
  );
}

//--->> TOGGLE FIELD

function ToggleField({ label, description, checked, onChange, icon }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="
      cursor-pointer
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-[#DDE4E2]
        bg-white
        p-4
        text-left
        transition
        hover:border-[#FFB45C]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#FFF0D9]
            text-[#FF8C00]
          "
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-[#022B3A]">{label}</p>

          <p className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p>
        </div>
      </div>

      <div
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition
          ${checked ? "bg-[#FF8C00]" : "bg-[#CBD5E1]"}
        `}
      >
        <div
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            shadow
            transition
            ${checked ? "left-6" : "left-1"}
          `}
        />
      </div>
    </button>
  );
}

//--->>> INPUT CLASS

const inputClassName = `
  h-12
  w-full
  rounded-xl
  border
  border-[#DDE4E2]
  bg-white
  px-4
  text-sm
  text-[#022B3A]
  outline-none
  placeholder:text-[#94A3B8]
  focus:border-[#FF8C00]
  focus:ring-2
  focus:ring-[#FF8C00]/20
  disabled:cursor-not-allowed
  disabled:bg-[#F8FAF9]
  disabled:opacity-70
`;

export default RegisterShopModal;
