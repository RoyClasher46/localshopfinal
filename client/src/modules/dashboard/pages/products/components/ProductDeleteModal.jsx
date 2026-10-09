import { AlertTriangle, X } from "lucide-react";

function ProductDeleteModal({ product, onCancel, onConfirm }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#F8F4E9] p-6 shadow-2xl">
        {/* ICON */}

        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-white"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* CONTENT */}

        <h2 className="mt-5 text-xl font-bold text-[#022B3A]">
          Delete Product?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#022B3A]">{product.name}</span>?
          This action cannot be undone.
        </p>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-[#DDE4E2] bg-white px-5 py-3 text-sm font-semibold text-[#022B3A] transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDeleteModal;
