import { ArrowLeft, MapPin, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { useCart } from "../../../shared/context/CartContext";

function CartPage() {
  const navigate = useNavigate();

  const { cartItems, clearCart, itemCount } = useCart();

  const isEmpty = cartItems.length === 0;

  return (
    <main className="min-h-screen bg-[#F8F4E9]">
      {/* HEADER */}

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#022B3A]"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#022B3A] text-white">
                  <ShoppingBag size={22} />
                </div>

                <h1 className="text-3xl font-bold text-[#022B3A]">Your Cart</h1>
              </div>

              {!isEmpty && (
                <p className="mt-3 text-sm text-gray-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                </p>
              )}
            </div>

            {!isEmpty && (
              <button
                type="button"
                onClick={clearCart}
                className="cursor-pointer flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 sm:self-auto"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </section>
      {/* EMPTY CART */}
      {isEmpty ? (
        <section className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
              <ShoppingBag size={42} className="text-[#FF8C00]" />
            </div>

            <h2 className="mt-7 text-2xl font-bold text-[#022B3A]">
              Your cart is empty
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Looks like you haven't added anything to your cart yet. Explore
              local shops and discover something you love.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shops")}
              className="cursor-pointer mt-7 rounded-xl bg-[#022B3A] px-7 py-3 font-semibold text-white transition hover:bg-[#033B4F]"
            >
              Explore Local Shops
            </button>
          </div>
        </section>
      ) : (
        /* CART CONTENT */

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* LEFT */}

            <div className="space-y-4">
              {/* Local shopping message */}

              <div className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <MapPin size={20} className="mt-0.5 shrink-0 text-[#FF8C00]" />

                <div>
                  <p className="font-semibold text-[#022B3A]">Shop Local</p>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Support nearby businesses and discover products from your
                    local community.
                  </p>
                </div>
              </div>

              {/* Cart Items */}

              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* RIGHT */}

            <div className="lg:sticky lg:top-24 lg:self-start">
              <CartSummary />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default CartPage;
