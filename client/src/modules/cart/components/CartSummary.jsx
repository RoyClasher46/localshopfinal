import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../shared/context/CartContext";

function CartSummary() {
  const navigate = useNavigate();

  const { subtotal, discount, total, itemCount } = useCart();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-[#022B3A]">Order Summary </h2>
      {/* Summary */}
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>

          <span className="font-semibold text-gray-800">₹{subtotal}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Discount</span>

          <span className="font-semibold text-green-600">
            -₹{Math.round(discount)}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-700">Total</span>

            <span className="text-2xl font-bold text-[#022B3A]">₹{total}</span>
          </div>
        </div>
      </div>
      {/* Checkout */}
      <button
        type="button"
        onClick={handleCheckout}
        className="cursor-pointer mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#022B3A] py-3.5 font-semibold text-white transition hover:bg-[#033B4F]"
      >
        Proceed to Checkout
        <ArrowRight size={18} />
      </button>
      {/* Security */}
      <div className="mt-5 flex gap-3 rounded-xl bg-[#F8F4E9] p-3">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#FF8C00]" />

        <p className="text-xs leading-5 text-gray-600">
          Your order information is securely handled throughout the checkout
          process.
        </p>
      </div>
    </aside>
  );
}

export default CartSummary;
