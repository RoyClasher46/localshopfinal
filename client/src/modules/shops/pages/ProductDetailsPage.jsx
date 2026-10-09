import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ProductDetailsHero from "../components/ProductDetailsHero";
import ProductPurchaseCard from "../components/ProductPurchaseCard";
import ProductDescription from "../components/ProductDescription";
import ProductSpecifications from "../components/ProductSpecifications";
import ReviewSection from "../../reviews/components/ReviewSection";
import RelatedProducts from "../components/RelatedProducts";

import { productAPI, reviewAPI } from "../../../services/api";
import { getShopById } from "../../../services/shopService";

function ProductDetailsPage() {
  const { shopId, productId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const [productResponse, shopResponse, relatedResponse, reviewResponse] =
          await Promise.all([
            productAPI.get(productId),

            getShopById(shopId),

            productAPI.list({
              shop: shopId,
            }),

            reviewAPI.byTarget("Product", productId),
          ]);

        if (!mounted) return;

        const currentProduct = productResponse?.data?.product;

        if (!currentProduct) {
          setProduct(null);
          setShop(null);
          setError("The product does not exist or may have been removed.");
          return;
        }

        const currentShop = shopResponse?.shop || shopResponse?.data?.shop;

        if (!currentShop) {
          setProduct(null);
          setShop(null);
          setError("The shop does not exist or may have been removed.");
          return;
        }

        const reviewData = reviewResponse?.data;

        const rating = Number(reviewData?.averageRating) || 0;
        const reviewCount = Number(reviewData?.count) || 0;

        //--->>> NORMALIZED PRODUCT

        const normalizedProduct = {
          ...currentProduct,

          // Product ID
          id: currentProduct._id || currentProduct.id,

          // Shop ID
          shopId,

          // Primary image
          image: currentProduct.image || currentProduct.images?.[0] || "",

          // Maximum 4 images
          images: (Array.isArray(currentProduct.images) &&
          currentProduct.images.length > 0
            ? currentProduct.images
            : [currentProduct.image].filter(Boolean)
          ).slice(0, 4),

          // Availability
          available: Boolean(currentProduct.isAvailable),

          // Optional fields
          discount: Number(currentProduct.discount) || 0,
          featured: Boolean(currentProduct.featured),

          // Product review information
          rating,
          reviews: reviewCount,
        };

        //--->> RELATED PRODUCTS

        const related = relatedResponse?.data?.products || [];

        const normalizedRelatedProducts = await Promise.all(
          related
            .filter((item) => String(item._id || item.id) !== String(productId))
            .slice(0, 4)
            .map(async (item) => {
              const relatedProductId = item._id || item.id;

              let relatedRating = 0;
              let relatedReviewCount = 0;

              try {
                const relatedReviewResponse = await reviewAPI.byTarget(
                  "Product",
                  relatedProductId,
                );

                const relatedReviewData = relatedReviewResponse?.data;

                relatedRating = Number(relatedReviewData?.averageRating) || 0;

                relatedReviewCount = Number(relatedReviewData?.count) || 0;
              } catch (reviewError) {
                console.error(
                  `Failed to load reviews for related product ${relatedProductId}:`,
                  reviewError,
                );
              }

              return {
                ...item,

                // Product ID
                id: relatedProductId,

                // Primary image
                image: item.image || item.images?.[0] || "",

                // Maximum 4 images
                images: (Array.isArray(item.images) && item.images.length > 0
                  ? item.images
                  : [item.image].filter(Boolean)
                ).slice(0, 4),

                discount: Number(item.discount) || 0,

                // Real product rating
                rating: relatedRating,

                // Real product review count
                reviews: relatedReviewCount,
              };
            }),
        );

        if (!mounted) return;

        setProduct(normalizedProduct);
        setShop(currentShop);
        setRelatedProducts(normalizedRelatedProducts);
      } catch (err) {
        console.error("Product details error:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load product.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (shopId && productId) {
      loadProduct();
    } else {
      setLoading(false);
      setError("Product or shop ID is missing.");
    }

    return () => {
      mounted = false;
    };
  }, [shopId, productId]);

  //--->> LOADING

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F4E9]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />

          <p className="mt-4 text-gray-500">Loading product...</p>
        </div>
      </main>
    );
  }

  //--->>> ERROR / NOT FOUND

  if (!product || !shop || error) {
    return (
      <main className="min-h-screen bg-[#F8F4E9] px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShoppingCart size={28} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#022B3A]">
            Product Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            {error || "The product does not exist or may have been removed."}
          </p>

          <button
            onClick={() => navigate(shopId ? `/shops/${shopId}` : "/shops")}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#022B3A] px-6 py-3 font-semibold text-white"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </button>
        </div>
      </main>
    );
  }

  //--->> PAGE

  return (
    <main className="min-h-screen bg-[#F8F4E9]">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/shops/${shopId}`)}
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#022B3A] hover:text-[#FF8C00]"
        >
          <ArrowLeft size={17} />
          Back to {shop.name}
        </button>
      </div>

      <ProductDetailsHero product={product} shop={shop} />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-8">
            <ProductDescription product={product} />

            <ProductSpecifications product={product} />

            <ReviewSection targetType="product" targetId={product.id} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ProductPurchaseCard product={product} shop={shop} />
          </aside>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <RelatedProducts products={relatedProducts} shopId={shopId} />
        </section>
      )}
    </main>
  );
}

export default ProductDetailsPage;
