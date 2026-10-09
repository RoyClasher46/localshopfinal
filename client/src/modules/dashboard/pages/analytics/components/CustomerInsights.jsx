import { Users, UserPlus, UserRoundCheck } from "lucide-react";

function CustomerInsights({ data }) {
  const items = [
    {
      label: "Total Customers",
      value: data.totalCustomers,
      icon: Users,
      className: "bg-blue-50 text-blue-600",
    },
    {
      label: "New Customers",
      value: data.newCustomers,
      icon: UserPlus,
      className: "bg-orange-50 text-orange-600",
    },
    {
      label: "Returning Customers",
      value: data.returningCustomers,
      icon: UserRoundCheck,
      className: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#022B3A]">Customer Insights</h2>

        <p className="mt-1 text-sm text-[#64748B]">
          Understand your customer activity.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-[#DDE4E2] p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.className}`}
                >
                  <Icon size={18} />
                </div>

                <p className="text-sm font-medium text-[#64748B]">
                  {item.label}
                </p>
              </div>

              <p className="text-xl font-bold text-[#022B3A]">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomerInsights;
