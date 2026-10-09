import { useEffect, useState } from "react";

import SettingsSection from "./components/SettingsSection";
import ShopSettings from "./components/ShopSettings";
import OrderSettings from "./components/OrderSettings";
import NotificationSettings from "./components/NotificationSettings";
import AccountSettings from "./components/AccountSettings";

import { sellerSettingsAPI } from "../../../../services/api";

function SettingsPage() {
  const [shopSettings, setShopSettings] = useState({
    shopName: "",
    phone: "",
    email: "",
    description: "",
  });

  const [orderSettings, setOrderSettings] = useState({
    acceptOrders: true,
    deliveryAvailable: false,
    minimumOrder: 0,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    reviews: true,
    orderUpdates: true,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await sellerSettingsAPI.get();

        const settings = response.data?.settings;

        const shop = settings?.shop;

        if (shop) {
          setShopSettings({
            shopName: shop.name || "",
            phone: shop.phone || "",
            email: shop.email || "",
            description: shop.description || "",
          });

          setOrderSettings({
            acceptOrders: shop.acceptOrders ?? true,

            deliveryAvailable: shop.deliveryAvailable ?? false,

            minimumOrder: shop.minimumOrder || 0,
          });
        }
      } catch (err) {
        console.error("Settings load error:", err);

        setError(err.response?.data?.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleShopSave = async (settings) => {
    try {
      await sellerSettingsAPI.update({
        name: settings.shopName,
        phone: settings.phone,
        email: settings.email,
        description: settings.description,
      });

      setShopSettings(settings);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save shop settings.");
    }
  };

  const handleOrderSave = async (settings) => {
    try {
      await sellerSettingsAPI.update({
        acceptOrders: settings.acceptOrders,

        deliveryAvailable: settings.deliveryAvailable,

        minimumOrder: Number(settings.minimumOrder),
      });

      setOrderSettings(settings);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save order settings.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-16 text-center">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
          Settings
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Manage your shop, order preferences, notifications and account
          settings.
        </p>
      </div>

      <SettingsSection
        title="Shop Settings"
        description="Manage basic shop contact and operational information."
      >
        <ShopSettings settings={shopSettings} onSave={handleShopSave} />
      </SettingsSection>

      <SettingsSection
        title="Order Settings"
        description="Control how your shop handles incoming orders."
      >
        <OrderSettings settings={orderSettings} onSave={handleOrderSave} />
      </SettingsSection>

      <SettingsSection
        title="Notification Settings"
        description="Choose which shop notifications you want to receive."
      >
        <NotificationSettings
          settings={notificationSettings}
          onSave={setNotificationSettings}
        />
      </SettingsSection>

      <SettingsSection
        title="Account"
        description="Manage your account security and session."
      >
        <AccountSettings />
      </SettingsSection>
    </div>
  );
}

export default SettingsPage;
