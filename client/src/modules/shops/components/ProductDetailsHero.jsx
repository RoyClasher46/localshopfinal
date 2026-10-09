import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Star,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

function ProductDetailsHero({ product, shop }) {
  const images = useMemo(() => {
    const productImages =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : [product?.image].filter(Boolean);

    return productImages.filter(Boolean).slice(0, 4);
  }, [product?.images, product?.image]);

  const [activeImage, setActiveImage] = useState(0);

  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setIsImageOpen(false);
  }, [product?.id, product?._id]);

  useEffect(() => {
    if (images.length === 0) {
      setActiveImage(0);
      return;
    }

    if (activeImage >= images.length) {
      setActiveImage(0);
    }
  }, [activeImage, images.length]);

  const discountedPrice =
    Number(product?.discount) > 0
      ? Math.round(
          Number(product?.price || 0) -
            (Number(product?.price || 0) * Number(product?.discount)) / 100,
        )
      : Number(product?.price || 0);

  const savings = Math.max(0, Number(product?.price || 0) - discountedPrice);

  const rating = Number(product?.rating) || 0;

  const reviewCount = Number(product?.reviews) || 0;

  const openImageViewer = (index = 0) => {
    if (!images.length) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, images.length - 1));

    setActiveImage(safeIndex);
    setIsImageOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageOpen(false);
  };

  const nextImage = (event) => {
    event?.stopPropagation();

    if (images.length <= 1) {
      return;
    }

    setActiveImage((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const previousImage = (event) => {
    event?.stopPropagation();

    if (images.length <= 1) {
      return;
    }

    setActiveImage((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  };

  useEffect(() => {
    if (!isImageOpen || images.length === 0) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeImageViewer();
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveImage((currentIndex) =>
          currentIndex === 0 ? images.length - 1 : currentIndex - 1,
        );
      }

      if (event.key === "ArrowRight") {
        setActiveImage((currentIndex) =>
          currentIndex === images.length - 1 ? 0 : currentIndex + 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageOpen, images.length]);

  useEffect(() => {
    if (!isImageOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isImageOpen]);

  const selectedImage = images[activeImage] || images[0];

  const shopLogo = shop?.logo || shop?.image;

  const shopAddress =
    shop?.address || shop?.location?.address || "Address unavailable";

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-2">
          {/* PRODUCT IMAGES */}

          <div className="p-4 sm:p-6">
            {/*  MAIN IMAGE */}

            <div className="relative overflow-hidden rounded-2xl bg-gray-100">
              {images.length > 0 ? (
                <button
                  type="button"
                  onClick={() => openImageViewer(activeImage)}
                  className="group block h-full w-full cursor-zoom-in"
                  aria-label={`Open ${product?.name || "product"} image`}
                >
                  <img
                    src={selectedImage}
                    alt={product?.name || "Product"}
                    className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[420px]"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </button>
              ) : (
                <div className="flex h-[300px] w-full items-center justify-center text-sm text-gray-400 sm:h-[420px]">
                  No product image
                </div>
              )}

              {/*  DISCOUNT BADGE*/}

              {Number(product?.discount) > 0 && (
                <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-1 rounded-full bg-[#FF8C00] px-3 py-1.5 text-sm font-bold text-white shadow">
                  <BadgePercent size={15} />
                  {product.discount}% OFF
                </div>
              )}

              {/*  WISHLIST */}

              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow transition hover:bg-gray-50"
                aria-label="Add to wishlist"
              >
                <Heart
                  size={19}
                  className="text-gray-600 transition hover:text-red-500"
                />
              </button>

              {/* MAIN IMAGE NAVIGATION */}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-gray-700 shadow transition hover:bg-white"
                    aria-label="Previous product image"
                  >
                    <ChevronLeft size={21} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-gray-700 shadow transition hover:bg-white"
                    aria-label="Next product image"
                  >
                    <ChevronRight size={21} />
                  </button>
                </>
              )}

              {/*  IMAGE COUNTER */}

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => openImageViewer(activeImage)}
                  className="absolute bottom-4 right-4 z-10 cursor-pointer rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/75"
                  aria-label="Open product gallery"
                >
                  {activeImage + 1} / {images.length}
                </button>
              )}
            </div>

            {/* THUMBNAILS */}

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => openImageViewer(index)}
                    className={`group cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                      activeImage === index
                        ? "border-[#FF8C00]"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    aria-label={`Open product image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product?.name || "Product"} ${index + 1}`}
                      className="h-20 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-24"
                      loading={index === 0 ? "eager" : "lazy"}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            {/* BADGES */}

            <div className="flex flex-wrap items-center gap-2">
              {product?.category && (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#FF8C00]">
                  {product.category}
                </span>
              )}

              {product?.featured && (
                <span className="rounded-full bg-[#022B3A] px-3 py-1 text-xs font-bold text-white">
                  Featured
                </span>
              )}

              {product?.available ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  In Stock
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Out of Stock
                </span>
              )}
            </div>

            {/*  PRODUCT NAME */}

            <h1 className="mt-5 text-3xl font-bold leading-tight text-[#022B3A] sm:text-4xl">
              {product?.name}
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              {product?.shortDescription}
            </p>

            {/* RATING */}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-1.5">
                <Star size={17} fill="#FF8C00" className="text-[#FF8C00]" />

                <span className="font-bold text-[#022B3A]">
                  {rating > 0 ? rating.toFixed(1) : "0.0"}
                </span>
              </div>

              <span className="text-sm text-gray-500">
                {reviewCount} customer{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* PRICE */}

            <div className="mt-7 border-y border-gray-100 py-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-bold text-[#022B3A]">
                  ₹{discountedPrice}
                </span>

                {Number(product?.discount) > 0 && (
                  <span className="pb-1 text-lg text-gray-400 line-through">
                    ₹{product.price}
                  </span>
                )}

                {product?.unit && (
                  <span className="pb-1 text-sm text-gray-500">
                    / {product.unit}
                  </span>
                )}
              </div>

              {Number(product?.discount) > 0 && savings > 0 && (
                <p className="mt-2 text-sm font-semibold text-green-600">
                  You save ₹{savings} per {product?.unit || "unit"}
                </p>
              )}
            </div>

            {/* SHOP */}

            {shop && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                {shopLogo ? (
                  <img
                    src={shopLogo}
                    alt={shop.name || "Shop"}
                    className="h-12 w-12 rounded-xl object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#022B3A] text-lg font-bold text-white">
                    {shop?.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Sold by</p>

                  <p className="truncate font-bold text-[#022B3A]">
                    {shop?.name || "Shop"}
                  </p>

                  <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                    <MapPin size={13} className="mt-0.5 shrink-0" />

                    <span className="line-clamp-2">{shopAddress}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/*  FULLSCREEN IMAGE VIEWER / LIGHTBOX */}

      {isImageOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${product?.name || "Product"} image gallery`}
          onClick={closeImageViewer}
        >
          {/* TOP BAR */}

          <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
            <div className="text-sm font-medium text-white">
              {activeImage + 1} / {images.length}
            </div>

            <button
              type="button"
              onClick={closeImageViewer}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close image viewer"
            >
              <X size={24} />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-2 sm:px-20"
            onClick={(event) => event.stopPropagation()}
          >
            {/* PREVIOUS */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-6"
                aria-label="Previous product image"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {/* LARGE IMAGE */}

            <img
              src={selectedImage}
              alt={`${product?.name || "Product"} ${activeImage + 1}`}
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            {/* NEXT */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6"
                aria-label="Next product image"
              >
                <ChevronRight size={30} />
              </button>
            )}
          </div>

          {/* VIEWER THUMBNAILS */}

          {images.length > 1 && (
            <div
              className="shrink-0 overflow-x-auto px-4 py-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex w-max gap-3">
                {images.map((image, index) => (
                  <button
                    key={`viewer-thumbnail-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition ${
                      activeImage === index
                        ? "border-[#FF8C00] opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ProductDetailsHero;
