import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ShopBanner from "../sections/ShopBanner";
import ShopOverviewSection from "../sections/ShopOverviewSection";
import ProductSection from "../sections/ProductSection";
import ReviewSection from "../../reviews/components/ReviewSection";
import LocationSection from "../sections/LocationSection";
import SimilarShopsSection from "../sections/SimilarShopsSection";

import { useLocation } from "../../../shared/context/LocationContext";
import { getShopById, getAllShops } from "../../../services/shopService";
import { productAPI, reviewAPI } from "../../../services/api";

function ShopDetailsPage() {
  const { id } = useParams();
  const { location } = useLocation();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [similarShops, setSimilarShops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadShop = async () => {
      try {
        setLoading(true);
        setError("");

        const [shopResponse, productsResponse, shopsResponse] =
          await Promise.all([
            getShopById(id),
            productAPI.list({
              shop: id,
            }),
            getAllShops(),
          ]);

        if (!mounted) {
          return;
        }

        const currentShop = shopResponse?.shop;

        if (!currentShop) {
          setShop(null);
          setProducts([]);
          setSimilarShops([]);
          setError("This shop does not exist.");
          return;
        }

        setShop(currentShop);

        const apiProducts = productsResponse?.data?.products || [];

        const productsWithReviews = await Promise.all(
          apiProducts.map(async (product) => {
            try {
              const reviewResponse = await reviewAPI.byTarget(
                "Product",
                product._id,
              );

              const reviewData = reviewResponse?.data;

              return {
                ...product,

                // Product ID
                id: product._id,

                // Shop ID
                shopId: product.shop?._id,

                //-->> Shop object for CartContext
                shop: product.shop
                  ? {
                      ...product.shop,
                      id: product.shop._id,
                    }
                  : null,

                // Availability
                available: Boolean(product.isAvailable),

                // Product review information
                rating: Number(reviewData?.averageRating) || 0,
                reviews: Number(reviewData?.count) || 0,

                // Other optional UI fields
                discount: Number(product.discount) || 0,
                featured: Boolean(product.featured),
              };
            } catch (reviewError) {
              console.error(
                `Failed to load reviews for product ${product._id}:`,
                reviewError,
              );

              return {
                ...product,

                id: product._id,

                shopId: product.shop?._id,

                shop: product.shop
                  ? {
                      ...product.shop,
                      id: product.shop._id,
                    }
                  : null,

                available: Boolean(product.isAvailable),

                rating: 0,
                reviews: 0,

                discount: Number(product.discount) || 0,
                featured: Boolean(product.featured),
              };
            }
          }),
        );

        if (!mounted) {
          return;
        }

        setProducts(productsWithReviews);

        //-->>> SIMILAR SHOPS

        const allShops = shopsResponse?.shops || [];

        const related = allShops.filter((item) => {
          if (!item) {
            return false;
          }

          if (String(item.id) === String(id)) {
            return false;
          }

          return (
            item.category &&
            currentShop.category &&
            String(item.category).toLowerCase() ===
              String(currentShop.category).toLowerCase()
          );
        });

        setSimilarShops(related);
      } catch (err) {
        console.error("Shop details error:", err);

        if (!mounted) {
          return;
        }

        setShop(null);
        setProducts([]);
        setSimilarShops([]);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load shop details.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadShop();
    } else {
      setLoading(false);
      setError("Shop ID is missing.");
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />

          <p className="mt-4 text-gray-500">Loading shop...</p>
        </div>
      </main>
    );
  }

  if (error || !shop) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-5">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#022B3A]">Shop Not Found</h1>

          <p className="mt-3 text-gray-500">
            {error || "This shop does not exist."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <ShopBanner shop={shop} userLocation={location} />

      <ShopOverviewSection shop={shop} />

      {!shop.isCommunityListed && (
        <ProductSection products={products} shop={shop} />
      )}

      <ReviewSection targetType="shop" targetId={shop.id} />

      <LocationSection shop={shop} />

      <SimilarShopsSection shops={similarShops} userLocation={location} />
    </main>
  );
}

export default ShopDetailsPage;
