import { useEffect, useState } from "react";
import { Save } from "lucide-react";

function ShopSettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave(formData);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* SHOP NAME */}

      <div>
        <label
          htmlFor="shopName"
          className="mb-2 block text-sm font-semibold text-[#022B3A]"
        >
          Shop Name
        </label>

        <input
          id="shopName"
          name="shopName"
          type="text"
          value={formData.shopName}
          onChange={handleChange}
          placeholder="Enter shop name"
          className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] px-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
        />
      </div>

      {/* PHONE + EMAIL */}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-semibold text-[#022B3A]"
          >
            Phone Number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
            className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] px-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-[#022B3A]"
          >
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="shop@example.com"
            className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] px-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
          />
        </div>
      </div>

      {/* DESCRIPTION */}

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-semibold text-[#022B3A]"
        >
          Shop Description
        </label>

        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe your shop..."
          className="w-full resize-none rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] px-4 py-3 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
        />
      </div>

      {/* ACTION */}

      <div className="flex flex-col gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        {saved && (
          <p className="text-sm font-semibold text-green-600">
            ✓ Changes saved successfully
          </p>
        )}

        {!saved && <div />}

        <button
          type="submit"
          className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-5 text-sm font-semibold text-white transition hover:bg-[#033B4F]"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default ShopSettings;
