import { useEffect, useState } from "react";
import { Save, ShoppingBag, Truck, IndianRupee } from "lucide-react";

function OrderSettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleToggle = (name) => {
    setFormData((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setSaved(false);
  };

  const handleMinimumOrderChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      minimumOrder: event.target.value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      ...formData,
      minimumOrder: Number(formData.minimumOrder),
    });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ACCEPT ORDERS */}

      <div className="flex items-center justify-between gap-4 rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
            <ShoppingBag size={19} />
          </div>

          <div>
            <p className="font-semibold text-[#022B3A]">Accept New Orders</p>

            <p className="mt-1 text-xs text-[#64748B]">
              Allow customers to place new orders.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleToggle("acceptOrders")}
          className={`cursor-pointer relative h-6 w-11 shrink-0 rounded-full transition ${
            formData.acceptOrders ? "bg-[#FF8C00]" : "bg-[#CBD5E1]"
          }`}
          aria-label="Toggle accepting new orders"
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
              formData.acceptOrders ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* DELIVERY */}

      <div className="flex items-center justify-between gap-4 rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Truck size={19} />
          </div>

          <div>
            <p className="font-semibold text-[#022B3A]">Delivery Available</p>

            <p className="mt-1 text-xs text-[#64748B]">
              Allow customers to choose delivery.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleToggle("deliveryAvailable")}
          className={`cursor-pointer relative h-6 w-11 shrink-0 rounded-full transition ${
            formData.deliveryAvailable ? "bg-[#FF8C00]" : "bg-[#CBD5E1]"
          }`}
          aria-label="Toggle delivery availability"
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
              formData.deliveryAvailable ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* MINIMUM ORDER */}

      <div className="rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <IndianRupee size={19} />
          </div>

          <div className="flex-1">
            <label
              htmlFor="minimumOrder"
              className="font-semibold text-[#022B3A]"
            >
              Minimum Order Amount
            </label>

            <p className="mt-1 text-xs text-[#64748B]">
              Set the minimum cart value required for an order.
            </p>

            <div className="relative mt-3 max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#64748B]">
                ₹
              </span>

              <input
                id="minimumOrder"
                type="number"
                min="0"
                value={formData.minimumOrder}
                onChange={handleMinimumOrderChange}
                className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white pl-9 pr-4 text-sm font-semibold text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SAVE */}

      <div className="flex flex-col gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        {saved ? (
          <p className="text-sm font-semibold text-green-600">
            ✓ Order settings saved
          </p>
        ) : (
          <div />
        )}

        <button
          type="submit"
          className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-5 text-sm font-semibold text-white transition hover:bg-[#033B4F]"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default OrderSettings;
