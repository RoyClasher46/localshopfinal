function AnalyticsStatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  description,
}) {
  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">{label}</p>

          <p className="mt-2 text-2xl font-bold text-[#022B3A]">{value}</p>

          {description && (
            <p className="mt-1 text-xs text-[#64748B]">{description}</p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsStatCard;
