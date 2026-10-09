import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Package,
  Trash2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { sellerProductAPI } from "../../../../../services/api";

function ProductCard({ product, onEdit, onDelete, onProductUpdated }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localImage, setLocalImage] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  const stock = Number(product.stock ?? product.quantity ?? 0);

  const price = Number(product.price || 0);

  //----->>> PRODUCT IMAGES

  const productImages = localImage
    ? [localImage]
    : Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : product.image || product.imageUrl
        ? [product.image || product.imageUrl]
        : [];

  const hasMultipleImages = productImages.length > 1;

  const currentImage = productImages[currentImageIndex];

  //--->>> GENERATE AI IMAGE
  const handleGenerateAiImage = async () => {
    const prodId = product._id || product.id;
    if (!prodId) return;

    try {
      setGeneratingAi(true);
      toast.loading(`Designing authentic packaging photo for "${product.name}"...`, {
        id: `ai-${prodId}`,
      });

      const res = await sellerProductAPI.generateAiImage(
        prodId,
        true,
        product.description || "",
      );

      if (res.data?.success && res.data.imageUrl) {
        setLocalImage(res.data.imageUrl);
        setCurrentImageIndex(0);
        toast.success(`Authentic packaging photo generated!`, {
          id: `ai-${prodId}`,
        });
        if (onProductUpdated) {
          onProductUpdated();
        }
      } else {
        toast.error("Could not generate AI photo.", { id: `ai-${prodId}` });
      }
    } catch (err) {
      console.error("AI photo generation error:", err);
      toast.error(
        err.response?.data?.message || "Failed to generate AI packaging photo.",
        { id: `ai-${prodId}` },
      );
    } finally {
      setGeneratingAi(false);
    }
  };

  //--->>> IMAGE NAVIGATION

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((previousIndex) =>
      previousIndex === 0 ? productImages.length - 1 : previousIndex - 1,
    );
  };

  const showNextImage = () => {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((previousIndex) =>
      previousIndex === productImages.length - 1 ? 0 : previousIndex + 1,
    );
  };

  const isInStock = stock > 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#DDE4E2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden bg-[#F8F4E9]">
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={product.name || "Product"}
              className="h-full w-full object-cover"
            />
            {/* QUICK AI REGENERATE BUTTON */}
            <button
              type="button"
              onClick={handleGenerateAiImage}
              disabled={generatingAi}
              title="Generate / update packaging photo with AI"
              className="cursor-pointer absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#022B3A] shadow-md transition hover:bg-[#FF8C00] hover:text-white"
            >
              {generatingAi ? (
                <RefreshCw size={12} className="animate-spin text-[#FF8C00]" />
              ) : (
                <Sparkles size={12} />
              )}
            </button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <span className="text-xs font-semibold text-[#94A3B8] mb-2.5">
              No packaging photo set
            </span>
            <button
              type="button"
              onClick={handleGenerateAiImage}
              disabled={generatingAi}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF8C00] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-[#e07b00] disabled:opacity-50 transition"
            >
              {generatingAi ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              {generatingAi ? "Generating..." : "✨ Generate with AI"}
            </button>
          </div>
        )}

        {/* STOCK STATUS */}

        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            isInStock
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isInStock ? "In Stock" : "Out of Stock"}
        </span>

        {/* IMAGE NAVIGATION */}

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="cursor-pointer absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#022B3A] shadow-md transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              className="cursor-pointer absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#022B3A] shadow-md transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>

            {/* IMAGE INDICATORS */}

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2 py-1">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`cursor-pointer h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/60"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF8C00]">
            {product.category || "Product"}
          </p>

          <h2 className="mt-1 line-clamp-2 text-lg font-bold text-[#022B3A]">
            {product.name || "Unnamed Product"}
          </h2>
        </div>

        {product.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-5 text-[#64748B]">
            {product.description}
          </p>
        )}

        {/* PRICE + STOCK */}

        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-[#64748B]">Price</p>

            <p className="text-xl font-bold text-[#022B3A]">
              ₹{price.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[#64748B]">Stock</p>

            <div className="mt-1 flex items-center justify-end gap-1.5">
              <Package size={15} className="text-[#64748B]" />

              <span className="text-sm font-semibold text-[#022B3A]">
                {stock}
                {product.unit ? ` ${product.unit}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-[#022B3A] px-3 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:bg-[#022B3A] hover:text-white"
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="cursor-pointer
             flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
