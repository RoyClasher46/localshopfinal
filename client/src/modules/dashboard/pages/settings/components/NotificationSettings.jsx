import { useEffect, useState } from "react";
import { Bell, MessageSquare, PackageCheck, Save } from "lucide-react";

function NotificationSettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleToggle = (name) => {
    setFormData((previous) => ({
      ...previous,
      [name]: !previous[name],
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

  const notificationItems = [
    {
      key: "newOrders",
      title: "New Order Notifications",
      description: "Get notified whenever a customer places a new order.",
      icon: Bell,
      iconClass: "bg-[#FFF0D9] text-[#FF8C00]",
    },
    {
      key: "reviews",
      title: "Customer Review Notifications",
      description:
        "Get notified when customers leave a shop or product review.",
      icon: MessageSquare,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      key: "orderUpdates",
      title: "Order Status Notifications",
      description: "Receive notifications when order status changes.",
      icon: PackageCheck,
      iconClass: "bg-green-50 text-green-600",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notificationItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
              >
                <Icon size={19} />
              </div>

              <div>
                <p className="font-semibold text-[#022B3A]">{item.title}</p>

                <p className="mt-1 text-xs text-[#64748B]">
                  {item.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle(item.key)}
              className={`cursor-pointer relative h-6 w-11 shrink-0 rounded-full transition ${
                formData[item.key] ? "bg-[#FF8C00]" : "bg-[#CBD5E1]"
              }`}
              aria-label={`Toggle ${item.title}`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  formData[item.key] ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        );
      })}

      {/* SAVE */}

      <div className="flex flex-col gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        {saved ? (
          <p className="text-sm font-semibold text-green-600">
            ✓ Notification settings saved
          </p>
        ) : (
          <div />
        )}

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

export default NotificationSettings;
