import { Eye } from "lucide-react";

import CustomerStatusBadge from "./CustomerStatusBadge";

function CustomerTable({ customers, onViewCustomer }) {
  if (!customers || customers.length === 0) {
    return (
      <div className="rounded-2xl border border-[#DDE4E2] bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F4E9] text-2xl">
          👥
        </div>

        <h3 className="mt-4 text-lg font-bold text-[#022B3A]">
          No customers found
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Try changing your search or filter.
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
                Customer
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Contact
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Orders
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Total Spent
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Last Order
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
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-[#DDE4E2] last:border-b-0 transition hover:bg-[#FAFBFA]"
              >
                {/* CUSTOMER */}

                <td className="px-5 py-4">
                  <p className="font-semibold text-[#022B3A]">
                    {customer.name}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">{customer.id}</p>
                </td>

                {/* CONTACT */}

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#022B3A]">
                    {customer.phone}
                  </p>

                  <p className="mt-1 max-w-[220px] truncate text-xs text-[#64748B]">
                    {customer.email}
                  </p>
                </td>

                {/* ORDERS */}

                <td className="px-5 py-4">
                  <p className="font-semibold text-[#022B3A]">
                    {customer.totalOrders}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {customer.completedOrders} completed
                  </p>
                </td>

                {/* TOTAL SPENT */}

                <td className="px-5 py-4">
                  <p className="font-bold text-[#022B3A]">
                    ₹{customer.totalSpent.toLocaleString("en-IN")}
                  </p>
                </td>

                {/* LAST ORDER */}

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#022B3A]">
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
                </td>

                {/* STATUS */}

                <td className="px-5 py-4">
                  <CustomerStatusBadge status={customer.status} />
                </td>

                {/* ACTION */}

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onViewCustomer(customer)}
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
        {customers.map((customer) => (
          <div key={customer.id} className="p-4">
            {/* HEADER */}

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#022B3A]">{customer.name}</p>

                <p className="mt-1 text-xs text-[#64748B]">{customer.id}</p>
              </div>

              <CustomerStatusBadge status={customer.status} />
            </div>

            {/* CONTACT */}

            <div className="mt-4">
              <p className="text-xs text-[#64748B]">Contact</p>

              <p className="mt-1 text-sm font-medium text-[#022B3A]">
                {customer.phone}
              </p>

              <p className="mt-1 truncate text-xs text-[#64748B]">
                {customer.email}
              </p>
            </div>

            {/* SUMMARY */}

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#64748B]">Total Orders</p>

                <p className="mt-1 text-sm font-bold text-[#022B3A]">
                  {customer.totalOrders}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#64748B]">Total Spent</p>

                <p className="mt-1 text-sm font-bold text-[#022B3A]">
                  ₹{customer.totalSpent.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* LAST ORDER */}

            <div className="mt-4">
              <p className="text-xs text-[#64748B]">Last Order</p>

              <p className="mt-1 text-sm font-medium text-[#022B3A]">
                {new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* ACTION */}

            <button
              type="button"
              onClick={() => onViewCustomer(customer)}
              className="cursor-pointer mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#022B3A] px-4 text-sm font-semibold text-white transition hover:bg-[#033B4F]"
            >
              <Eye size={16} />
              View Customer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerTable;
