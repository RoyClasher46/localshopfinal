function CustomerStatusBadge({ status }) {
  const statusConfig = {
    Active: {
      label: "Active",
      className: "border-green-200 bg-green-50 text-green-700",
      dotClass: "bg-green-500",
    },

    Inactive: {
      label: "Inactive",
      className: "border-gray-200 bg-gray-50 text-gray-600",
      dotClass: "bg-gray-400",
    },
  };

  const config = statusConfig[status] || {
    label: status || "Unknown",
    className: "border-gray-200 bg-gray-50 text-gray-600",
    dotClass: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />

      {config.label}
    </span>
  );
}

export default CustomerStatusBadge;
