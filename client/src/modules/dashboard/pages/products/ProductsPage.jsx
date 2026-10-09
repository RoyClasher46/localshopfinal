import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, Lock, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import ProductDeleteModal from "./components/ProductDeleteModal";

import { sellerProductAPI } from "../../../../services/api";
import { useAuth } from "../../../../shared/context/AuthContext";

function ProductsPage() {
  const navigate = useNavigate();
  const { seller } = useAuth();
  const isApproved = seller?.approvalStatus === "approved";
  const [products, setProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  //--->>> LOAD

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await sellerProductAPI.products();

      setProducts(response.data?.products || []);
    } catch (err) {
      console.error("Products load error:", err);

      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  //--->>> CATEGORIES

  const categories = useMemo(() => {
    const unique = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];

    return ["All", ...unique];
  }, [products]);

  //--->>> FILTER

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const stock = Number(product.stock || 0);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && stock > 0) ||
        (stockFilter === "Out of Stock" && stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  //--->>> SAVE

  const handleSaveProduct = async (productData) => {
    try {
      setSaving(true);
      setError("");

      if (editingProduct) {
        await sellerProductAPI.update(
          editingProduct._id || editingProduct.id,
          productData,
        );
      } else {
        await sellerProductAPI.create(productData);
      }

      await loadProducts();

      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Save product error:", err);

      setError(err.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  //--->>> DELETE

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setSaving(true);

      await sellerProductAPI.delete(productToDelete._id || productToDelete.id);

      await loadProducts();

      setProductToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-full bg-[#F8F4E9] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage the products available in your shop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (!isApproved) {
                toast.error(
                  seller?.approvalStatus === "rejected"
                    ? `Product listing locked: Your shop owner account was rejected by the Super Admin.${seller?.rejectionReason ? ` (${seller.rejectionReason})` : ""}`
                    : "Product listing locked: Your shop owner account is pending approval by the Super Admin.",
                );
                return;
              }
              navigate("/dashboard/products/upload");
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
              isApproved
                ? "border-2 border-[#022B3A] bg-white text-[#022B3A] hover:bg-[#022B3A] hover:text-white"
                : "border-2 border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            title={isApproved ? "Bulk Upload Products via Spreadsheet" : "Account pending Super Admin approval"}
          >
            <FileSpreadsheet size={18} />
            Bulk Upload
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isApproved) {
                toast.error(
                  seller?.approvalStatus === "rejected"
                    ? `Product listing locked: Your shop owner account was rejected by the Super Admin.${seller?.rejectionReason ? ` (${seller.rejectionReason})` : ""}`
                    : "Product listing locked: Your shop owner account is pending approval by the Super Admin.",
                );
                return;
              }
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all cursor-pointer ${
              isApproved
                ? "bg-[#FF8C00] text-white hover:bg-[#e07b00]"
                : "bg-slate-300 text-slate-500 hover:bg-slate-300"
            }`}
            title={isApproved ? "Add Product" : "Account pending Super Admin approval"}
          >
            {isApproved ? <Plus size={19} /> : <Lock size={17} />}
            Add Product
          </button>
        </div>
      </div>

      {!isApproved && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 shadow-sm">
          <Lock className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-amber-950">
              Product Listing Locked
            </div>
            <div className="mt-0.5 text-amber-900 leading-relaxed">
              {seller?.approvalStatus === "rejected"
                ? "Your shop owner application was rejected by the Super Admin. You cannot create or manage products."
                : "Your shop owner account must be approved by the Super Admin before you can list products. Once the admin accepts your request, product listing will be automatically unlocked."}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-[#DDE4E2] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_200px_180px]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
            />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] pl-11 pr-4 text-sm"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] pl-10 pr-4 text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-11 rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] px-4 text-sm"
          >
            <option value="All">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />

          <p className="mt-4 text-gray-500">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm font-medium text-[#64748B]">
            Showing{" "}
            <span className="font-semibold text-[#022B3A]">
              {filteredProducts.length}
            </span>{" "}
            products
          </div>

          <ProductList
            products={filteredProducts}
            onEdit={(product) => {
              setEditingProduct(product);
              setIsFormOpen(true);
            }}
            onDelete={setProductToDelete}
            onProductUpdated={loadProducts}
          />
        </>
      )}

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSaveProduct}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          loading={saving}
        />
      )}

      {productToDelete && (
        <ProductDeleteModal
          product={productToDelete}
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </section>
  );
}

export default ProductsPage;
