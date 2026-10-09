import { Trophy } from "lucide-react";

function TopProducts({ products }) {
  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-white shadow-sm">
      <div className="border-b border-[#DDE4E2] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
            <Trophy size={19} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#022B3A]">Top Products</h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Your best-performing products.
            </p>
          </div>
        </div>
      </div>

      {/* DESKTOP */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#DDE4E2] bg-[#F8F4E9]">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Product
              </th>

              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Units Sold
              </th>

              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Revenue
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="p-8 text-center text-sm text-[#64748B]">
                    No sales yet.
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-b border-[#DDE4E2] last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F4E9] text-sm font-bold text-[#022B3A]">
                        {index + 1}
                      </div>

                      <p className="font-semibold text-[#022B3A]">
                        {product.name}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-[#64748B]">
                    {product.unitsSold}
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-[#022B3A]">
                    ₹{product.revenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}

      <div className="divide-y divide-[#DDE4E2] md:hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            No sales yet.
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8F4E9] text-sm font-bold text-[#022B3A]">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#022B3A]">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {product.unitsSold} units sold
                  </p>
                </div>
              </div>

              <p className="shrink-0 font-bold text-[#022B3A]">
                ₹{product.revenue.toLocaleString("en-IN")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TopProducts;
