import { LogOut, X } from "lucide-react";

function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#022B3A]/50 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[#DDE4E2] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#DDE4E2] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <LogOut size={19} />
            </div>

            <h2 className="text-lg font-bold text-[#022B3A]">Logout</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F8F4E9] hover:text-[#022B3A]"
            aria-label="Close logout dialog"
          >
            <X size={19} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-6">
          <p className="text-sm leading-6 text-[#64748B]">
            Are you sure you want to logout from your seller dashboard?
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            You can login again anytime using your seller account.
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#DDE4E2] bg-[#FAFBFA] p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-[#DDE4E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:border-[#022B3A] hover:bg-[#F8F4E9]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
