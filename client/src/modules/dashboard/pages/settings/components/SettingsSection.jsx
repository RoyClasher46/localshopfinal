function SettingsSection({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDE4E2] bg-white shadow-sm">
      {/* HEADER */}

      <div className="border-b border-[#DDE4E2] px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-[#022B3A]">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-[#64748B]">{description}</p>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default SettingsSection;
