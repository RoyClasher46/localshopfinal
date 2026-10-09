function OrderStatusBadge({ status }) {
  const statusConfig = {
    Pending: {
      label: "Pending",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },

    Accepted: {
      label: "Accepted",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },

    Preparing: {
      label: "Preparing",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },

    Ready: {
      label: "Ready",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },

    Delivered: {
      label: "Delivered",
      className: "bg-green-50 text-green-700 border-green-200",
    },

    Cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = statusConfig[status] || {
    label: status || "Unknown",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {config.label}
    </span>
  );
}

export default OrderStatusBadge;
