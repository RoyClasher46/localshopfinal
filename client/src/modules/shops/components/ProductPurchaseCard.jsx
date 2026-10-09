import { Check, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../shared/context/CartContext";
import { useAuth } from "../../../shared/context/AuthContext";

function ProductPurchaseCard({ product, shop }) {
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const originalPrice = Number(product?.price) || 0;
  const discountPercent = Number(product?.discount) || 0;

  const sellingPrice =
    discountPercent > 0
      ? Math.round(originalPrice - (originalPrice * discountPercent) / 100)
      : originalPrice;

  const total = sellingPrice * quantity;

  const stock = Number(product?.stock) || 0;

  const isAvailable = Boolean(product?.available) && stock > 0;

  //--->>> QUANTITY

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(previous + 1, stock || 1));
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  //-->>> ADD TO CART

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAvailable) return;

    if (!shop) {
      console.error(
        "ProductPurchaseCard: shop information is required to add product to cart.",
      );
      return;
    }

    addToCart(product, shop, quantity);

    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAvailable || !shop) return;

    addToCart(product, shop, quantity);

    navigate("/cart");
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
      {/*  HEADER */}

      <div>
        <h2 className="text-lg font-bold text-[#022B3A]">Purchase</h2>

        {shop?.name && (
          <p className="mt-1 text-sm text-gray-500">
            Sold by{" "}
            <span className="font-medium text-[#022B3A]">{shop.name}</span>
          </p>
        )}
      </div>

      {/* PRICE + QUANTITY */}

      <div className="mt-5 rounded-2xl bg-[#F8F4E9] p-4">
        {/* Price */}

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-500">Price</span>

          <div className="text-right">
            <span className="font-bold text-[#022B3A]">₹{sellingPrice}</span>

            {product?.unit && (
              <span className="ml-1 text-sm text-gray-500">
                / {product.unit}
              </span>
            )}
          </div>
        </div>

        {/* Original price */}

        {discountPercent > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">Original price</span>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">
                ₹{originalPrice}
              </span>

              <span className="rounded-full bg-[#FF8C00] px-2 py-0.5 text-xs font-bold text-white">
                {discountPercent}% OFF
              </span>
            </div>
          </div>
        )}

        {/* Quantity */}

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
          <span className="text-sm text-gray-500">Quantity</span>

          <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={!isAvailable || quantity <= 1}
              className="cursor-pointer p-2.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>

            <span className="w-10 text-center text-sm font-bold text-[#022B3A]">
              {quantity}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={!isAvailable || quantity >= stock}
              className="cursor-pointer p-2.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Total */}

        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="font-semibold text-gray-700">Total</span>

          <span className="text-xl font-bold text-[#022B3A]">₹{total}</span>
        </div>
      </div>

      {/* STOCK */}

      <div className="mt-3">
        {isAvailable ? (
          <p className="text-xs text-gray-500">
            {stock} {product?.unit || "units"} available
          </p>
        ) : (
          <p className="text-xs font-medium text-red-600">
            Currently unavailable
          </p>
        )}
      </div>

      {/* ACTION BUTTONS */}

      <div className="mt-5 space-y-3">
        {/* ADD TO CART */}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition ${
            !isAvailable
              ? "cursor-not-allowed bg-gray-400"
              : isAdded
                ? "bg-green-600"
                : "bg-[#022B3A] hover:bg-[#033B4F]"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={19} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={19} />
              Add to Cart
            </>
          )}
        </button>

        {/* BUY NOW */}

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!isAvailable}
          className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#FF8C00] py-3.5 font-semibold text-[#FF8C00] transition hover:bg-[#FF8C00] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
        >
          <Zap size={19} />
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default ProductPurchaseCard;
