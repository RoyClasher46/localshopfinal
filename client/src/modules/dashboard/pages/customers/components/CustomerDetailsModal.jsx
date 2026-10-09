import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import CustomerStatusBadge from "./CustomerStatusBadge";

function CustomerDetailsModal({ customer, onClose }) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#F8F4E9] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between bg-[#022B3A] px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">
              Customer Details
            </p>

            <h2 className="mt-1 text-xl font-bold">{customer.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            aria-label="Close customer details"
          >
            <X size={21} />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* CUSTOMER PROFILE */}

          <section className="rounded-2xl border border-[#DDE4E2] bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
                  <User size={26} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#022B3A]">
                    {customer.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Customer ID: {customer.id}
                  </p>
                </div>
              </div>

              <CustomerStatusBadge status={customer.status} />
            </div>

            {/* CONTACT INFORMATION */}

            <div className="mt-5 grid gap-4 border-t border-[#DDE4E2] pt-5 sm:grid-cols-2">
              {/* EMAIL */}

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4E9] text-[#64748B]">
                  <Mail size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#64748B]">Email</p>

                  <p className="truncate text-sm font-medium text-[#022B3A]">
                    {customer.email || "Email not available"}
                  </p>
                </div>
              </div>

              {/* PHONE */}

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4E9] text-[#64748B]">
                  <Phone size={17} />
                </div>

                <div>
                  <p className="text-xs text-[#64748B]">Phone</p>

                  <p className="text-sm font-medium text-[#022B3A]">
                    {customer.phone || "Phone not available"}
                  </p>
                </div>
              </div>

              {/* ADDRESS */}

              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4E9] text-[#64748B]">
                  <MapPin size={17} />
                </div>

                <div>
                  <p className="text-xs text-[#64748B]">Address</p>

                  <p className="mt-1 text-sm font-medium leading-relaxed text-[#022B3A]">
                    {customer.addresses?.length > 0
                      ? [
                          customer.addresses[0].addressLine,
                          customer.addresses[0].city,
                          customer.addresses[0].state,
                          customer.addresses[0].pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "Address not available"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CUSTOMER STATISTICS*/}

          <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* TOTAL ORDERS */}

            <div className="rounded-xl border border-[#DDE4E2] bg-white p-4">
              <ShoppingBag size={19} className="text-[#FF8C00]" />

              <p className="mt-3 text-xs text-[#64748B]">Total Orders</p>

              <p className="mt-1 text-xl font-bold text-[#022B3A]">
                {customer.totalOrders || 0}
              </p>
            </div>

            {/* COMPLETED */}

            <div className="rounded-xl border border-[#DDE4E2] bg-white p-4">
              <CheckCircle2 size={19} className="text-green-600" />

              <p className="mt-3 text-xs text-[#64748B]">Completed</p>

              <p className="mt-1 text-xl font-bold text-[#022B3A]">
                {customer.completedOrders || 0}
              </p>
            </div>

            {/* CANCELLED */}

            <div className="rounded-xl border border-[#DDE4E2] bg-white p-4">
              <XCircle size={19} className="text-red-500" />

              <p className="mt-3 text-xs text-[#64748B]">Cancelled</p>

              <p className="mt-1 text-xl font-bold text-[#022B3A]">
                {customer.cancelledOrders || 0}
              </p>
            </div>

            {/* TOTAL SPENT */}

            <div className="rounded-xl border border-[#DDE4E2] bg-white p-4">
              <IndianRupee size={19} className="text-green-600" />

              <p className="mt-3 text-xs text-[#64748B]">Total Spent</p>

              <p className="mt-1 text-xl font-bold text-[#022B3A]">
                ₹{Number(customer.totalSpent || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </section>

          {/* CUSTOMER ACTIVITY */}

          <section className="mt-5 rounded-2xl border border-[#DDE4E2] bg-white p-5">
            <h3 className="font-bold text-[#022B3A]">Customer Activity</h3>

            <div className="mt-4 space-y-4">
              {/* LAST ORDER */}

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4E9] text-[#64748B]">
                  <CalendarDays size={17} />
                </div>

                <div>
                  <p className="text-xs text-[#64748B]">Last Order</p>

                  <p className="text-sm font-semibold text-[#022B3A]">
                    {customer.lastOrderDate
                      ? new Date(customer.lastOrderDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "No orders yet"}
                  </p>
                </div>
              </div>

              {/* CUSTOMER STATUS */}

              <div className="border-t border-[#DDE4E2] pt-4">
                <p className="text-xs text-[#64748B]">Customer Status</p>

                <div className="mt-2">
                  <CustomerStatusBadge status={customer.status} />
                </div>
              </div>
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

export default CustomerDetailsModal;
