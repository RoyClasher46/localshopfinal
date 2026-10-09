import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../../shared/context/CartContext";

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const product = item?.product;

  if (!product) return null;

  const originalPrice = Number(product.price) || 0;
  const discountPercent = Number(product.discount) || 0;

  const discountedPrice =
    discountPercent > 0
      ? Math.round(originalPrice - (originalPrice * discountPercent) / 100)
      : originalPrice;

  const itemTotal = discountedPrice * item.quantity;

  const stock = Number(product.stock) || 0;

  const decreaseQuantity = () => {
    if (item.quantity <= 1) {
      return;
    }

    updateQuantity(item.id, item.quantity - 1);
  };

  const increaseQuantity = () => {
    if (stock > 0 && item.quantity >= stock) {
      return;
    }

    updateQuantity(item.id, item.quantity + 1);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Product Image */}

        <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-32">
          <img
            src={product.image}
            alt={product.name || "Product"}
            className="h-full w-full object-cover"
          />
        </div>
        {/* Product Information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {product.category && (
                <p className="text-xs font-semibold uppercase tracking-wide text-[#FF8C00]">
                  {product.category}
                </p>
              )}

              <h3 className="mt-1 line-clamp-2 text-lg font-bold text-[#022B3A]">
                {product.name}
              </h3>

              {item.shop?.name && (
                <p className="mt-1 text-sm text-gray-500">
                  From{" "}
                  <span className="font-medium text-gray-700">
                    {item.shop.name}
                  </span>
                </p>
              )}
            </div>

            {/* Remove */}

            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove ${product.name} from cart`}
              title="Remove item"
            >
              <Trash2 size={19} />
            </button>
          </div>

          {/* Price + Quantity */}

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Price */}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold text-[#022B3A]">
                  ₹{discountedPrice}
                </span>

                {discountPercent > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{originalPrice}
                  </span>
                )}

                {product.unit && (
                  <span className="text-sm text-gray-500">
                    / {product.unit}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Item total:{" "}
                <span className="font-semibold text-gray-700">
                  ₹{itemTotal}
                </span>
              </p>
            </div>

            {/* Quantity */}

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="text-sm font-medium text-gray-600">
                Quantity
              </span>

              <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={item.quantity <= 1}
                  className="cursor-pointer p-2.5 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center text-sm font-bold text-[#022B3A]">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={stock > 0 && item.quantity >= stock}
                  className="cursor-pointer p-2.5 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Stock */}

          {stock > 0 && (
            <p className="mt-3 text-xs text-gray-400">
              {stock} {product.unit || "items"} available
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default CartItem;
