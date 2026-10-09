import { BadgePercent, Heart, ShoppingCart, Star, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../shared/context/CartContext";
import { useAuth } from "../../../shared/context/AuthContext";

function ProductCard({ product, shop }) {
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const originalPrice = Number(product?.price) || 0;

  const discountPercent = Number(product?.discount) || 0;

  const discountedPrice =
    discountPercent > 0
      ? Math.round(originalPrice - (originalPrice * discountPercent) / 100)
      : originalPrice;

  const stock = Number(product?.stock) || 0;

  const isAvailable =
    (product?.available !== undefined
      ? Boolean(product.available)
      : product?.isAvailable !== undefined
      ? Boolean(product.isAvailable)
      : true) && stock > 0;

  const productId = product?.id || product?._id;
  const shopId =
    product?.shopId ||
    shop?.id ||
    shop?._id ||
    product?.shop?._id ||
    product?.shop?.id;
  const targetShop = shop || product?.shop;

  const handleProductClick = () => {
    if (!productId || !shopId) {
      console.error(
        "ProductCard: product id and shop id are required for navigation.",
        { productId, shopId, product },
      );
      return;
    }

    navigate(`/shops/${shopId}/products/${productId}`);
  };

  const handleWishlist = (event) => {
    event.stopPropagation();
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAvailable) {
      return;
    }

    if (!targetShop) {
      console.error("ProductCard: shop information is required for cart.", {
        product,
        shop: targetShop,
      });
      return;
    }

    const safeQuantity = Math.min(quantity, stock);

    addToCart(
      {
        ...product,
        id: productId,
        shopId,
      },
      targetShop,
      safeQuantity,
    );

    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  //-->>> BUY NOW

  const handleBuyNow = (event) => {
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAvailable) {
      return;
    }

    if (!targetShop) {
      console.error("ProductCard: shop information is required for cart.");
      return;
    }

    const safeQuantity = Math.min(quantity, stock);

    addToCart(
      {
        ...product,
        id: productId,
        shopId,
      },
      targetShop,
      safeQuantity,
    );

    navigate("/cart");
  };

  //--->>> QUANTITY - DECREASE

  const handleQuantityDecrease = (event) => {
    event.stopPropagation();

    setQuantity((previous) => Math.max(1, previous - 1));
  };

  //--->>> QUANTITY - INCREASE

  const handleQuantityIncrease = (event) => {
    event.stopPropagation();

    if (!isAvailable) {
      return;
    }

    setQuantity((previous) => Math.min(stock, previous + 1));
  };

  return (
    <article
      onClick={handleProductClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative overflow-hidden bg-gray-100 h-60 flex items-center justify-center">
        {product?.image ? (
          <img
            src={product.image}
            alt={product?.name || "Product"}
            className="h-60 w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-[#FF8C00] font-black text-xl">
              {(product?.name || "P").charAt(0).toUpperCase()}
            </span>
            <span className="mt-2 text-xs font-semibold text-slate-600 line-clamp-1 max-w-[160px]">
              {product?.name || "Local Product"}
            </span>
            <span className="text-[10px] text-slate-400">
              {product?.category || "Grocery"}
            </span>
          </div>
        )}

        {/* DISCOUNT */}

        {discountPercent > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#FF8C00] px-3 py-1 text-xs font-semibold text-white shadow">
            <BadgePercent size={14} />
            {discountPercent}% OFF
          </div>
        )}

        {/* FEATURED */}

        {product?.featured && (
          <div className="absolute right-3 top-3 rounded-full bg-[#022B3A] px-3 py-1 text-xs font-semibold text-white shadow">
            Featured
          </div>
        )}

        {/*  WISHLIST */}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={`Add ${product?.name || "product"} to wishlist`}
          className="cursor-pointer absolute bottom-3 right-3 rounded-full bg-white p-2 shadow transition hover:bg-red-50"
        >
          <Heart
            size={18}
            className="text-gray-500 transition hover:text-red-500"
          />
        </button>
      </div>

      {/* PRODUCT BODY */}

      <div className="p-5">
        {/* CATEGORY */}

        {product?.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-[#FF8C00]">
            {product.category}
          </span>
        )}

        {/* PRODUCT NAME */}

        <h3 className="mt-2 line-clamp-2 text-lg font-bold text-[#022B3A]">
          {product?.name || "Unnamed Product"}
        </h3>

        {/* DESCRIPTION */}

        {product?.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
            {product.shortDescription}
          </p>
        )}

        {/*  RATING + STOCK */}

        <div className="mt-4 flex items-center justify-between gap-3">
          {/* RATING */}

          <div className="flex items-center gap-1">
            <Star size={16} fill="#FF9800" className="text-[#FF9800]" />

            <span className="font-semibold">{product?.rating ?? 0}</span>

            <span className="text-sm text-gray-500">
              ({product?.reviews ?? 0})
            </span>
          </div>

          {/* AVAILABILITY */}

          {isAvailable ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              In Stock
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
              Out of Stock
            </span>
          )}
        </div>

        {/* PRICE */}

        <div className="mt-5 flex flex-wrap items-end gap-3">
          {/* SELLING PRICE */}

          <span className="text-2xl font-bold text-[#022B3A]">
            ₹{discountedPrice}
          </span>

          {/* ORIGINAL PRICE */}

          {discountPercent > 0 && (
            <span className="text-lg text-gray-400 line-through">
              ₹{originalPrice}
            </span>
          )}

          {/* UNIT */}

          {product?.unit && (
            <span className="text-sm text-gray-500">/ {product.unit}</span>
          )}
        </div>

        {/* QUANTITY */}

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">Quantity</span>

          <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
            {/* DECREASE */}

            <button
              type="button"
              onClick={handleQuantityDecrease}
              disabled={!isAvailable || quantity <= 1}
              className="cursor-pointer px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>

            {/* QUANTITY */}

            <span className="w-10 text-center font-semibold text-[#022B3A]">
              {quantity}
            </span>

            {/* INCREASE */}

            <button
              type="button"
              onClick={handleQuantityIncrease}
              disabled={!isAvailable || quantity >= stock}
              className="cursor-pointer px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}

        <div className="mt-6 space-y-3">
          {/* ADD TO CART */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition ${
              !isAvailable
                ? "cursor-not-allowed bg-gray-400"
                : isAdded
                  ? "bg-green-600"
                  : "bg-[#022B3A] hover:bg-[#033B4F]"
            }`}
          >
            <ShoppingCart size={18} />

            {!isAvailable
              ? "Out of Stock"
              : isAdded
                ? "Added to Cart"
                : "Add to Cart"}
          </button>

          {/* BUY NOW */}

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isAvailable}
            className={`cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 font-semibold transition ${
              !isAvailable
                ? "cursor-not-allowed border-gray-300 text-gray-400"
                : "border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white"
            }`}
          >
            <Zap size={18} />
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
