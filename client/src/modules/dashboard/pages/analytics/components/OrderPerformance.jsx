import { Clock3, PackageCheck, CheckCircle2, XCircle } from "lucide-react";

function OrderPerformance({ data }) {
  const items = [
    {
      label: "Pending",
      value: data.pending,
      icon: Clock3,
      className: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Active",
      value: data.active,
      icon: PackageCheck,
      className: "bg-orange-50 text-orange-600",
    },
    {
      label: "Delivered",
      value: data.delivered,
      icon: CheckCircle2,
      className: "bg-green-50 text-green-600",
    },
    {
      label: "Cancelled",
      value: data.cancelled,
      icon: XCircle,
      className: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#022B3A]">Order Performance</h2>

        <p className="mt-1 text-sm text-[#64748B]">
          Current distribution of your orders.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-[#DDE4E2] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.className}`}
                >
                  <Icon size={19} />
                </div>

                <p className="text-2xl font-bold text-[#022B3A]">
                  {item.value}
                </p>
              </div>

              <p className="mt-3 text-sm font-medium text-[#64748B]">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderPerformance;
