import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Package,
  ChevronRight,
  Loader2,
  AlertCircle,
  MapPin,
  CreditCard,
  CalendarDays,
  Store,
  X,
  Check,
  Clock3,
  ChefHat,
  Truck,
  CircleCheck,
  ReceiptText,
  ArrowLeft,
} from "lucide-react";

import { orderAPI } from "../../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelStep, setCancelStep] = useState("confirm");
  const [cancelValidationError, setCancelValidationError] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await orderAPI.mine();

      setOrders(response?.data?.orders || []);
    } catch (error) {
      console.error("Load orders error:", error);

      setError(error?.response?.data?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (order) => {
    if (!order?._id) {
      return;
    }

    const cancellableStatuses = ["Pending", "Accepted"];

    if (!cancellableStatuses.includes(order.status)) {
      return;
    }

    if (cancellingOrderId) {
      return;
    }

    setCancelOrder(order);
    setCancelReason("");
    setCancelStep("confirm");
    setCancelValidationError("");
    setCancelError("");
  };

  const closeCancelPopup = () => {
    if (cancellingOrderId) {
      return;
    }

    setCancelOrder(null);
    setCancelReason("");
    setCancelStep("confirm");
    setCancelValidationError("");
    setCancelError("");
  };

  const continueCancellation = () => {
    if (!cancelOrder) {
      return;
    }

    setCancelValidationError("");
    setCancelError("");
    setCancelStep("reason");
  };

  const goBackToCancellationConfirmation = () => {
    if (cancellingOrderId) {
      return;
    }

    setCancelValidationError("");
    setCancelError("");
    setCancelStep("confirm");
  };

  const submitCancellation = async () => {
    if (!cancelOrder?._id || cancellingOrderId) {
      return;
    }

    const reason = cancelReason.trim();

    if (!reason) {
      setCancelValidationError("Please enter a reason before cancelling.");
      return;
    }

    if (reason.length < 3) {
      setCancelValidationError(
        "Please provide a little more detail about the cancellation.",
      );
      return;
    }

    setCancelValidationError("");
    setCancelError("");

    try {
      setCancellingOrderId(cancelOrder._id);

      const response = await orderAPI.cancel(cancelOrder._id, reason);

      const updatedOrder = response?.data?.order ||
        response?.data?.updatedOrder || {
          ...cancelOrder,
          status: "Cancelled",
          cancellationReason: reason,
          cancelledBy: "Customer",
        };

      setOrders((previousOrders) =>
        previousOrders.map((existingOrder) =>
          String(existingOrder._id) === String(cancelOrder._id)
            ? {
                ...existingOrder,
                ...updatedOrder,
                status: "Cancelled",
                cancellationReason: updatedOrder.cancellationReason || reason,
                cancelledBy: updatedOrder.cancelledBy || "Customer",
              }
            : existingOrder,
        ),
      );

      setSelectedOrder((currentOrder) => {
        if (
          currentOrder &&
          String(currentOrder._id) === String(cancelOrder._id)
        ) {
          return {
            ...currentOrder,
            ...updatedOrder,
            status: "Cancelled",
            cancellationReason: updatedOrder.cancellationReason || reason,
            cancelledBy: updatedOrder.cancelledBy || "Customer",
          };
        }

        return currentOrder;
      });

      setCancelOrder(null);
      setCancelReason("");
      setCancelStep("confirm");
      setCancelValidationError("");
      setCancelError("");
    } catch (error) {
      console.error("Cancel order error:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to cancel this order. Please try again.";

      setCancelError(message);
      setCancelStep("error");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Delivered":
        return {
          label: "Delivered",
          className: "bg-green-50 text-green-700 border-green-200",
          icon: <CircleCheck size={14} />,
        };

      case "Cancelled":
        return {
          label: "Cancelled",
          className: "bg-red-50 text-red-700 border-red-200",
          icon: <X size={14} />,
        };

      case "Preparing":
        return {
          label: "Preparing",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <ChefHat size={14} />,
        };

      case "Ready":
        return {
          label: "Ready for pickup",
          className: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Package size={14} />,
        };

      case "Accepted":
        return {
          label: "Accepted",
          className: "bg-cyan-50 text-cyan-700 border-cyan-200",
          icon: <Check size={14} />,
        };

      default:
        return {
          label: "Order placed",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock3 size={14} />,
        };
    }
  };

  //--->>> LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4E9]">
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Loader2 size={28} className="animate-spin text-[#FF8C00]" />
            </div>

            <p className="text-sm font-medium text-[#64748B]">
              Loading your orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F4E9] py-5 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#DDE4E2] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#022B3A] shadow-sm transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/*  HEADER */}

        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF8C00] sm:text-xs">
              My Account
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#022B3A] sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#64748B] sm:text-base">
              Track your purchases and view your order history.
            </p>
          </div>

          {orders.length > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DDE4E2] bg-white px-4 py-2 text-xs font-semibold text-[#64748B] shadow-sm">
              <ReceiptText size={15} className="text-[#FF8C00]" />
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </div>
          )}
        </div>

        {/*  ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertCircle size={18} />
              </div>

              <div className="min-w-0">
                <p className="font-bold text-red-800">Unable to load orders</p>

                <p className="mt-1 break-words text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={loadOrders}
                  className="mt-3 text-sm font-bold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY */}

        {!error && orders.length === 0 && <EmptyOrders />}

        {/*  ORDER LIST */}

        {!error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                formatDate={formatDate}
                formatTime={formatTime}
                getStatusConfig={getStatusConfig}
                onView={() => setSelectedOrder(order)}
                onCancel={() => handleCancelOrder(order)}
                cancelling={cancellingOrderId === order._id}
              />
            ))}
          </div>
        )}
      </div>

      {/*  ORDER DETAILS MODAL */}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          formatDate={formatDate}
          formatTime={formatTime}
          getStatusConfig={getStatusConfig}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {cancelOrder && (
        <CancelOrderModal
          order={cancelOrder}
          step={cancelStep}
          reason={cancelReason}
          setReason={(value) => {
            setCancelReason(value);

            if (cancelValidationError) {
              setCancelValidationError("");
            }

            if (cancelError) {
              setCancelError("");
            }
          }}
          validationError={cancelValidationError}
          errorMessage={cancelError}
          onContinue={continueCancellation}
          onBack={goBackToCancellationConfirmation}
          onSubmit={submitCancellation}
          onClose={closeCancelPopup}
          cancelling={cancellingOrderId === cancelOrder._id}
        />
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E0E5E3] bg-white shadow-[0_8px_30px_rgba(2,43,58,0.05)]">
      <div className="px-5 py-16 text-center sm:py-20">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFF0D9] text-[#FF8C00]">
          <ShoppingBag size={34} />
        </div>

        <h2 className="text-xl font-bold text-[#022B3A] sm:text-2xl">
          No orders yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
          You haven't placed an order yet. Explore local shops and discover
          products around you.
        </p>

        <a
          href="/shops"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E67E00]"
        >
          <ShoppingBag size={17} />
          Explore Shops
        </a>
      </div>
    </div>
  );
}

//--->>> ORDER CARD

function OrderCard({
  order,
  formatDate,
  getStatusConfig,
  onView,
  onCancel,
  cancelling,
}) {
  const firstItems = Array.isArray(order.items) ? order.items.slice(0, 3) : [];

  const remainingCount = Math.max(
    (order.items?.length || 0) - firstItems.length,
    0,
  );

  const status = getStatusConfig(order.status);

  const canCancel = order.status === "Pending" || order.status === "Accepted";

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#E0E5E3] bg-white shadow-[0_6px_25px_rgba(2,43,58,0.04)] transition hover:border-[#CDD8D4] hover:shadow-[0_10px_35px_rgba(2,43,58,0.07)]">
      {/* HEADER */}

      <div className="border-b border-[#E8ECEA] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
              <Package size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="max-w-full truncate font-bold text-[#022B3A]">
                  {order.orderNumber || `Order #${order._id?.slice(-6)}`}
                </h2>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide sm:text-[10px] ${status.className}`}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={13} />
                  {formatDate(order.createdAt)}
                </span>

                {order.shop?.name && (
                  <span className="inline-flex max-w-[180px] items-center gap-1 truncate">
                    <Store size={13} />
                    {order.shop.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">
              Order Total
            </p>

            <p className="mt-1 text-xl font-bold text-[#022B3A]">
              ₹{Number(order.total || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* PRODUCTS */}

      <div className="px-4 py-5 sm:px-6">
        <div className="space-y-3">
          {firstItems.map((item, index) => (
            <div
              key={`${item.product || item.name}-${index}`}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F3F5F4]">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package size={21} className="text-[#94A3B8]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#022B3A]">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-[#94A3B8]">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold text-[#022B3A]">
                ₹
                {Number(
                  item.subtotal ?? (item.price || 0) * (item.quantity || 0),
                ).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        {remainingCount > 0 && (
          <button
            type="button"
            onClick={onView}
            className="mt-3 text-xs font-bold text-[#FF8C00]"
          >
            + {remainingCount} more {remainingCount === 1 ? "item" : "items"}
          </button>
        )}

        {/* FOOTER */}

        <div className="mt-5 flex flex-col gap-4 border-t border-[#E8ECEA] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <CreditCard size={14} />
              {order.paymentMethod || "COD"}
            </span>

            {order.deliveryAddress?.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {order.deliveryAddress.city}
              </span>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={cancelling}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {cancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Order"
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onView}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#022B3A] px-4 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:border-[#FF8C00] hover:text-[#FF8C00] sm:w-auto"
            >
              View Order
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

//-->>> CUSTOM CANCEL ORDER MODAL

function CancelOrderModal({
  order,
  step,
  reason,
  setReason,
  validationError,
  errorMessage,
  onContinue,
  onBack,
  onSubmit,
  onClose,
  cancelling,
}) {
  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#022B3A]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !cancelling) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#E0E5E3] bg-[#F8F4E9] shadow-2xl">
        {/* HEADER */}

        <div className="bg-[#022B3A] px-5 py-5 text-white sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
                  Cancel Order
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {step === "error"
                    ? "Cancellation failed"
                    : step === "confirm"
                      ? "Cancel this order?"
                      : "Tell us why"}
                </h2>

                <p className="mt-1 text-xs text-white/50">
                  {order.orderNumber || `Order #${order._id?.slice(-6)}`}
                </p>
              </div>
            </div>

            {!cancelling && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close cancellation popup"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}

        <div className="p-5 sm:p-6">
          {/*  CONFIRMATION STEP */}

          {step === "confirm" && (
            <>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Are you sure?
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      Once cancelled, this order cannot be restored.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-[#DDE4E2] bg-white px-5 py-3 text-sm font-semibold text-[#022B3A] transition hover:border-[#022B3A] sm:w-auto"
                >
                  Keep Order
                </button>

                <button
                  type="button"
                  onClick={onContinue}
                  className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
                >
                  Yes, Cancel
                </button>
              </div>
            </>
          )}

          {/*  REASON STEP */}

          {step === "reason" && (
            <>
              <div>
                <label
                  htmlFor="cancel-reason"
                  className="text-sm font-bold text-[#022B3A]"
                >
                  Cancellation reason
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Please tell us why you would like to cancel this order.
                </p>

                <textarea
                  id="cancel-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Enter your reason..."
                  rows={5}
                  autoFocus
                  disabled={cancelling}
                  aria-invalid={Boolean(validationError)}
                  className={`mt-3 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#F3F5F4] ${
                    validationError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                      : "border-[#DDE4E2] focus:border-[#FF8C00] focus:ring-[#FF8C00]/10"
                  }`}
                />

                {validationError && (
                  <div className="mt-2 flex items-start gap-2 text-xs font-medium text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={cancelling}
                  className="w-full rounded-xl border border-[#DDE4E2] bg-white px-5 py-3 text-sm font-semibold text-[#022B3A] transition hover:border-[#022B3A] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={cancelling}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {cancelling ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Order"
                  )}
                </button>
              </div>
            </>
          )}

          {/* ERROR STEP */}

          {step === "error" && (
            <>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-red-800">
                      Unable to cancel order
                    </p>

                    <p className="mt-1 break-words text-sm leading-6 text-red-700">
                      {errorMessage ||
                        "Something went wrong while cancelling this order."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-[#022B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#033E50] sm:w-auto"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

//--->>> ORDER DETAILS MODAL

function OrderDetailsModal({
  order,
  formatDate,
  formatTime,
  getStatusConfig,
  onClose,
}) {
  const status = getStatusConfig(order.status);

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-[#022B3A]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#F8F4E9] shadow-2xl sm:max-w-3xl sm:rounded-3xl">
        {/* HEADER */}

        <div className="shrink-0 bg-[#022B3A] px-4 py-5 text-white sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
                Order Details
              </p>

              <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
                {order.orderNumber || `Order #${order._id?.slice(-6)}`}
              </h2>

              <p className="mt-1 text-xs text-white/50">
                Placed on {formatDate(order.createdAt)}
                {order.createdAt && ` at ${formatTime(order.createdAt)}`}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close order details"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="overflow-y-auto">
          <div className="space-y-5 p-4 sm:p-7">
            {/* STATUS */}

            <OrderStatusTimeline status={order.status} />

            {/* SHOP */}

            {(order.shop?.name || order.seller?.name) && (
              <section className="rounded-2xl border border-[#E0E5E3] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1EF] text-[#022B3A]">
                    <Store size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">
                      Shop
                    </p>

                    <p className="mt-1 font-bold text-[#022B3A]">
                      {order.shop?.name || order.seller?.name || "Local Shop"}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ITEMS */}

            <section className="overflow-hidden rounded-2xl border border-[#E0E5E3] bg-white">
              <div className="border-b border-[#E8ECEA] px-5 py-4">
                <h3 className="font-bold text-[#022B3A]">Items</h3>

                <p className="mt-0.5 text-xs text-[#94A3B8]">
                  {order.items?.length || 0}{" "}
                  {order.items?.length === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="divide-y divide-[#E8ECEA]">
                {(order.items || []).map((item, index) => (
                  <div
                    key={`${item.product || item.name}-${index}`}
                    className="flex gap-3 p-4 sm:gap-4 sm:p-5"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F3F5F4]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={23} className="text-[#94A3B8]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold text-[#022B3A]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")} ×{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 font-bold text-[#022B3A]">
                      ₹
                      {Number(
                        item.subtotal ??
                          (item.price || 0) * (item.quantity || 0),
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* DELIVERY */}

            {order.deliveryAddress && (
              <section className="rounded-2xl border border-[#E0E5E3] bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#022B3A]">
                      Delivery Address
                    </h3>

                    <p className="text-xs text-[#94A3B8]">
                      Where your order will be delivered
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F8F4E9] p-4">
                  <p className="text-sm font-semibold text-[#022B3A]">
                    {order.deliveryAddress.name || "Customer"}
                  </p>

                  {order.deliveryAddress.phone && (
                    <p className="mt-1 text-xs text-[#64748B]">
                      {order.deliveryAddress.phone}
                    </p>
                  )}

                  <p className="mt-3 break-words text-sm leading-6 text-[#475569]">
                    {order.deliveryAddress.addressLine}
                  </p>

                  <p className="break-words text-sm leading-6 text-[#64748B]">
                    {[
                      order.deliveryAddress.city,
                      order.deliveryAddress.state,
                      order.deliveryAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </section>
            )}

            {/* PAYMENT + SUMMARY */}

            <section className="grid gap-5 md:grid-cols-2">
              {/* PAYMENT */}

              <div className="rounded-2xl border border-[#E0E5E3] bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1EF] text-[#022B3A]">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#022B3A]">Payment</h3>

                    <p className="text-xs text-[#94A3B8]">
                      Payment information
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <SummaryRow
                    label="Method"
                    value={order.paymentMethod || "COD"}
                  />

                  <SummaryRow
                    label="Status"
                    value={order.paymentStatus || "Pending"}
                  />
                </div>
              </div>

              {/* SUMMARY */}

              <div className="rounded-2xl border border-[#E0E5E3] bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                    <ReceiptText size={19} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#022B3A]">Price Summary</h3>

                    <p className="text-xs text-[#94A3B8]">Order total</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <SummaryRow
                    label="Subtotal"
                    value={`₹${Number(order.subtotal || 0).toLocaleString(
                      "en-IN",
                    )}`}
                  />

                  <SummaryRow
                    label="Delivery"
                    value={
                      Number(order.deliveryFee || 0) === 0
                        ? "Free"
                        : `₹${Number(order.deliveryFee).toLocaleString(
                            "en-IN",
                          )}`
                    }
                  />

                  <div className="border-t border-[#E8ECEA] pt-3">
                    <SummaryRow
                      label="Total"
                      value={`₹${Number(order.total || 0).toLocaleString(
                        "en-IN",
                      )}`}
                      strong
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* CANCELLATION */}

            {order.status === "Cancelled" && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-bold text-red-800">
                  Order Cancelled
                </p>

                {order.cancellationReason && (
                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {order.cancellationReason}
                  </p>
                )}

                {order.cancelledBy && (
                  <p className="mt-2 text-xs text-red-600">
                    Cancelled by: {order.cancelledBy}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="shrink-0 border-t border-[#DDE4E2] bg-white px-4 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#022B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#033E50]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

//-->>>> STATUS TIMELINE

function OrderStatusTimeline({ status }) {
  const steps = [
    {
      key: "Pending",
      label: "Placed",
      icon: <ReceiptText size={15} />,
    },
    {
      key: "Accepted",
      label: "Accepted",
      icon: <Check size={15} />,
    },
    {
      key: "Preparing",
      label: "Preparing",
      icon: <ChefHat size={15} />,
    },
    {
      key: "Ready",
      label: "Ready",
      icon: <Package size={15} />,
    },
    {
      key: "Delivered",
      label: "Delivered",
      icon: <Truck size={15} />,
    },
  ];

  if (status === "Cancelled") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <X size={19} />
          </div>

          <div>
            <p className="font-bold text-red-800">Order Cancelled</p>

            <p className="mt-0.5 text-xs text-red-600">
              This order is no longer active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusOrder = [
    "Pending",
    "Accepted",
    "Preparing",
    "Ready",
    "Delivered",
  ];

  const currentIndex = statusOrder.indexOf(status);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E0E5E3] bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="font-bold text-[#022B3A]">Order Status</h3>

        <p className="mt-1 text-xs text-[#94A3B8]">Track your order progress</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-[570px] px-2">
          <div className="absolute left-[42px] right-[42px] top-5 h-px bg-[#E1E7E4]" />

          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, index) => {
              const completed = index <= currentIndex;

              return (
                <div
                  key={step.key}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      completed
                        ? "border-[#FF8C00] bg-[#FF8C00] text-white"
                        : "border-[#DDE4E2] bg-white text-[#94A3B8]"
                    }`}
                  >
                    {completed ? (
                      index < currentIndex ? (
                        <Check size={16} />
                      ) : (
                        step.icon
                      )
                    ) : (
                      step.icon
                    )}
                  </div>

                  <p
                    className={`mt-2 text-[9px] font-bold uppercase tracking-wide ${
                      completed ? "text-[#022B3A]" : "text-[#94A3B8]"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

//-->>> SUMMARY ROW

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong ? "text-sm font-bold text-[#022B3A]" : "text-sm text-[#64748B]"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-base font-bold text-[#022B3A]"
            : "text-right text-sm font-semibold text-[#022B3A]"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default Orders;
