import { useEffect, useState } from "react";
import { ImagePlus, X, Upload, Sparkles, RefreshCw } from "lucide-react";
import { bulkProductAPI, sellerProductAPI } from "../../../../../services/api";

const initialForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  unit: "piece",
  image: null,
  images: [],
};

function ProductForm({ product, onSubmit, onClose }) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [generatingAi, setGeneratingAi] = useState(false);

  const isEditing = Boolean(product);

  //---->>>> LOAD PRODUCT FOR EDIT

  useEffect(() => {
    if (product) {
      const existingImages =
        product.images?.length > 0
          ? product.images
          : product.image || product.imageUrl
            ? [product.image || product.imageUrl]
            : [];

      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price ?? "",
        stock: product.stock ?? product.quantity ?? "",
        unit: product.unit || "piece",
        image: null,
        images: [],
      });

      setImagePreviews(
        existingImages.slice(0, 4).map((url) => ({
          url,
          isExisting: true,
          file: null,
        })),
      );
    } else {
      setFormData(initialForm);
      setImagePreviews([]);
    }

    setError("");
  }, [product]);

  //--->>> CLEANUP OBJECT URLS

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (!preview.isExisting && preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreviews]);

  //---->>> CHANGE HANDLER

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  //---->> IMAGE HANDLER

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setError("");

    const currentCount = imagePreviews.length;
    const remainingSlots = 4 - currentCount;

    if (remainingSlots <= 0) {
      setError("You can add a maximum of 4 images.");
      event.target.value = "";
      return;
    }

    if (files.length > remainingSlots) {
      setError(
        `You can add only ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        }. Maximum 4 images allowed.`,
      );
      event.target.value = "";
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      setError("Please select valid image files only.");
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFile) {
      setError("Each image must be less than 5MB.");
      event.target.value = "";
      return;
    }

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file,
    }));

    setImagePreviews((previous) => [...previous, ...newPreviews]);

    setFormData((previous) => ({
      ...previous,
      images: [...previous.images, ...files],
      image: previous.image || files[0],
    }));

    event.target.value = "";
  };

  //--->>>> REMOVE IMAGE

  const handleRemoveImage = (index) => {
    setError("");

    setImagePreviews((previous) => {
      const removedPreview = previous[index];

      if (removedPreview && !removedPreview.isExisting) {
        URL.revokeObjectURL(removedPreview.url);
      }

      return previous.filter((_, previewIndex) => previewIndex !== index);
    });

    setFormData((previous) => {
      const existingImageCount = imagePreviews.filter(
        (preview) => preview.isExisting,
      ).length;

      const removedPreview = imagePreviews[index];

      if (removedPreview?.isExisting) {
        return {
          ...previous,
          image: previous.images[0] || null,
        };
      }

      const newImages = [...previous.images];

      const newImageIndex = imagePreviews
        .slice(0, index)
        .filter((preview) => !preview.isExisting).length;

      newImages.splice(newImageIndex, 1);

      return {
        ...previous,
        images: newImages,
        image: newImages[0] || null,
      };
    });
  };

  //---->>> GENERATE AI PRODUCT PACKAGING IMAGE
  const handleGenerateAiImage = async () => {
    if (!formData.name.trim()) {
      setError("Please enter product name first to generate an authentic image.");
      return;
    }

    try {
      setGeneratingAi(true);
      setError("");

      let resultUrl = "";

      if (isEditing && product?._id) {
        const res = await sellerProductAPI.generateAiImage(
          product._id,
          true,
          formData.description,
        );
        if (res.data?.success && res.data.imageUrl) {
          resultUrl = res.data.imageUrl;
        }
      } else {
        const res = await bulkProductAPI.generateAiImage({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          packSize: formData.unit,
          forceAi: true,
        });
        if (res.data?.success && res.data.imageUrl) {
          resultUrl = res.data.imageUrl;
        }
      }

      if (resultUrl) {
        setImagePreviews((previous) => [
          { url: resultUrl, isExisting: true, file: null },
          ...previous.slice(0, 3),
        ]);
        setFormData((previous) => ({
          ...previous,
          image: resultUrl,
        }));
      } else {
        setError("Could not generate AI image. Please try again.");
      }
    } catch (err) {
      console.error("AI image generation error:", err);
      setError(
        err.response?.data?.message || "Failed to generate AI product image.",
      );
    } finally {
      setGeneratingAi(false);
    }
  };

  //--->> SUBMIT

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Product category is required.");
      return;
    }

    if (!formData.price || Number(formData.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    if (imagePreviews.length > 4) {
      setError("You can add a maximum of 4 images.");
      return;
    }

    const existingImages = imagePreviews
      .filter((preview) => preview.isExisting)
      .map((preview) => preview.url);

    const newImages = formData.images;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      unit: formData.unit,

      images: newImages,
      image: newImages[0] || null,

      existingImages,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#F8F4E9] shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[#DDE4E2] bg-[#022B3A] px-5 py-4 text-white sm:px-6">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">
              {isEditing ? "Edit Product" : "Add Product"}
            </h2>

            <p className="mt-0.5 text-xs text-white/70">
              {isEditing
                ? "Update your product information."
                : "Add a new product to your shop."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/10"
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6">
          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* PRODUCT NAME */}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Product Name *
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fresh Tomatoes"
                className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Category *
              </label>

              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Grocery"
                className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
              />
            </div>

            {/* UNIT */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Unit
              </label>

              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00]"
              >
                <option value="piece">Piece</option>
                <option value="kg">Kg</option>
                <option value="gram">Gram</option>
                <option value="litre">Litre</option>
                <option value="packet">Packet</option>
                <option value="box">Box</option>
                <option value="dozen">Dozen</option>
              </select>
            </div>

            {/* PRICE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Price (₹) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
              />
            </div>

            {/* STOCK */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Stock Quantity *
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
              />
            </div>

            {/* PRODUCT IMAGE */}

            {/* PRODUCT IMAGE */}

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#022B3A]">
                  <ImagePlus size={17} />
                  Product Images
                </label>

                <button
                  type="button"
                  onClick={handleGenerateAiImage}
                  disabled={generatingAi || !formData.name.trim()}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-[#FF8C00] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-[#e07b00] disabled:opacity-40 transition"
                  title="Generate authentic commercial packaging photo matching product name with AI"
                >
                  <Sparkles size={13} className={generatingAi ? "animate-spin" : ""} />
                  {generatingAi ? "Generating Packaging Photo..." : "✨ Auto-Generate with AI"}
                </button>
              </div>

              <div className="rounded-xl border border-dashed border-[#CBD5D1] bg-white p-4">
                {imagePreviews.length > 0 ? (
                  <div>
                    {/* IMAGE PREVIEWS */}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`${preview.url}-${index}`}
                          className="relative aspect-square overflow-hidden rounded-xl border border-[#DDE4E2] bg-[#F8F4E9]"
                        >
                          <img
                            src={preview.url}
                            alt={`Product preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="cursor-pointer absolute right-1.5 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X size={15} />
                          </button>

                          {index === 0 && (
                            <div className="absolute bottom-1.5 left-1.5 rounded-md bg-[#022B3A]/90 px-2 py-1 text-[10px] font-semibold text-white">
                              Main Image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* CHANGE / ADD IMAGE */}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#022B3A]">
                          {imagePreviews.length}/4 images selected
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          You can add up to 4 images. Each image must be less
                          than 5MB.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleGenerateAiImage}
                          disabled={generatingAi || !formData.name.trim() || imagePreviews.length >= 4}
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-40 transition"
                        >
                          <Sparkles size={14} className={generatingAi ? "animate-spin" : ""} />
                          {generatingAi ? "Generating..." : "Generate AI Photo"}
                        </button>

                        {imagePreviews.length < 4 && (
                          <label className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg border border-[#DDE4E2] bg-white px-3 py-2 text-xs font-semibold text-[#022B3A] transition hover:bg-[#FFF0D9] sm:self-auto">
                            <Upload size={15} />
                            Add Image
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* UPLOAD AREA */

                  <div className="flex flex-col items-center justify-center rounded-lg px-4 py-8 text-center transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                      <ImagePlus size={23} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#022B3A]">
                      Choose product images or auto-generate with AI
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      PNG, JPG, JPEG or WEBP • Maximum 4 images • 5MB each
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#E67E00]">
                        <Upload size={15} />
                        Browse Images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleGenerateAiImage}
                        disabled={generatingAi || !formData.name.trim()}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#022B3A] bg-white px-4 py-2 text-xs font-bold text-[#022B3A] hover:bg-[#022B3A] hover:text-white disabled:opacity-40 transition shadow-xs"
                      >
                        <Sparkles size={14} className={generatingAi ? "animate-spin text-amber-500" : "text-[#FF8C00]"} />
                        {generatingAi ? "Generating Packaging with AI..." : "✨ Auto-Generate with AI"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={1000}
                placeholder="Describe your product..."
                className="w-full resize-none rounded-xl border border-[#DDE4E2] bg-white p-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
              />

              <p className="mt-1 text-right text-xs text-[#64748B]">
                {formData.description.length}/1000
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-[#022B3A] px-5 py-3 text-sm font-semibold text-[#022B3A] transition hover:bg-[#022B3A] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-[#FF8C00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E67E00]"
            >
              {isEditing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
