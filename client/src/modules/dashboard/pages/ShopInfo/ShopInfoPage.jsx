import { useEffect, useState } from "react";

import ShopInformation from "./components/ShopInformation";
import ShopForm from "./components/ShopForm";

import { sellerShopAPI } from "../../../../services/api";

function ShopInfoPage() {
  const [shop, setShop] = useState(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const loadShop = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await sellerShopAPI.get();

      setShop(response.data?.shop || null);
    } catch (err) {
      console.error("Load seller shop error:", err);

      if (err.response?.status === 404) {
        setShop(null);
      } else {
        setError(
          err.response?.data?.message || "Unable to load shop information.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, []);

  const handleUpdate = async (formData) => {
    try {
      setError("");

      const response = await sellerShopAPI.update(formData);

      await loadShop();

      setEditing(false);

      return response;
    } catch (err) {
      console.error("Update shop error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update shop.";

      setError(message);

      throw err;
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />

        <p className="mt-4 text-gray-500">Loading shop information...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {editing ? (
        <ShopForm
          shop={shop}
          onCancel={() => setEditing(false)}
          onSave={handleUpdate}
        />
      ) : (
        <ShopInformation shop={shop} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}

export default ShopInfoPage;
