import { CheckCircle2, Home, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { orderAPI } from "../../../services/api";

function OrderSuccessPage() {
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  //---->>> LOAD ORDER

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const storedOrder = localStorage.getItem("shoplocal_latest_order");

        const storedOrderId = localStorage.getItem("shoplocal_latest_order_id");

        if (storedOrderId) {
          try {
            const response = await orderAPI.one(storedOrderId);

            const backendOrder = response?.data?.order;

            if (backendOrder) {
              const normalizedOrder = {
                ...backendOrder,

                orderId:
                  backendOrder.orderNumber ||
                  backendOrder.orderId ||
                  backendOrder._id,

                customer: {
                  fullName: backendOrder.deliveryAddress?.name || "",

                  phone: backendOrder.deliveryAddress?.phone || "",

                  address: backendOrder.deliveryAddress?.addressLine || "",

                  city: backendOrder.deliveryAddress?.city || "",

                  state: backendOrder.deliveryAddress?.state || "",

                  pincode: backendOrder.deliveryAddress?.pincode || "",
                },

                paymentMethod: backendOrder.paymentMethod || "COD",

                paymentStatus: backendOrder.paymentStatus || "Pending",

                orderStatus: backendOrder.status || "Pending",

                subtotal: Number(backendOrder.subtotal) || 0,

                discount: Number(backendOrder.discount) || 0,

                deliveryFee: Number(backendOrder.deliveryFee) || 0,

                total: Number(backendOrder.total) || 0,

                items: backendOrder.items || [],
              };

              setOrder(normalizedOrder);

              localStorage.setItem(
                "shoplocal_latest_order",
                JSON.stringify(normalizedOrder),
              );

              setLoading(false);
              return;
            }
          } catch (backendError) {
            console.error("Unable to load order from backend:", backendError);
          }
        }

        if (storedOrder) {
          setOrder(JSON.parse(storedOrder));
        }
      } catch (error) {
        console.error("Unable to load order:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, []);

  //--->>> LOADING

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F8F4E9] px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#DDE4E2] border-t-[#FF8C00]" />

          <p className="mt-4 text-sm font-medium text-[#64748B]">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  //--->>> NO ORDER FOUND

  if (!order) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F8F4E9] px-4">
        <div className="text-center">
          <Package size={48} className="mx-auto text-[#64748B]" />

          <h1 className="mt-5 text-2xl font-bold text-[#022B3A]">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            We couldn't find the order you're looking for.
          </p>

          <button
            type="button"
            onClick={() => navigate("/shops")}
            className="cursor-pointer mt-6 rounded-xl bg-[#022B3A] px-6 py-3 font-semibold text-white transition hover:bg-[#033B4F]"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  //--->> FORMAT PRICE

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <main className="min-h-screen bg-[#F8F4E9] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* SUCCESS */}

        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={46} className="text-green-600" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#022B3A]">
            Order Placed Successfully!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#64748B]">
            Thank you for shopping with ShopLocal. Your order has been placed
            successfully and will be delivered to your address.
          </p>

          {/* ORDER ID */}

          <div className="mx-auto mt-6 max-w-sm rounded-xl bg-[#F8F4E9] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Order ID
            </p>

            <p className="mt-1 text-lg font-bold text-[#022B3A]">
              {order.orderId}
            </p>
          </div>

          {/* COD */}

          <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-[#FFF0D9] px-4 py-3">
            <span className="text-sm font-semibold text-[#022B3A]">
              Payment:
            </span>

            <span className="text-sm font-bold text-[#FF8C00]">
              Cash on Delivery
            </span>
          </div>
        </div>

        {/* ORDER INFORMATION */}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* DELIVERY */}

          <section className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
                <Package size={20} />
              </div>

              <h2 className="font-bold text-[#022B3A]">Delivery Details</h2>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <p className="font-semibold text-[#022B3A]">
                {order.customer?.fullName || order.deliveryAddress?.name}
              </p>

              <p className="text-[#64748B]">
                {order.customer?.phone || order.deliveryAddress?.phone}
              </p>

              <p className="leading-6 text-[#64748B]">
                {order.customer?.address || order.deliveryAddress?.addressLine}
                <br />
                {order.customer?.city || order.deliveryAddress?.city},{" "}
                {order.customer?.state || order.deliveryAddress?.state} -{" "}
                {order.customer?.pincode || order.deliveryAddress?.pincode}
              </p>
            </div>
          </section>

          {/* TOTAL */}

          <section className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[#022B3A]">Order Summary</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Subtotal</span>

                <span className="font-semibold text-[#022B3A]">
                  {formatPrice(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Discount</span>

                <span className="font-semibold text-green-600">
                  - {formatPrice(order.discount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Delivery</span>

                <span className="font-semibold text-green-600">FREE</span>
              </div>

              <div className="border-t border-[#DDE4E2] pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#022B3A]">Total</span>

                  <span className="text-xl font-bold text-[#022B3A]">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ITEMS */}

        <section className="mt-6 rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
              <ShoppingBag size={20} />
            </div>

            <div>
              <h2 className="font-bold text-[#022B3A]">Ordered Items</h2>

              <p className="text-xs text-[#64748B]">
                {order.items?.length || 0}{" "}
                {order.items?.length === 1 ? "product" : "products"}
              </p>
            </div>
          </div>

          <div className="mt-5 divide-y divide-[#DDE4E2]">
            {order.items?.map((item, index) => (
              <div
                key={item._id || item.id || item.product || index}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={item.image || item.product?.image || ""}
                    alt={item.name || item.product?.name || "Product"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-[#022B3A]">
                    {item.name || item.product?.name || "Product"}
                  </p>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-bold text-[#022B3A]">
                    {formatPrice(item.subtotal ?? item.itemTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIONS */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/shops")}
            className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-6 py-3 font-semibold text-white transition hover:bg-[#033B4F]"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border-2 border-[#022B3A] px-6 py-3 font-semibold text-[#022B3A] transition hover:bg-[#022B3A] hover:text-white"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccessPage;
