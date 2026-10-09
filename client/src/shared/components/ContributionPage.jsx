import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Store,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { contributionAPI } from "../../services/api";

const INITIAL_FORM_DATA = {
  //--->>> SHOP

  shopName: "",
  category: "",
  shopAddress: "",
  shopCity: "",
  shopState: "",
  shopPincode: "",
  shopPhone: "",
  shopEmail: "",
  shopOpeningTime: "",
  shopClosingTime: "",
  shopAbout: "",
  shopLatitude: "",
  shopLongitude: "",

  shopLogo: null,
  shopBanner: null,
  shopGallery: [],
};

const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

function isValidLatitude(value) {
  const number = Number(value);

  return (
    value !== "" &&
    Number.isFinite(number) &&
    number >= LATITUDE_MIN &&
    number <= LATITUDE_MAX
  );
}

function isValidLongitude(value) {
  const number = Number(value);

  return (
    value !== "" &&
    Number.isFinite(number) &&
    number >= LONGITUDE_MIN &&
    number <= LONGITUDE_MAX
  );
}

function ContributionPage() {
  const navigate = useNavigate();

  const [contributionType, setContributionType] = useState("shop");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  //--->> UPDATE FIELD

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }

    if (serverErrors[field]) {
      setServerErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  //--->>> VALIDATION

  const validateForm = () => {
    const newErrors = {};

    //-->> SHOP

    if (contributionType === "shop") {
      if (!formData.shopName.trim()) {
        newErrors.shopName = "Shop name is required.";
      }

      if (!formData.category.trim()) {
        newErrors.category = "Category is required.";
      }

      if (!formData.shopAddress.trim()) {
        newErrors.shopAddress = "Shop address is required.";
      }

      if (!formData.shopCity.trim()) {
        newErrors.shopCity = "City is required.";
      }

      if (!formData.shopState.trim()) {
        newErrors.shopState = "State is required.";
      }

      if (!formData.shopPhone.trim()) {
        newErrors.shopPhone = "Phone number is required.";
      }

      if (!formData.shopOpeningTime) {
        newErrors.shopOpeningTime = "Opening time is required.";
      }

      if (!formData.shopClosingTime) {
        newErrors.shopClosingTime = "Closing time is required.";
      }

      if (!formData.shopLatitude) {
        newErrors.shopLatitude = "Latitude is required.";
      } else if (!isValidLatitude(formData.shopLatitude)) {
        newErrors.shopLatitude = "Latitude must be between -90 and 90.";
      }

      if (!formData.shopLongitude) {
        newErrors.shopLongitude = "Longitude is required.";
      } else if (!isValidLongitude(formData.shopLongitude)) {
        newErrors.shopLongitude = "Longitude must be between -180 and 180.";
      }

      if (!formData.shopBanner) {
        newErrors.shopBanner = "Banner image is required.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  //-->>> BUILD SHOP PAYLOAD

  const buildShopPayload = () => {
    return {
      shopName: formData.shopName.trim(),

      category: formData.category.trim(),

      shopDescription: formData.shopAbout.trim(),

      shopAbout: formData.shopAbout.trim(),

      shopPhone: formData.shopPhone.trim(),

      shopEmail: formData.shopEmail.trim(),

      shopAddress: formData.shopAddress.trim(),

      shopCity: formData.shopCity.trim(),

      shopState: formData.shopState.trim(),

      shopPincode: formData.shopPincode.trim(),

      shopOpeningTime: formData.shopOpeningTime,

      shopClosingTime: formData.shopClosingTime,

      shopLatitude: formData.shopLatitude,

      shopLongitude: formData.shopLongitude,
    };
  };

  //--->>> HANDLE SUBMIT

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = buildShopPayload();

      const requestData = new FormData();

      //--->>>> TYPE

      requestData.append("type", "shop");

      //--->>> JSON DATA

      requestData.append("data", JSON.stringify(payload));

      //--->>> SHOP FILES

      if (formData.shopLogo) {
        requestData.append("shopLogo", formData.shopLogo);
      }

      if (formData.shopBanner) {
        requestData.append("shopBanner", formData.shopBanner);
      }

      formData.shopGallery.forEach((file) => {
        requestData.append("shopGallery", file);
      });

      //--->>> API REQUEST

      await contributionAPI.submit(requestData);

      setSubmitted(true);
    } catch (error) {
      console.error("Contribution submission error:", error);

      const responseData = error.response?.data;

      const message =
        responseData?.message ||
        "Failed to submit contribution. Please try again.";

      if (Array.isArray(responseData?.fields)) {
        const backendFieldErrors = {};

        responseData.fields.forEach((field) => {
          backendFieldErrors[field] = message;
        });

        setServerErrors(backendFieldErrors);
      }

      if (responseData?.errors) {
        setServerErrors(responseData.errors);
      }

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  //--->>> RESET

  const handleReset = () => {
    setSubmitted(false);
    setSubmitting(false);
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setServerErrors({});
    setContributionType("shop");
  };

  //--->>> CHANGE CONTRIBUTION TYPE

  const changeContributionType = (type) => {
    if (submitting) return;

    setContributionType(type);
    setErrors({});
    setServerErrors({});
  };

  return (
    <main className="min-h-screen bg-[#F8F4E9]">
      {/* PAGE HEADER */}

      <section className="border-b border-[#DDE4E2] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#022B3A] transition hover:text-[#FF8C00]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF0D9] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FF8C00]">
              <Users size={14} />
              Community Contribution
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#022B3A] sm:text-4xl">
              Help us discover local businesses
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#64748B]">
              Know a great local shop that should be on ShopLocal? Share the
              details and help people discover businesses in their community.
            </p>
          </div>
        </div>
      </section>

      {/*  MAIN CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/*  LEFT INFORMATION CARD */}

          <aside className="h-fit rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              What can you contribute?
            </p>

            <div className="mt-5 space-y-3">
              <ContributionTypeCard
                active={true}
                icon={<Store size={20} />}
                title="Local Shop"
                description="Add a local business or shop."
                onClick={() => { }}
              />
            </div>

            <div className="my-6 h-px bg-[#DDE4E2]" />

            <div className="space-y-4">
              <InfoItem
                icon={<CheckCircle2 size={18} />}
                title="Community driven"
                description="Help people discover genuine local places."
              />

              <InfoItem
                icon={<FileText size={18} />}
                title="Provide accurate details"
                description="Correct information helps everyone."
              />

              <InfoItem
                icon={<Users size={18} />}
                title="Community verification"
                description="Contributions can be verified before publishing."
              />
            </div>
          </aside>

          {/*  FORM AREA */}

          <div className="min-w-0">
            {submitted ? (
              <SuccessState
                type={contributionType}
                onSubmitAnother={handleReset}
                onBack={() => navigate("/")}
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-2xl border border-[#DDE4E2] bg-white shadow-sm"
              >
                {/* FORM HEADER */}

                <div className="border-b border-[#DDE4E2] px-5 py-6 sm:px-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                      <Store size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[#022B3A]">
                        Add a Local Shop
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Tell us about a local shop that people in your area should know about.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SHOP FORM */}

                {contributionType === "shop" && (
                  <div className="space-y-8 p-5 sm:p-8">
                    <FormSection
                      title="Basic Information"
                      description="Add the essential details about the shop."
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Shop Name"
                          required
                          error={errors.shopName || serverErrors.shopName}
                          className="sm:col-span-2"
                        >
                          <Input
                            value={formData.shopName}
                            onChange={(value) => updateField("shopName", value)}
                            placeholder="e.g. Sharma Grocery Store"
                          />
                        </FormField>

                        <FormField
                          label="Category"
                          required
                          error={errors.category || serverErrors.category}
                          className="sm:col-span-2"
                        >
                          <Input
                            value={formData.category}
                            onChange={(value) => updateField("category", value)}
                            placeholder="e.g. Grocery, Bakery, Electronics"
                          />
                        </FormField>

                        <FormField
                          label="About / Description"
                          className="sm:col-span-2"
                        >
                          <Textarea
                            value={formData.shopAbout}
                            onChange={(value) =>
                              updateField("shopAbout", value)
                            }
                            placeholder="Tell people about this shop, what it sells, and what makes it useful."
                            rows={5}
                          />
                        </FormField>
                      </div>
                    </FormSection>

                    <FormSection
                      title="Location"
                      description="Provide the exact shop location."
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Address"
                          required
                          error={errors.shopAddress || serverErrors.shopAddress}
                          className="sm:col-span-2"
                        >
                          <Textarea
                            value={formData.shopAddress}
                            onChange={(value) =>
                              updateField("shopAddress", value)
                            }
                            placeholder="Shop number, street, landmark, locality, city, etc."
                            rows={4}
                          />
                        </FormField>

                        <FormField
                          label="City"
                          required
                          error={errors.shopCity || serverErrors.shopCity}
                        >
                          <Input
                            value={formData.shopCity}
                            onChange={(value) => updateField("shopCity", value)}
                            placeholder="e.g. Anand"
                          />
                        </FormField>

                        <FormField
                          label="State"
                          required
                          error={errors.shopState || serverErrors.shopState}
                        >
                          <Input
                            value={formData.shopState}
                            onChange={(value) =>
                              updateField("shopState", value)
                            }
                            placeholder="e.g. Gujarat"
                          />
                        </FormField>

                        <FormField
                          label="Pincode"
                          error={errors.shopPincode || serverErrors.shopPincode}
                        >
                          <Input
                            value={formData.shopPincode}
                            onChange={(value) =>
                              updateField("shopPincode", value)
                            }
                            placeholder="e.g. 388120"
                            inputMode="numeric"
                          />
                        </FormField>

                        <FormField
                          label="Latitude"
                          required
                          error={
                            errors.shopLatitude || serverErrors.shopLatitude
                          }
                        >
                          <Input
                            type="number"
                            value={formData.shopLatitude}
                            onChange={(value) =>
                              updateField("shopLatitude", value)
                            }
                            placeholder="e.g. 21.1458"
                            inputMode="decimal"
                          />
                        </FormField>

                        <FormField
                          label="Longitude"
                          required
                          error={
                            errors.shopLongitude || serverErrors.shopLongitude
                          }
                        >
                          <Input
                            type="number"
                            value={formData.shopLongitude}
                            onChange={(value) =>
                              updateField("shopLongitude", value)
                            }
                            placeholder="e.g. 79.0882"
                            inputMode="decimal"
                          />
                        </FormField>
                      </div>
                    </FormSection>

                    <FormSection
                      title="Contact"
                      description="Provide the available contact information."
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Phone Number"
                          required
                          error={errors.shopPhone || serverErrors.shopPhone}
                        >
                          <Input
                            type="tel"
                            value={formData.shopPhone}
                            onChange={(value) =>
                              updateField("shopPhone", value)
                            }
                            placeholder="10-digit phone number"
                            inputMode="tel"
                          />
                        </FormField>

                        <FormField label="Email">
                          <Input
                            type="email"
                            value={formData.shopEmail}
                            onChange={(value) =>
                              updateField("shopEmail", value)
                            }
                            placeholder="contact@example.com"
                          />
                        </FormField>
                      </div>
                    </FormSection>

                    <FormSection
                      title="Timing"
                      description="Add the usual opening and closing time."
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Opening Time"
                          required
                          error={
                            errors.shopOpeningTime ||
                            serverErrors.shopOpeningTime
                          }
                        >
                          <Input
                            type="time"
                            value={formData.shopOpeningTime}
                            onChange={(value) =>
                              updateField("shopOpeningTime", value)
                            }
                          />
                        </FormField>

                        <FormField
                          label="Closing Time"
                          required
                          error={
                            errors.shopClosingTime ||
                            serverErrors.shopClosingTime
                          }
                        >
                          <Input
                            type="time"
                            value={formData.shopClosingTime}
                            onChange={(value) =>
                              updateField("shopClosingTime", value)
                            }
                          />
                        </FormField>
                      </div>
                    </FormSection>

                    <FormSection
                      title="Shop Images"
                      description="Add one logo, one banner and up to four gallery images."
                    >
                      <div className="space-y-6">
                        <ImageUpload
                          label="Shop Logo"
                          description="Upload 1 logo image."
                          value={formData.shopLogo}
                          onChange={(file) => updateField("shopLogo", file)}
                        />

                        <ImageUpload
                          label="Shop Banner"
                          description="Upload 1 banner image."
                          value={formData.shopBanner}
                          onChange={(file) => updateField("shopBanner", file)}
                          error={errors.shopBanner || serverErrors.shopBanner}
                        />

                        <MultipleImageUpload
                          label="Gallery"
                          description="Upload up to 4 gallery images."
                          value={formData.shopGallery}
                          onChange={(files) =>
                            updateField("shopGallery", files)
                          }
                          maxFiles={4}
                        />
                      </div>
                    </FormSection>

                    <SubmitSection submitting={submitting} />
                  </div>
                )}


              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* CONTRIBUTION TYPE CARD */

function ContributionTypeCard({ active, icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition ${active
          ? "border-[#FF8C00] bg-[#FFF0D9]"
          : "border-[#DDE4E2] bg-white hover:border-[#FF8C00]/50 hover:bg-[#FFF8ED]"
        }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${active
            ? "bg-[#FF8C00] text-white"
            : "bg-[#F1F5F4] text-[#022B3A] group-hover:bg-[#FFF0D9] group-hover:text-[#FF8C00]"
          }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#022B3A]">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p>
      </div>

      {active && (
        <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#FF8C00]" />
      )}
    </button>
  );
}

/*INFORMATION ITEM */

function InfoItem({ icon, title, description }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#022B3A]">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p>
      </div>
    </div>
  );
}

/* FORM SECTION */

function FormSection({ title, description, children }) {
  return (
    <section>
      <div className="mb-5">
        <h3 className="text-base font-bold text-[#022B3A]">{title}</h3>

        <p className="mt-1 text-sm text-[#64748B]">{description}</p>
      </div>

      {children}
    </section>
  );
}

/* FORM FIELD */

function FormField({
  label,
  required = false,
  error,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
        {label}

        {required && <span className="ml-1 text-[#FF8C00]">*</span>}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

/* INPUT */

function Input({ value, onChange, placeholder, type = "text", inputMode }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      step={type === "number" ? "any" : undefined}
      className="h-12 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/15"
    />
  );
}

/* SELECT */

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/15"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option || "Select an option"}
        </option>
      ))}
    </select>
  );
}

/* TEXTAREA */

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-xl border border-[#DDE4E2] bg-white px-4 py-3 text-sm leading-6 text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/15"
    />
  );
}

/* SINGLE IMAGE UPLOAD */

function ImageUpload({ label, description, value, onChange, error }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG or WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    onChange(file);

    event.target.value = "";
  };

  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-semibold text-[#022B3A]">{label}</p>

        <p className="mt-1 text-xs text-[#64748B]">{description}</p>
      </div>

      {!value ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DDE4E2] bg-[#FAFCFB] px-5 py-8 text-center transition hover:border-[#FF8C00] hover:bg-[#FFF8ED]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
            <Upload size={21} />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#022B3A]">
            Upload an image
          </p>

          <p className="mt-1 text-xs text-[#64748B]">
            JPG, PNG or WEBP • Maximum 5MB
          </p>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-[#DDE4E2] bg-[#FAFCFB] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
              <Upload size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#022B3A]">
                {value.name}
              </p>

              <p className="text-xs text-[#64748B]">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#64748B] transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${label}`}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

/* MULTIPLE IMAGE UPLOAD */

function MultipleImageUpload({
  label,
  description,
  value,
  onChange,
  maxFiles = 4,
}) {
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    const remainingSlots = maxFiles - value.length;

    if (remainingSlots <= 0) {
      alert(`You can upload a maximum of ${maxFiles} images.`);
      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    const validFiles = filesToAdd.filter((file) => {
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a JPG, PNG or WEBP image.`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB and was not added.`);
        return false;
      }

      return true;
    });

    onChange([...value, ...validFiles]);

    event.target.value = "";
  };

  const removeFile = (index) => {
    onChange(value.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-semibold text-[#022B3A]">{label}</p>

        <p className="mt-1 text-xs text-[#64748B]">{description}</p>
      </div>

      {value.length < maxFiles && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DDE4E2] bg-[#FAFCFB] px-5 py-8 text-center transition hover:border-[#FF8C00] hover:bg-[#FFF8ED]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
            <Upload size={21} />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#022B3A]">
            Add gallery images
          </p>

          <p className="mt-1 text-xs text-[#64748B]">
            {value.length}/{maxFiles} images • JPG, PNG or WEBP • Maximum 5MB
            each
          </p>

          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-xl border border-[#DDE4E2] bg-[#FAFCFB] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
                  <Upload size={17} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#022B3A]">
                    {file.name}
                  </p>

                  <p className="text-xs text-[#64748B]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#64748B] transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove image ${index + 1}`}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* SUBMIT SECTION */

function SubmitSection({ submitting }) {
  return (
    <div className="border-t border-[#DDE4E2] pt-6">
      <div className="rounded-xl bg-[#F8F4E9] p-4">
        <div className="flex gap-3">
          <Clock3 size={19} className="mt-0.5 shrink-0 text-[#FF8C00]" />

          <p className="text-xs leading-5 text-[#64748B]">
            Your contribution will be recorded and can be verified before being
            made publicly available. Please make sure the information and
            location are accurate.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#033B4F] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Submitting...
          </>
        ) : (
          <>
            Submit Contribution
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}

/* SUCCESS STATE */

function SuccessState({ type, onSubmitAnother, onBack }) {
  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 size={32} />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-[#022B3A]">
        Contribution Submitted
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#64748B]">
        Thank you for helping build a better local discovery platform. Your shop
        contribution has been recorded successfully.
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSubmitAnother}
          className="cursor-pointer rounded-xl border border-[#022B3A] px-5 py-3 text-sm font-semibold text-[#022B3A] transition hover:bg-[#022B3A] hover:text-white"
        >
          Add Another
        </button>

        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-xl bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E67E00]"
        >
          Back to ShopLocal
        </button>
      </div>
    </div>
  );
}

export default ContributionPage;
