import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function SalesChart({ data, period }) {
  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#022B3A]">Sales Overview</h2>

        <p className="mt-1 text-sm text-[#64748B]">
          Revenue and order performance for{" "}
          {period === "7d"
            ? "the last 7 days"
            : period === "30d"
              ? "the last 30 days"
              : period === "3m"
                ? "the last 3 months"
                : period === "6m"
                  ? "the last 6 months"
                  : period === "1y"
                    ? "this year"
                    : "all time"}
          .
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748B",
                fontSize: 12,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748B",
                fontSize: 12,
              }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />

            <Tooltip
              cursor={{ fill: "#F8F4E9" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #DDE4E2",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
            />

            <Bar
              dataKey="revenue"
              fill="#FF8C00"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesChart;
