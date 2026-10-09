import { X, Phone, Mail, MapPin, Package } from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#F8F4E9] shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[#164854] bg-[#022B3A] px-5 py-4 text-white">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">
              Order Details
            </p>

            <h2 className="mt-1 text-xl font-bold">{order.id}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            aria-label="Close order details"
          >
            <X size={21} />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* ORDER STATUS */}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4">
            <div>
              <p className="text-xs text-[#64748B]">Order Status</p>

              <div className="mt-2">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-[#64748B]">Order Date</p>

              <p className="mt-1 text-sm font-semibold text-[#022B3A]">
                {new Date(order.orderDate).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* CUSTOMER */}

          <section className="mt-5 rounded-xl bg-white p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
                <Package size={18} />
              </div>

              <h3 className="font-bold text-[#022B3A]">Customer Information</h3>
            </div>

            <div className="mt-4 space-y-3">
              <p className="font-semibold text-[#022B3A]">
                {order.customer.name}
              </p>

              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Phone size={15} />
                {order.deliveryAddress?.phone || order.customer?.phone || "N/A"}
              </div>

              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Mail size={15} />
                {order.customer.email}
              </div>

              <div className="flex items-start gap-2 text-sm text-[#64748B]">
                <MapPin size={15} className="mt-0.5 shrink-0" />

                <span>
                  {order.deliveryAddress?.addressLine}
                  {order.deliveryAddress?.city
                    ? `, ${order.deliveryAddress.city}`
                    : ""}
                  {order.deliveryAddress?.state
                    ? `, ${order.deliveryAddress.state}`
                    : ""}
                  {order.deliveryAddress?.pincode
                    ? ` - ${order.deliveryAddress.pincode}`
                    : ""}
                </span>
              </div>
            </div>
          </section>

          {/* ITEMS */}

          <section className="mt-5 rounded-xl bg-white p-5">
            <h3 className="font-bold text-[#022B3A]">Ordered Products</h3>

            <div className="mt-4 divide-y divide-[#DDE4E2]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#022B3A]">{item.name}</p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      {item.quantity} {item.unit} × ₹{item.price}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-[#022B3A]">
                    ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* PAYMENT + SUMMARY */}

          <section className="mt-5 rounded-xl bg-white p-5">
            <h3 className="font-bold text-[#022B3A]">Payment & Summary</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Subtotal</span>

                <span className="font-medium text-[#022B3A]">
                  ₹{order.subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Delivery Fee</span>

                <span className="font-medium text-[#022B3A]">
                  ₹{order.deliveryFee.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Discount</span>

                <span className="font-medium text-green-600">
                  -₹{Number(order.discount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border-t border-[#DDE4E2] pt-3">
                <div className="flex justify-between gap-4">
                  <span className="font-bold text-[#022B3A]">Total</span>

                  <span className="text-lg font-bold text-[#022B3A]">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-[#FFF0D9] p-3">
              <p className="text-sm font-semibold text-[#022B3A]">
                Payment: {order.paymentMethod}
              </p>

              <p
                className={`mt-1 text-xs font-semibold ${
                  order.paymentStatus === "Paid"
                    ? "text-green-600"
                    : order.paymentStatus === "Cancelled"
                      ? "text-red-600"
                      : "text-[#64748B]"
                }`}
              >
                Payment status: {order.paymentStatus}
              </p>
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <div className="border-t border-[#DDE4E2] bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full rounded-xl bg-[#022B3A] px-5 py-3 font-semibold text-white transition hover:bg-[#033B4F]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
