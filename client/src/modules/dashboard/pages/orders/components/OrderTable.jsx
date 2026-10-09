import { Eye, Lock } from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";

function OrderTable({ orders, onViewOrder, onStatusChange, readOnly = false }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-2xl border border-[#DDE4E2] bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F4E9] text-2xl">
          📦
        </div>

        <h3 className="mt-4 text-lg font-bold text-[#022B3A]">
          {readOnly ? "No order history found" : "No current orders found"}
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          {readOnly
            ? "Delivered and cancelled orders will appear here."
            : "Try changing your search or filter."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#DDE4E2] bg-white">
      {/* DESKTOP TABLE */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#DDE4E2] bg-[#F8F4E9]">
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Order
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Customer
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Items
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Total
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Payment
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[#DDE4E2] last:border-b-0 transition hover:bg-[#FAFBFA]"
              >
                {/* ORDER */}

                <td className="px-5 py-4">
                  <p className="font-semibold text-[#022B3A]">{order.id}</p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {new Date(order.orderDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </td>

                {/* CUSTOMER */}

                <td className="px-5 py-4">
                  <p className="font-medium text-[#022B3A]">
                    {order.customer.name}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {order.customer.phone}
                  </p>
                </td>

                {/* ITEMS */}

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#022B3A]">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </p>

                  <p className="mt-1 max-w-[180px] truncate text-xs text-[#64748B]">
                    {order.items.map((item) => item.name).join(", ")}
                  </p>
                </td>

                {/* TOTAL */}

                <td className="px-5 py-4">
                  <p className="font-bold text-[#022B3A]">
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </td>

                {/* PAYMENT */}

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#022B3A]">
                    {order.paymentMethod}
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
                    {order.paymentStatus}
                  </p>
                </td>

                {/* STATUS */}

                <td className="px-5 py-4">
                  {readOnly ? (
                    <div>
                      <OrderStatusBadge status={order.status} />

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#64748B]">
                        <Lock size={12} />
                        Final status
                      </div>
                    </div>
                  ) : (
                    <select
                      value={order.status}
                      onChange={(event) =>
                        onStatusChange(order.mongoId, event.target.value)
                      }
                      className="rounded-lg border border-[#DDE4E2] bg-white px-2 py-1 text-xs font-medium text-[#022B3A] outline-none focus:border-[#FF8C00]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}
                </td>

                {/* ACTION */}

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onViewOrder(order)}
                    className="cursor-pointer inline-flex h-9 items-center gap-2 rounded-lg border border-[#DDE4E2] px-3 text-sm font-semibold text-[#022B3A] transition hover:border-[#FF8C00] hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
                  >
                    <Eye size={16} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}

      <div className="divide-y divide-[#DDE4E2] md:hidden">
        {orders.map((order) => (
          <div key={order.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#022B3A]">{order.id}</p>

                <p className="mt-1 text-xs text-[#64748B]">
                  {new Date(order.orderDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#64748B]">Customer</p>

                <p className="mt-1 text-sm font-semibold text-[#022B3A]">
                  {order.customer.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#64748B]">Total</p>

                <p className="mt-1 text-sm font-bold text-[#022B3A]">
                  ₹{order.total.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-[#64748B]">Items</p>

              <p className="mt-1 text-sm text-[#022B3B]">
                {order.items.map((item) => item.name).join(", ")}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-xs text-[#64748B]">Payment</p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  order.paymentStatus === "Paid"
                    ? "text-green-600"
                    : order.paymentStatus === "Cancelled"
                      ? "text-red-600"
                      : "text-[#64748B]"
                }`}
              >
                {order.paymentMethod} · {order.paymentStatus}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {readOnly ? (
                <div className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 text-sm font-semibold text-gray-500">
                  <Lock size={15} />
                  Order Closed
                </div>
              ) : (
                <select
                  value={order.status}
                  onChange={(event) =>
                    onStatusChange(order.mongoId, event.target.value)
                  }
                  className="h-10 flex-1 rounded-lg border border-[#DDE4E2] bg-white px-3 text-sm font-medium text-[#022B3A] outline-none focus:border-[#FF8C00]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              )}

              <button
                type="button"
                onClick={() => onViewOrder(order)}
                className="cursor-pointer flex h-10 items-center justify-center gap-2 rounded-lg bg-[#022B3A] px-4 text-sm font-semibold text-white transition hover:bg-[#033B4F]"
              >
                <Eye size={16} />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderTable;
