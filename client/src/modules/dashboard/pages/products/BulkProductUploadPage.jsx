import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Download,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  X,
  Trash2,
  Boxes,
  Store,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileCheck2,
  Lock,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { bulkProductAPI, sellerProductAPI } from "../../../../services/api";
import { useAuth } from "../../../../shared/context/AuthContext";

export default function BulkProductUploadPage() {
  const navigate = useNavigate();
  const { seller } = useAuth();
  const isApproved = seller?.approvalStatus === "approved";

  // Tab mode: 'categorySheet' | 'supplierSheet' | 'customProduct'
  const [activeMode, setActiveMode] = useState("categorySheet");

  // =========================================================================
  // OPTION A: CATEGORY TEMPLATE WIZARD STATE (Steps 1 to 5)
  // =========================================================================
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Template download state
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  // Upload & Validation state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [validationData, setValidationData] = useState(null);

  // Preview & Edit state
  const [previewProducts, setPreviewProducts] = useState([]);
  const [previewFilter, setPreviewFilter] = useState("all"); // 'all' | 'new' | 'existing'
  const [previewSearch, setPreviewSearch] = useState("");
  const [duplicateStrategy, setDuplicateStrategy] = useState("update"); // 'update' | 'replaceStock' | 'skip'

  // Final Confirmation & Save state
  const [savingImport, setSavingImport] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // =========================================================================
  // OPTION B: SUPPLIER IMPORT STATE
  // =========================================================================
  const [supplierStep, setSupplierStep] = useState(1); // 1: upload, 2: map, 3: preview, 4: done
  const [supplierFile, setSupplierFile] = useState(null);
  const [parsingSupplier, setParsingSupplier] = useState(false);
  const [supplierParsedData, setSupplierParsedData] = useState(null);
  const [supplierMapping, setSupplierMapping] = useState({
    nameCol: "",
    brandCol: "",
    barcodeCol: "",
    packSizeCol: "",
    categoryCol: "",
    priceCol: "",
    stockCol: "",
  });
  const [supplierMatching, setSupplierMatching] = useState(false);
  const [supplierMatchResult, setSupplierMatchResult] = useState(null);

  // =========================================================================
  // OPTION C: CUSTOM / LOCAL PRODUCT MODAL STATE
  // =========================================================================
  const [customForm, setCustomForm] = useState({
    name: "",
    brand: "",
    category: "",
    packSize: "",
    unit: "piece",
    price: "",
    stock: "",
    barcode: "",
    description: "",
    imageFile: null,
  });
  const [customImagePreview, setCustomImagePreview] = useState("");
  const [savingCustom, setSavingCustom] = useState(false);

  // AI Image Generation states
  const [generatingRowAiId, setGeneratingRowAiId] = useState(null);
  const [batchGeneratingAi, setBatchGeneratingAi] = useState(false);
  const [generatingCustomAi, setGeneratingCustomAi] = useState(false);
  const [generatingSupplierAi, setGeneratingSupplierAi] = useState(false);

  // File input refs
  const fileInputRef = useRef(null);
  const supplierFileInputRef = useRef(null);

  // Fetch Master Categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await bulkProductAPI.getCategories();
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Unable to load product categories from server.");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Filtered categories for Step 1
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
    );
  }, [categories, categorySearch]);

  // Handle Category Template Download
  const handleDownloadTemplate = async (format = "xlsx") => {
    if (!selectedCategory) {
      toast.error("Please select a category first.");
      return;
    }

    try {
      setDownloadingFormat(format);
      const res = await bulkProductAPI.downloadTemplate(
        selectedCategory.categoryId,
        format,
      );

      const blob = new Blob([res.data], {
        type:
          format === "csv"
            ? "text/csv;charset=utf-8;"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = selectedCategory.name.replace(/[^a-zA-Z0-9]/g, "_");
      a.href = url;
      a.download = `ShopLocal_${safeName}_Catalog.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `Downloaded ${selectedCategory.name} template (${format.toUpperCase()})!`,
      );
    } catch (err) {
      console.error("Template download failed:", err);
      toast.error("Failed to download template. Please try again.");
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Handle Blank Custom Template Download
  const handleDownloadCustomTemplate = async (format = "xlsx") => {
    try {
      const res = await bulkProductAPI.downloadCustomTemplate(format);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ShopLocal_Custom_Products_Template.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Downloaded custom products template!");
    } catch (err) {
      toast.error("Failed to download custom template.");
    }
  };

  // Handle Spreadsheet File Select (Step 3)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (
      !lowerName.endsWith(".xlsx") &&
      !lowerName.endsWith(".xls") &&
      !lowerName.endsWith(".csv")
    ) {
      toast.error("Please select a valid .xlsx, .xls or .csv spreadsheet.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size cannot exceed 15MB.");
      return;
    }

    setUploadedFile(file);
    setValidationError(null);
  };

  // Trigger Backend Validation (Step 3 -> Step 4)
  const handleValidateSpreadsheet = async () => {
    if (!uploadedFile) {
      toast.error("Please select or drop a spreadsheet file first.");
      return;
    }

    if (!selectedCategory) {
      toast.error("Selected category is missing. Please restart from Step 1.");
      return;
    }

    try {
      setValidating(true);
      setValidationError(null);

      const res = await bulkProductAPI.validateSheet(
        uploadedFile,
        selectedCategory.categoryId,
      );

      if (res.data?.success) {
        setValidationData(res.data);
        setPreviewProducts(res.data.validProducts || []);
        setCurrentStep(4);
        toast.success(
          `Validated ${res.data.validProducts?.length || 0} products for import!`,
        );
      }
    } catch (err) {
      console.error("Spreadsheet validation failed:", err);
      const errData = err.response?.data;

      if (errData?.categoryMismatch) {
        setValidationError({
          title: "Critical Category Mismatch Error",
          message:
            errData.message ||
            `The uploaded spreadsheet contains products from a different category than '${selectedCategory.name}'.`,
          isMismatch: true,
          selected: errData.selectedCategory?.name,
          detected: errData.detectedCategory?.name,
        });
      } else {
        setValidationError({
          title: "Spreadsheet Validation Error",
          message:
            errData?.message ||
            "Unable to validate spreadsheet. Please verify file format and columns.",
        });
      }
    } finally {
      setValidating(false);
    }
  };

  // Filtered preview products for Step 4
  const filteredPreviewProducts = useMemo(() => {
    const q = previewSearch.trim().toLowerCase();
    return previewProducts.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.variant?.toLowerCase().includes(q);

      const matchesFilter =
        previewFilter === "all" ||
        (previewFilter === "new" && !p.isExistingInShop) ||
        (previewFilter === "existing" && p.isExistingInShop);

      return matchesSearch && matchesFilter;
    });
  }, [previewProducts, previewSearch, previewFilter]);

  // Edit preview product values
  const handleUpdatePreviewItem = (index, field, value) => {
    setPreviewProducts((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Remove item from preview
  const handleRemovePreviewItem = (index) => {
    setPreviewProducts((prev) => prev.filter((_, i) => i !== index));
    toast.success("Product removed from import list.");
  };

  // Generate authentic AI packaging photo for a single preview item
  const handleGenerateAiForRow = async (item, originalIndex) => {
    const rowId = item.catalogId || item.productId || originalIndex;
    try {
      setGeneratingRowAiId(rowId);
      toast.loading(`Designing authentic packaging photo for "${item.name}"...`, { id: "row-ai" });
      const res = await bulkProductAPI.generateAiImage({
        name: item.name,
        description: item.description,
        brand: item.brand,
        category: item.category || selectedCategory?.name,
        packSize: item.packSize,
        variant: item.variant,
        barcode: item.barcode,
        forceAi: true,
      });

      if (res.data?.success && res.data.imageUrl) {
        handleUpdatePreviewItem(originalIndex, "imageUrl", res.data.imageUrl);
        handleUpdatePreviewItem(originalIndex, "hasAiImage", true);
        toast.success(`Authentic packaging photo generated for ${item.name}!`, { id: "row-ai" });
      } else {
        toast.error("Could not generate image for this item.", { id: "row-ai" });
      }
    } catch (err) {
      console.error("AI image generation error:", err);
      toast.error(
        err.response?.data?.message || "Failed to generate AI packaging image.",
        { id: "row-ai" },
      );
    } finally {
      setGeneratingRowAiId(null);
    }
  };

  // Batch generate authentic AI packaging photos for all products missing images
  const handleBatchGenerateMissingImages = async () => {
    const itemsNeedingImages = previewProducts
      .map((p, idx) => ({ ...p, originalIndex: idx }))
      .filter(
        (p) =>
          !p.imageUrl ||
          p.imageUrl.includes("unsplash.com") ||
          p.imageUrl.includes("via.placeholder") ||
          p.imageUrl.includes("placeholder"),
      );

    if (itemsNeedingImages.length === 0) {
      toast.success("All products already have authentic packaging photos!");
      return;
    }

    try {
      setBatchGeneratingAi(true);
      toast.loading(
        `Generating AI packaging photos for ${itemsNeedingImages.length} products...`,
        { id: "batch-ai" },
      );

      const payload = itemsNeedingImages.map((p) => ({
        productId: p.catalogId || p.productId,
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: p.category || selectedCategory?.name,
        packSize: p.packSize,
        variant: p.variant,
        barcode: p.barcode,
      }));

      const res = await bulkProductAPI.batchGenerateAiImages(payload);

      if (res.data?.success && res.data.results) {
        const resultMap = new Map();
        res.data.results.forEach((r) => {
          if (r.id) resultMap.set(r.id, r.imageUrl);
          if (r.productId) resultMap.set(r.productId, r.imageUrl);
          if (r.name) resultMap.set(r.name, r.imageUrl);
        });

        setPreviewProducts((prev) =>
          prev.map((item) => {
            const key = item.catalogId || item.productId || item.name;
            const newImg = resultMap.get(key);
            if (newImg) {
              return { ...item, imageUrl: newImg, hasAiImage: true };
            }
            return item;
          }),
        );

        toast.success(
          `Successfully generated ${res.data.summary?.generatedCount || res.data.results.length} authentic packaging photos!`,
          { id: "batch-ai" },
        );
      }
    } catch (err) {
      console.error("Batch AI generation error:", err);
      toast.error(
        err.response?.data?.message || "Batch AI image generation failed.",
        { id: "batch-ai" },
      );
    } finally {
      setBatchGeneratingAi(false);
    }
  };

  // Generate authentic AI packaging photo for Option C Custom Product
  const handleGenerateCustomAiImage = async () => {
    if (!customForm.name.trim()) {
      toast.error("Please enter the product name first.");
      return;
    }

    try {
      setGeneratingCustomAi(true);
      toast.loading(`Designing packaging photo for "${customForm.name}"...`, { id: "custom-ai" });

      const res = await bulkProductAPI.generateAiImage({
        name: customForm.name,
        description: customForm.description,
        brand: customForm.brand || "Local Homemade",
        category: customForm.category || "General",
        packSize: customForm.packSize || "Standard Pack",
        unit: customForm.unit || "piece",
        barcode: customForm.barcode,
        forceAi: true,
      });

      if (res.data?.success && res.data.imageUrl) {
        setCustomImagePreview(res.data.imageUrl);
        setCustomForm((prev) => ({
          ...prev,
          imageUrl: res.data.imageUrl,
          imageFile: null,
        }));
        toast.success("Authentic packaging photo created and attached!", { id: "custom-ai" });
      } else {
        toast.error("Could not generate image.", { id: "custom-ai" });
      }
    } catch (err) {
      console.error("Custom AI generation error:", err);
      toast.error(
        err.response?.data?.message || "Failed to generate AI packaging image.",
        { id: "custom-ai" },
      );
    } finally {
      setGeneratingCustomAi(false);
    }
  };

  // Batch generate AI images for Option B Supplier unmatched products
  const handleBatchGenerateSupplierImages = async () => {
    const unmatched = previewProducts.filter(
      (p) => p.matchType !== "catalog_verified" || !p.imageUrl,
    );

    if (unmatched.length === 0) {
      toast.success("All supplier products already have verified photos!");
      return;
    }

    try {
      setGeneratingSupplierAi(true);
      toast.loading(
        `Generating AI packaging photos for ${unmatched.length} supplier items...`,
        { id: "supplier-ai" },
      );

      const payload = unmatched.map((p) => ({
        productId: p.catalogId || p.productId || p.name,
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: p.category || "General",
        packSize: p.packSize,
        barcode: p.barcode,
      }));

      const res = await bulkProductAPI.batchGenerateAiImages(payload);

      if (res.data?.success && res.data.results) {
        const resultMap = new Map();
        res.data.results.forEach((r) => {
          if (r.id) resultMap.set(r.id, r.imageUrl);
          if (r.productId) resultMap.set(r.productId, r.imageUrl);
          if (r.name) resultMap.set(r.name, r.imageUrl);
        });

        setPreviewProducts((prev) =>
          prev.map((item) => {
            const key = item.catalogId || item.productId || item.name;
            const newImg = resultMap.get(key);
            if (newImg) {
              return { ...item, imageUrl: newImg, hasAiImage: true };
            }
            return item;
          }),
        );

        toast.success(
          `Generated ${res.data.summary?.generatedCount || res.data.results.length} packaging photos for supplier products!`,
          { id: "supplier-ai" },
        );
      }
    } catch (err) {
      console.error("Supplier AI generation failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to generate AI packaging photos.",
        { id: "supplier-ai" },
      );
    } finally {
      setGeneratingSupplierAi(false);
    }
  };

  // Commit Import to Database (Step 5)
  const handleConfirmImport = async () => {
    if (!previewProducts.length) {
      toast.error("No valid products remaining in your preview list.");
      return;
    }

    // Verify all prices and stocks are valid before sending
    for (let i = 0; i < previewProducts.length; i++) {
      const item = previewProducts[i];
      if (!item.sellingPrice || Number(item.sellingPrice) <= 0) {
        toast.error(`Invalid price for "${item.name}". Price must be > 0.`);
        return;
      }
      if (item.stockQuantity === "" || Number(item.stockQuantity) < 0) {
        toast.error(
          `Invalid stock for "${item.name}". Stock must be 0 or more.`,
        );
        return;
      }
    }

    try {
      setSavingImport(true);

      const payload = {
        products: previewProducts.map((p) => ({
          catalogId: p.catalogId || p.productId,
          productId: p.productId,
          sellingPrice: Number(p.sellingPrice),
          stockQuantity: Number(p.stockQuantity),
          isAvailable: Boolean(p.isAvailable),
          name: p.name,
          description: p.description,
          brand: p.brand,
          category: p.category || selectedCategory?.name,
          packSize: p.packSize,
          variant: p.variant,
          unit: p.unit,
          barcode: p.barcode,
          imageUrl: p.imageUrl,
          mrp: p.mrp,
        })),
        duplicateStrategy,
        categoryId: selectedCategory?.categoryId,
      };

      const res = await bulkProductAPI.confirmImport(payload);

      if (res.data?.success) {
        setImportSummary(res.data.summary);
        setIsSuccessModalOpen(true);
        toast.success("Products successfully imported to your shop!");
      }
    } catch (err) {
      console.error("Bulk import failed:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to import products to shop inventory.",
      );
    } finally {
      setSavingImport(false);
    }
  };

  // Reset wizard
  const handleResetWizard = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setUploadedFile(null);
    setValidationData(null);
    setPreviewProducts([]);
    setValidationError(null);
    setImportSummary(null);
    setIsSuccessModalOpen(false);
  };

  // =========================================================================
  // OPTION B: SUPPLIER HANDLERS
  // =========================================================================
  const handleSupplierFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSupplierFile(file);
    try {
      setParsingSupplier(true);
      const res = await bulkProductAPI.parseSupplierSheet(file);
      if (res.data?.success) {
        setSupplierParsedData(res.data);
        setSupplierMapping(res.data.suggestedMapping || {});
        setSupplierStep(2);
        toast.success(
          `Read ${res.data.totalRows} rows from supplier spreadsheet!`,
        );
      }
    } catch (err) {
      console.error("Supplier parse failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to parse supplier spreadsheet.",
      );
    } finally {
      setParsingSupplier(false);
    }
  };

  const handleMatchSupplierProducts = async () => {
    if (!supplierParsedData?.allRows?.length) {
      toast.error("No rows found to match.");
      return;
    }

    if (!supplierMapping.nameCol) {
      toast.error("Please map at least the Product Name column.");
      return;
    }

    try {
      setSupplierMatching(true);
      const res = await bulkProductAPI.matchSupplierProducts({
        rows: supplierParsedData.allRows,
        mapping: supplierMapping,
      });

      if (res.data?.success) {
        setSupplierMatchResult(res.data);
        // Load matched + unmatched into wizard preview
        const combined = [
          ...(res.data.matchedProducts || []),
          ...(res.data.unmatchedProducts || []),
        ];
        setPreviewProducts(combined);
        setSupplierStep(3);
        toast.success(
          `Matched ${res.data.summary?.matchedCount || 0} catalog products!`,
        );
      }
    } catch (err) {
      console.error("Supplier matching failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to match supplier items.",
      );
    } finally {
      setSupplierMatching(false);
    }
  };

  // =========================================================================
  // OPTION C: CUSTOM PRODUCT HANDLER
  // =========================================================================
  const handleCustomSubmit = async (e) => {
    e.preventDefault();

    if (!customForm.name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!customForm.category.trim()) {
      toast.error("Category is required.");
      return;
    }
    if (!customForm.price || Number(customForm.price) <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }
    if (customForm.stock === "" || Number(customForm.stock) < 0) {
      toast.error("Stock must be 0 or more.");
      return;
    }

    try {
      setSavingCustom(true);
      const res = await bulkProductAPI.addCustomProduct({
        ...customForm,
        imageUrl: customForm.imageUrl || customImagePreview,
        image: customForm.imageFile,
      });

      if (res.data?.success) {
        toast.success("Custom product added to your inventory!");
        setCustomForm({
          name: "",
          brand: "",
          category: "",
          packSize: "",
          unit: "piece",
          price: "",
          stock: "",
          barcode: "",
          description: "",
          imageFile: null,
          imageUrl: "",
        });
        setCustomImagePreview("");
        navigate("/dashboard/products");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add custom product.",
      );
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F8F4E9] pb-16">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/products")}
            className="group mb-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#64748B] transition hover:text-[#022B3A]"
          >
            <ArrowLeft
              size={15}
              className="transition group-hover:-translate-x-1"
            />
            Back to Products
          </button>
          <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Bulk Product Upload
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Add hundreds of verified retail products to your shop in minutes
            with smart spreadsheets.
          </p>
        </div>

        {/* MODE SELECTOR PILLS */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#DDE4E2] bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setActiveMode("categorySheet");
              setCurrentStep(1);
            }}
            className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeMode === "categorySheet"
                ? "bg-[#022B3A] text-white shadow-sm"
                : "text-[#022B3A] hover:bg-[#F8F4E9]"
            }`}
          >
            <FileSpreadsheet size={15} />
            Option A: Category Template
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode("supplierSheet");
              setSupplierStep(1);
            }}
            className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeMode === "supplierSheet"
                ? "bg-[#022B3A] text-white shadow-sm"
                : "text-[#022B3A] hover:bg-[#F8F4E9]"
            }`}
          >
            <Upload size={15} />
            Option B: Supplier Spreadsheet
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("customProduct")}
            className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeMode === "customProduct"
                ? "bg-[#022B3A] text-white shadow-sm"
                : "text-[#022B3A] hover:bg-[#F8F4E9]"
            }`}
          >
            <Plus size={15} />
            Other / Local Products
          </button>
        </div>
      </div>

      {/* ACCOUNT LOCKED WARNING IF UNAPPROVED */}
      {!isApproved && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 shadow-sm">
          <Lock className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-amber-950">
              Bulk Upload Locked
            </div>
            <div className="mt-0.5 text-amber-900 leading-relaxed">
              {seller?.approvalStatus === "rejected"
                ? "Your shop owner application was rejected by the Super Admin. You cannot import or manage inventory."
                : "Your shop owner account must be approved by the Super Admin before you can upload or publish inventory."}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* OPTION A: CATEGORY WIZARD                                            */}
      {/* =================================================================== */}
      {activeMode === "categorySheet" && (
        <div>
          {/* STEP PROGRESS BAR */}
          <div className="mb-8 rounded-2xl border border-[#DDE4E2] bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { num: 1, title: "Select Category", desc: "Choose product type" },
                { num: 2, title: "Download Sheet", desc: "Pre-filled catalog" },
                { num: 3, title: "Upload & Verify", desc: "Safety check" },
                { num: 4, title: "Preview & Edit", desc: "Set prices & stock" },
                { num: 5, title: "Save to Shop", desc: "Bulk import" },
              ].map((step) => {
                const isCurrent = currentStep === step.num;
                const isCompleted = currentStep > step.num;

                return (
                  <div
                    key={step.num}
                    className={`flex items-center gap-3 rounded-xl p-2.5 transition ${
                      isCurrent
                        ? "bg-[#FFF0D9] border border-[#FF8C00]/30"
                        : isCompleted
                          ? "bg-emerald-50/70"
                          : "opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-[#FF8C00] text-white shadow-sm"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check size={16} /> : step.num}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-[#022B3A]">
                        {step.title}
                      </div>
                      <div className="hidden truncate text-[10px] text-[#64748B] sm:block">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: SELECT CATEGORY */}
          {currentStep === 1 && (
            <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#022B3A]">
                    Step 1: Select a Product Category
                  </h2>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Choose the category of products you want to add. You'll get
                    a pre-populated spreadsheet with commonly sold Indian
                    kirana products.
                  </p>
                </div>

                {/* SEARCH */}
                <div className="relative w-full sm:w-72">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                  />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search category (e.g. Biscuits)..."
                    className="h-10 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] pl-9 pr-3 text-xs outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              {loadingCategories ? (
                <div className="py-20 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#FF8C00]" />
                  <p className="mt-3 text-xs text-[#64748B]">
                    Loading categories from Master Catalog...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredCategories.map((cat) => {
                    const isSelected =
                      selectedCategory?.categoryId === cat.categoryId;

                    return (
                      <button
                        type="button"
                        key={cat.categoryId}
                        onClick={() => setSelectedCategory(cat)}
                        className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-2 border-[#FF8C00] bg-[#FFF9EF] shadow-md ring-2 ring-[#FF8C00]/20"
                            : "border-[#DDE4E2] bg-white hover:border-[#022B3A]/30 hover:bg-[#F8F4E9]/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#022B3A]/5 text-[#022B3A] group-hover:bg-[#FF8C00]/10 group-hover:text-[#FF8C00]">
                              <Boxes size={18} />
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                              {cat.productCount} products
                            </span>
                          </div>

                          <h3 className="mt-3 text-sm font-bold text-[#022B3A]">
                            {cat.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#64748B]">
                            {cat.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-semibold">
                          <span
                            className={
                              isSelected ? "text-[#FF8C00]" : "text-[#64748B]"
                            }
                          >
                            {isSelected ? "Selected ✓" : "Click to select"}
                          </span>
                          <ChevronRight
                            size={14}
                            className={`transition ${
                              isSelected
                                ? "text-[#FF8C00] translate-x-1"
                                : "text-slate-400"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ACTION BAR */}
              <div className="mt-8 flex flex-col gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-[#64748B]">
                  {selectedCategory ? (
                    <span className="font-medium text-[#022B3A]">
                      Selected Category:{" "}
                      <strong className="text-[#FF8C00]">
                        {selectedCategory.name}
                      </strong>{" "}
                      ({selectedCategory.productCount} products ready in catalog)
                    </span>
                  ) : (
                    "Please select one category to continue."
                  )}
                </div>

                <button
                  type="button"
                  disabled={!selectedCategory}
                  onClick={() => setCurrentStep(2)}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#033d52] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue to Step 2
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DOWNLOAD SPREADSHEET */}
          {currentStep === 2 && selectedCategory && (
            <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#FFF0D9] px-2.5 py-0.5 text-xs font-bold text-[#FF8C00]">
                      {selectedCategory.name}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      • {selectedCategory.productCount} items available
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-[#022B3A]">
                    Step 2: Download Your Category Spreadsheet
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    We've generated an official template for{" "}
                    <strong>{selectedCategory.name}</strong> containing real
                    Indian brand variants, MRPs, barcodes, and pack sizes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="cursor-pointer text-xs font-semibold text-[#64748B] hover:text-[#022B3A] hover:underline"
                >
                  Change Category
                </button>
              </div>

              {/* DOWNLOAD CARDS */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col justify-between rounded-2xl border-2 border-[#FF8C00]/30 bg-[#FFF9EF] p-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8C00] text-white">
                        <FileSpreadsheet size={22} />
                      </span>
                      <span className="rounded-md bg-[#FF8C00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF8C00]">
                        RECOMMENDED
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[#022B3A]">
                      Excel Spreadsheet (.xlsx)
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Includes auto-sized columns, field formatting, and a
                      built-in Instructions sheet. Ideal for Microsoft Excel,
                      Google Sheets, and Apple Numbers.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(downloadingFormat)}
                    onClick={() => handleDownloadTemplate("xlsx")}
                    className="cursor-pointer mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#e07b00]"
                  >
                    {downloadingFormat === "xlsx" ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Download size={15} />
                    )}
                    Download Excel Template (.xlsx)
                  </button>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-[#DDE4E2] bg-white p-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#022B3A] text-white">
                        <FileSpreadsheet size={22} />
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                        LIGHTWEIGHT
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[#022B3A]">
                      CSV Spreadsheet (.csv)
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Raw comma-separated plain text format compatible with all
                      spreadsheet editors, billing software, and custom POS
                      tools.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(downloadingFormat)}
                    onClick={() => handleDownloadTemplate("csv")}
                    className="cursor-pointer mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#022B3A] bg-white px-4 py-3 text-xs font-bold text-[#022B3A] transition hover:bg-[#022B3A] hover:text-white"
                  >
                    {downloadingFormat === "csv" ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Download size={15} />
                    )}
                    Download CSV Template (.csv)
                  </button>
                </div>
              </div>

              {/* INSTRUCTIONS GUIDE BOX */}
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-950">
                    <h4 className="font-bold text-blue-900">
                      How to Edit Your Spreadsheet:
                    </h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-blue-900/90 leading-relaxed">
                      <li>
                        <strong>Select products you sell:</strong> In the{" "}
                        <code className="rounded bg-blue-100 px-1 py-0.5 font-bold">
                          Add to My Shop (YES/NO)
                        </code>{" "}
                        column, change <code className="font-bold">NO</code> to{" "}
                        <code className="font-bold text-emerald-700">YES</code>{" "}
                        for products your shop stocks.
                      </li>
                      <li>
                        <strong>Set your price & stock:</strong> Enter your
                        shop's selling price in{" "}
                        <code className="font-bold">My Selling Price (₹)</code>{" "}
                        and quantity in{" "}
                        <code className="font-bold">Stock Quantity</code>.
                      </li>
                      <li>
                        <strong>No manual image uploads:</strong> Verified
                        catalog images are automatically assigned to matching
                        products!
                      </li>
                      <li>
                        <strong className="text-rose-700">Security Rule:</strong>{" "}
                        Do NOT change the Product ID or Category ID columns.
                        Files belonging to a different category will be rejected
                        automatically.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="mt-8 flex flex-col gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-[#022B3A] hover:bg-slate-50"
                >
                  <ArrowLeft size={15} />
                  Back to Step 1
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#033d52]"
                >
                  I've Edited My File — Proceed to Upload
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD & VERIFY */}
          {currentStep === 3 && selectedCategory && (
            <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="rounded-full bg-[#FFF0D9] px-2.5 py-0.5 text-xs font-bold text-[#FF8C00]">
                    Category: {selectedCategory.name}
                  </span>
                  <h2 className="mt-1.5 text-xl font-bold text-[#022B3A]">
                    Step 3: Upload Your Edited Spreadsheet
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Upload the spreadsheet you edited. Our system will verify
                    category safety, check product existence, and prepare a live
                    preview.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("xlsx")}
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF8C00] hover:underline"
                >
                  <Download size={14} />
                  Re-download Template
                </button>
              </div>

              {/* ERROR ALERT IF CATEGORY MISMATCH OR VALIDATION ERROR */}
              {validationError && (
                <div
                  className={`mb-6 rounded-2xl border p-4 ${
                    validationError.isMismatch
                      ? "border-rose-300 bg-rose-50 text-rose-950"
                      : "border-amber-300 bg-amber-50 text-amber-950"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 shrink-0 mt-0.5 ${
                        validationError.isMismatch
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    />
                    <div>
                      <h4 className="text-sm font-bold">
                        {validationError.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed">
                        {validationError.message}
                      </p>
                      {validationError.isMismatch && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="cursor-pointer rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-700"
                          >
                            Switch Category to {validationError.detected}
                          </button>
                          <button
                            type="button"
                            onClick={() => setValidationError(null)}
                            className="cursor-pointer rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-bold text-rose-800 hover:bg-rose-50"
                          >
                            Try Another File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DROPZONE */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const lower = file.name.toLowerCase();
                    if (
                      lower.endsWith(".xlsx") ||
                      lower.endsWith(".xls") ||
                      lower.endsWith(".csv")
                    ) {
                      setUploadedFile(file);
                      setValidationError(null);
                    } else {
                      toast.error("Please drop a valid .xlsx or .csv file.");
                    }
                  }
                }}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition ${
                  uploadedFile
                    ? "border-emerald-400 bg-emerald-50/50"
                    : "border-slate-300 bg-slate-50/50 hover:border-[#FF8C00] hover:bg-[#FFF9EF]/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    uploadedFile
                      ? "bg-emerald-500 text-white"
                      : "bg-[#FFF0D9] text-[#FF8C00] group-hover:scale-105 transition"
                  }`}
                >
                  {uploadedFile ? (
                    <FileCheck2 size={32} />
                  ) : (
                    <Upload size={32} />
                  )}
                </div>

                {uploadedFile ? (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-emerald-900">
                      {uploadedFile.name}
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • Click to
                      choose a different file
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-[#022B3A]">
                      Click to upload or drag & drop your edited spreadsheet
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Supports .XLSX, .XLS and .CSV formats • Maximum size 15MB
                    </p>
                  </div>
                )}
              </div>

              {/* ACTION BAR */}
              <div className="mt-8 flex flex-col gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-[#022B3A] hover:bg-slate-50"
                >
                  <ArrowLeft size={15} />
                  Back to Step 2
                </button>

                <button
                  type="button"
                  disabled={!uploadedFile || validating}
                  onClick={handleValidateSpreadsheet}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-7 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#e07b00] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {validating ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Validating Against Catalog...
                    </>
                  ) : (
                    <>
                      Validate & Show Preview
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW & LIVE EDIT */}
          {currentStep === 4 && (
            <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 shadow-sm">
              {/* SUMMARY STATS CARDS */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Total Selected
                  </div>
                  <div className="mt-1 text-2xl font-black text-[#022B3A]">
                    {previewProducts.length}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Products to import
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    New Products
                  </div>
                  <div className="mt-1 text-2xl font-black text-emerald-700">
                    {previewProducts.filter((p) => !p.isExistingInShop).length}
                  </div>
                  <div className="text-[10px] text-emerald-600">
                    Will be added to shop
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    Already in Shop
                  </div>
                  <div className="mt-1 text-2xl font-black text-blue-700">
                    {previewProducts.filter((p) => p.isExistingInShop).length}
                  </div>
                  <div className="text-[10px] text-blue-600">
                    Will update stock / price
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Est. Inventory Value
                  </div>
                  <div className="mt-1 text-2xl font-black text-amber-700">
                    ₹
                    {previewProducts
                      .reduce(
                        (acc, curr) =>
                          acc +
                          (Number(curr.sellingPrice) || 0) *
                            (Number(curr.stockQuantity) || 0),
                        0,
                      )
                      .toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-amber-600">
                    Total stock value
                  </div>
                </div>
              </div>

              {/* DUPLICATE STRATEGY SETTINGS */}
              <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#022B3A]">
                    Duplicate Handling Strategy:
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Choose what happens if a product already exists in your shop
                    inventory.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    {
                      id: "update",
                      label: "Update Stock & Price (Recommended)",
                    },
                    { id: "replaceStock", label: "Replace Stock Only" },
                    { id: "skip", label: "Skip Existing" },
                  ].map((strat) => (
                    <button
                      type="button"
                      key={strat.id}
                      onClick={() => setDuplicateStrategy(strat.id)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 font-semibold transition ${
                        duplicateStrategy === strat.id
                          ? "bg-[#022B3A] text-white shadow-sm"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {strat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FILTER & SEARCH BAR + AI ACTION */}
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {["all", "new", "existing"].map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setPreviewFilter(f)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                        previewFilter === f
                          ? "bg-[#FF8C00] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {f === "all"
                        ? `All (${previewProducts.length})`
                        : f === "new"
                          ? `New Only (${previewProducts.filter((p) => !p.isExistingInShop).length})`
                          : `Existing in Shop (${previewProducts.filter((p) => p.isExistingInShop).length})`}
                    </button>
                  ))}

                  {/* AUTO-GENERATE MISSING AI IMAGES BUTTON */}
                  <button
                    type="button"
                    onClick={handleBatchGenerateMissingImages}
                    disabled={batchGeneratingAi || previewProducts.length === 0}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-[#FF8C00] to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition"
                    title="Generate authentic studio packaging photos matching product name & brand for all missing images"
                  >
                    {batchGeneratingAi ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} className="text-amber-100" />
                    )}
                    {batchGeneratingAi ? "Generating Packaging Photos..." : "Auto-Generate Missing Photos (AI)"}
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                  />
                  <input
                    type="text"
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    placeholder="Search in preview..."
                    className="h-9 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] pl-9 pr-3 text-xs outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              {/* LIVE EDITABLE TABLE */}
              <div className="overflow-x-auto rounded-xl border border-[#DDE4E2]">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="border-b border-[#DDE4E2] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <tr>
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">Brand & Variant</th>
                      <th className="px-3 py-3">Ref. MRP</th>
                      <th className="px-3 py-3">
                        Shop Selling Price (₹) *
                      </th>
                      <th className="px-3 py-3">Stock Quantity *</th>
                      <th className="px-3 py-3">Availability</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPreviewProducts.map((item, idx) => {
                      const originalIndex = previewProducts.findIndex(
                        (p) =>
                          (p.catalogId || p.productId) ===
                          (item.catalogId || item.productId),
                      );

                      return (
                        <tr
                          key={item.catalogId || item.productId || idx}
                          className="hover:bg-slate-50/60 transition"
                        >
                          {/* PRODUCT IMAGE & NAME */}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0 group">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-100 shadow-xs"
                                  />
                                ) : (
                                  <div
                                    title="No packaging photo yet - click ✨ to generate with AI"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-amber-300 bg-amber-50/80 text-amber-600"
                                  >
                                    <Sparkles size={16} />
                                  </div>
                                )}
                                {generatingRowAiId === (item.catalogId || item.productId || originalIndex) ? (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-amber-300">
                                    <RefreshCw size={14} className="animate-spin" />
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateAiForRow(item, originalIndex)}
                                    title="Generate / update authentic retail packaging with AI"
                                    className="cursor-pointer absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#022B3A] text-amber-300 shadow hover:bg-[#FF8C00] hover:text-white transition"
                                  >
                                    <Sparkles size={11} />
                                  </button>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#022B3A] line-clamp-1">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-[#64748B] flex items-center gap-1.5 flex-wrap">
                                  <span>{item.packSize} • {item.catalogId || item.productId}</span>
                                  {item.hasAiImage && (
                                    <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                                      AI Packaging
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* BRAND & VARIANT */}
                          <td className="px-3 py-3 text-slate-700">
                            <div className="font-semibold">{item.brand}</div>
                            <div className="text-[10px] text-slate-500">
                              {item.variant || "-"}
                            </div>
                          </td>

                          {/* REFERENCE MRP */}
                          <td className="px-3 py-3 font-semibold text-slate-500">
                            ₹{item.mrp || "-"}
                          </td>

                          {/* EDITABLE SELLING PRICE */}
                          <td className="px-3 py-3">
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0.01"
                                step="0.5"
                                value={item.sellingPrice}
                                onChange={(e) =>
                                  handleUpdatePreviewItem(
                                    originalIndex,
                                    "sellingPrice",
                                    e.target.value,
                                  )
                                }
                                className={`h-8 w-full rounded-lg border pl-6 pr-2 text-xs font-bold outline-none ${
                                  !item.sellingPrice ||
                                  Number(item.sellingPrice) <= 0
                                    ? "border-rose-400 bg-rose-50 text-rose-700"
                                    : "border-slate-300 bg-white text-[#022B3A] focus:border-[#FF8C00]"
                                }`}
                              />
                            </div>
                          </td>

                          {/* EDITABLE STOCK QUANTITY */}
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.stockQuantity}
                              onChange={(e) =>
                                handleUpdatePreviewItem(
                                  originalIndex,
                                  "stockQuantity",
                                  e.target.value,
                                )
                              }
                              className={`h-8 w-24 rounded-lg border px-2.5 text-xs font-bold outline-none ${
                                item.stockQuantity === "" ||
                                Number(item.stockQuantity) < 0
                                  ? "border-rose-400 bg-rose-50 text-rose-700"
                                  : "border-slate-300 bg-white text-[#022B3A] focus:border-[#FF8C00]"
                              }`}
                            />
                          </td>

                          {/* AVAILABILITY TOGGLE */}
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdatePreviewItem(
                                  originalIndex,
                                  "isAvailable",
                                  !item.isAvailable,
                                )
                              }
                              className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                                item.isAvailable
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                              }`}
                            >
                              {item.isAvailable ? "In Stock" : "Out of Stock"}
                            </button>
                          </td>

                          {/* INVENTORY STATUS */}
                          <td className="px-3 py-3">
                            {item.isExistingInShop ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                In Shop (₹{item.existingPrice})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                New Item
                              </span>
                            )}
                          </td>

                          {/* REMOVE ACTION */}
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemovePreviewItem(originalIndex)
                              }
                              className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="Remove from import"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ACTION BAR */}
              <div className="mt-8 flex flex-col gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-[#022B3A] hover:bg-slate-50"
                >
                  <ArrowLeft size={15} />
                  Back & Upload Different File
                </button>

                <button
                  type="button"
                  disabled={savingImport || !previewProducts.length}
                  onClick={handleConfirmImport}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#e07b00] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingImport ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Saving {previewProducts.length} Products to Your Shop...
                    </>
                  ) : (
                    <>
                      Save Products to My Shop
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* OPTION B: SUPPLIER IMPORT WIZARD                                    */}
      {/* =================================================================== */}
      {activeMode === "supplierSheet" && (
        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              Supplier & Billing Software Export
            </span>
            <h2 className="mt-1 text-xl font-bold text-[#022B3A]">
              Import Supplier or Distributor Spreadsheet
            </h2>
            <p className="text-xs text-[#64748B]">
              Upload any spreadsheet format (.xlsx, .csv). Map your supplier's
              column headers to automatically match products against the Master
              Catalog.
            </p>
          </div>

          {/* SUPPLIER STEP 1: UPLOAD FILE */}
          {supplierStep === 1 && (
            <div>
              <div
                onClick={() => supplierFileInputRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center transition hover:border-[#022B3A] hover:bg-slate-50"
              >
                <input
                  ref={supplierFileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleSupplierFileChange}
                  className="hidden"
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#022B3A] text-white">
                  <Upload size={28} />
                </div>
                <p className="mt-4 text-sm font-bold text-[#022B3A]">
                  Click to select your supplier spreadsheet
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  Works with Vyapar, Marg, Tally, Busy, and Excel invoices
                </p>
              </div>

              {parsingSupplier && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#64748B]">
                  <RefreshCw size={14} className="animate-spin" />
                  Reading spreadsheet headers...
                </div>
              )}
            </div>
          )}

          {/* SUPPLIER STEP 2: COLUMN MAPPING */}
          {supplierStep === 2 && supplierParsedData && (
            <div>
              <div className="mb-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <h3 className="text-sm font-bold text-[#022B3A]">
                  Map Your Spreadsheet Columns
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  We automatically detected the best matching columns below.
                  Verify or adjust the mapping before matching.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    key: "nameCol",
                    label: "Product Name Column *",
                    required: true,
                  },
                  {
                    key: "brandCol",
                    label: "Brand Column",
                    required: false,
                  },
                  {
                    key: "barcodeCol",
                    label: "Barcode / GTIN / Item Code",
                    required: false,
                  },
                  {
                    key: "packSizeCol",
                    label: "Pack Size / Weight",
                    required: false,
                  },
                  {
                    key: "categoryCol",
                    label: "Category Column",
                    required: false,
                  },
                  {
                    key: "priceCol",
                    label: "Selling Price / Rate Column",
                    required: false,
                  },
                  {
                    key: "stockCol",
                    label: "Stock / Qty Column",
                    required: false,
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                      {field.label}
                    </label>
                    <select
                      value={supplierMapping[field.key] || ""}
                      onChange={(e) =>
                        setSupplierMapping((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-[#DDE4E2] bg-white px-3 text-xs outline-none focus:border-[#FF8C00]"
                    >
                      <option value="">-- Do Not Map --</option>
                      {supplierParsedData.headers?.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* ACTION BAR */}
              <div className="mt-8 flex items-center justify-between border-t border-[#DDE4E2] pt-5">
                <button
                  type="button"
                  onClick={() => setSupplierStep(1)}
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#022B3A]"
                >
                  <ArrowLeft size={14} />
                  Choose Different File
                </button>

                <button
                  type="button"
                  disabled={supplierMatching || !supplierMapping.nameCol}
                  onClick={handleMatchSupplierProducts}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#022B3A] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#033d52] disabled:opacity-40"
                >
                  {supplierMatching ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Matching Products Against Master Catalog...
                    </>
                  ) : (
                    <>
                      Match Against Catalog & Preview
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUPPLIER STEP 3: PREVIEW & IMPORT */}
          {supplierStep === 3 && (
            <div>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Matching Results
                  </h3>
                  <p className="mt-1 text-xs text-emerald-800">
                    {supplierMatchResult?.summary?.matchedCount || 0} products were
                    matched to official master catalog products with verified
                    images.{" "}
                    {supplierMatchResult?.summary?.unmatchedCount || 0} unmatched
                    products will be imported as custom shop items.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBatchGenerateSupplierImages}
                  disabled={generatingSupplierAi || !previewProducts.some((p) => p.matchType !== "catalog_verified" || !p.imageUrl)}
                  className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF8C00] px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-[#e07b00] disabled:opacity-50 transition"
                >
                  <Sparkles size={14} className={generatingSupplierAi ? "animate-spin" : ""} />
                  {generatingSupplierAi ? "Generating AI Photos..." : "✨ Auto-Generate AI Photos for Unmatched"}
                </button>
              </div>

              {/* REUSE THE RICH PREVIEW TABLE */}
              <div className="overflow-x-auto rounded-xl border border-[#DDE4E2]">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="bg-slate-50 text-[#64748B]">
                    <tr>
                      <th className="px-3 py-2.5">Product & Photo</th>
                      <th className="px-3 py-2.5">Brand</th>
                      <th className="px-3 py-2.5">Category</th>
                      <th className="px-3 py-2.5">Price (₹)</th>
                      <th className="px-3 py-2.5">Stock</th>
                      <th className="px-3 py-2.5">Catalog Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewProducts.slice(0, 50).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-bold text-[#022B3A]">
                          <div className="flex items-center gap-2.5">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-100"
                              />
                            ) : (
                              <div
                                title="No photo set - click ✨ to generate with AI"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-amber-300 bg-amber-50/80 text-amber-600"
                              >
                                <Sparkles size={14} />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-[#022B3A] line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-slate-500">{p.packSize || "Standard"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {p.brand}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {p.category}
                        </td>
                        <td className="px-3 py-2.5 font-bold">
                          ₹{p.sellingPrice}
                        </td>
                        <td className="px-3 py-2.5">{p.stockQuantity}</td>
                        <td className="px-3 py-2.5">
                          {p.matchType === "catalog_verified" ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              Local Custom
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ACTION BAR */}
              <div className="mt-6 flex items-center justify-between border-t border-[#DDE4E2] pt-4">
                <button
                  type="button"
                  onClick={() => setSupplierStep(2)}
                  className="cursor-pointer text-xs font-semibold text-[#64748B] hover:text-[#022B3A]"
                >
                  Adjust Column Mapping
                </button>

                <button
                  type="button"
                  disabled={savingImport || !previewProducts.length}
                  onClick={handleConfirmImport}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#FF8C00] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#e07b00]"
                >
                  {savingImport ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Save {previewProducts.length} Supplier Products to My Shop
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* OPTION C: OTHER / LOCAL PRODUCTS                                    */}
      {/* =================================================================== */}
      {activeMode === "customProduct" && (
        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                Non-Catalog Items
              </span>
              <h2 className="mt-1 text-xl font-bold text-[#022B3A]">
                Add Local & Artisanal Products
              </h2>
              <p className="text-xs text-[#64748B]">
                For local bakery items, freshly made regional sweets, or products
                not found in the national catalog.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadCustomTemplate("xlsx")}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#022B3A] bg-white px-4 py-2 text-xs font-bold text-[#022B3A] hover:bg-[#022B3A] hover:text-white"
            >
              <Download size={15} />
              Download Custom Products Excel Template
            </button>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={customForm.name}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, name: e.target.value })
                  }
                  placeholder="e.g. Local Bakery Rusk"
                  className="h-10 w-full rounded-xl border border-[#DDE4E2] px-3 text-xs outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={customForm.brand}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, brand: e.target.value })
                  }
                  placeholder="e.g. City Bakeries"
                  className="h-10 w-full rounded-xl border border-[#DDE4E2] px-3 text-xs outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={customForm.category}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, category: e.target.value })
                  }
                  placeholder="e.g. Bread & Bakery"
                  className="h-10 w-full rounded-xl border border-[#DDE4E2] px-3 text-xs outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                  Pack Size / Weight
                </label>
                <input
                  type="text"
                  value={customForm.packSize}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, packSize: e.target.value })
                  }
                  placeholder="e.g. 500g"
                  className="h-10 w-full rounded-xl border border-[#DDE4E2] px-3 text-xs outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                  Shop Selling Price (₹) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={customForm.price}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, price: e.target.value })
                  }
                  placeholder="0.00"
                  className="h-10 w-full rounded-xl border border-[#DDE4E2] px-3 text-xs outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={customForm.stock}
                  onChange={(e) =>
                    setCustomForm({ ...customForm, stock: e.target.value })
                  }
                  placeholder="0"
                  className="h-10 w-full rounded-xl border border-[#DDE4E2] px-3 text-xs outline-none focus:border-[#FF8C00]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#022B3A]">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={customForm.description}
                onChange={(e) =>
                  setCustomForm({ ...customForm, description: e.target.value })
                }
                placeholder="Product details, ingredients, or notes..."
                className="w-full rounded-xl border border-[#DDE4E2] p-3 text-xs outline-none focus:border-[#FF8C00]"
              />
            </div>

            {/* PRODUCT PACKAGING IMAGE (MANUAL OR AI GENERATED) */}
            <div className="rounded-xl border border-[#DDE4E2] bg-slate-50/70 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="text-xs font-bold text-[#022B3A] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#FF8C00]" />
                    Product Packaging Photo
                  </label>
                  <p className="text-[11px] text-[#64748B]">
                    Upload custom photo or auto-generate authentic commercial retail packaging with AI.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCustomAiImage}
                  disabled={generatingCustomAi || !customForm.name.trim()}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF8C00] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-[#e07b00] disabled:opacity-40 transition"
                >
                  <Sparkles size={13} className={generatingCustomAi ? "animate-spin" : ""} />
                  {generatingCustomAi ? "Generating Packaging with AI..." : "✨ Generate Photo with AI"}
                </button>
              </div>

              {customImagePreview ? (
                <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                  <div className="relative">
                    <img
                      src={customImagePreview}
                      alt="Product preview"
                      className="h-20 w-20 rounded-xl border border-amber-200 object-cover bg-white shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 text-white">
                      <Check size={10} />
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      ✓ Authentic Retail Pack Generated
                    </span>
                    <p className="mt-1 text-xs font-semibold text-[#022B3A]">
                      {customForm.name} ({customForm.packSize || "Standard"})
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Permanently hosted on high-speed CDN and attached to this product.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomImagePreview("");
                      setCustomForm((prev) => ({ ...prev, imageUrl: "", imageFile: null }));
                    }}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Remove Image"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="cursor-pointer flex-1 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 text-xs font-semibold text-[#022B3A] hover:border-[#FF8C00] transition">
                    <Upload size={16} className="text-[#FF8C00]" />
                    Upload from Computer (JPEG, PNG)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCustomForm((prev) => ({ ...prev, imageFile: file, imageUrl: "" }));
                          setCustomImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
                  <button
                    type="button"
                    onClick={handleGenerateCustomAiImage}
                    disabled={generatingCustomAi || !customForm.name.trim()}
                    className="cursor-pointer flex-1 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#FF8C00] bg-white p-4 text-xs font-bold text-[#FF8C00] hover:bg-amber-50 disabled:opacity-40 transition"
                  >
                    <Sparkles size={15} className={generatingCustomAi ? "animate-spin" : ""} />
                    {generatingCustomAi ? "Designing Retail Pack..." : "Auto-Generate with AI"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={savingCustom}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#FF8C00] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#e07b00] disabled:opacity-40"
              >
                {savingCustom ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Add Product to Shop Inventory
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUCCESS MODAL                                                       */}
      {/* =================================================================== */}
      {isSuccessModalOpen && importSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle size={36} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#022B3A]">
              Inventory Import Successful!
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Your products have been securely verified and saved to your shop
              inventory.
            </p>

            <div className="my-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
              <div>
                <div className="text-lg font-black text-emerald-600">
                  {importSummary.addedCount}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Added
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-blue-600">
                  {importSummary.updatedCount}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Updated
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-slate-600">
                  {importSummary.skippedCount}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Skipped
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard/products")}
                className="cursor-pointer w-full rounded-xl bg-[#022B3A] py-3 text-xs font-bold text-white transition hover:bg-[#033d52]"
              >
                View Products in Inventory
              </button>

              <button
                type="button"
                onClick={handleResetWizard}
                className="cursor-pointer w-full rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Upload Another Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
