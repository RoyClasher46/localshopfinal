import { useEffect, useState } from "react";
import { Mail, Phone, Send, Star, User, X } from "lucide-react";
import { sellerReviewAPI } from "../../../../../services/api";

import ReviewRatingBadge from "./ReviewRatingBadge";

function ReviewDetailsModal({ review, onClose, onReplySuccess }) {
  const [replyText, setReplyText] = useState(review?.sellerReply?.text || "");

  const [localReview, setLocalReview] = useState(review);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    setLocalReview(review);

    setReplyText(review?.sellerReply?.text || "");

    setReplyError("");
  }, [review]);

  if (!localReview) return null;

  const currentReview = localReview;

  const formattedDate = new Date(currentReview.createdAt).toLocaleString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );

  //--->>> REVIEW TYPE

  const isShopReview = currentReview.targetType?.toLowerCase() === "shop";

  //--->>> SHOP NAME

  const shopName = isShopReview ? currentReview.shopName || "Shop" : null;

  //---->>> PRODUCT NAME

  const productName = !isShopReview
    ? currentReview.productName || "Product"
    : null;

  //--->>> CUSTOMER

  const customerName =
    currentReview.customerName || currentReview.user?.name || "Customer";

  const customerEmail =
    currentReview.customerEmail || currentReview.user?.email || "";

  const customerPhone =
    currentReview.customerPhone || currentReview.user?.phone || "";

  //--->>> SELLER REPLY

  const sellerReplyText = currentReview.sellerReply?.text?.trim() || "";

  const sellerReplyDate = currentReview.sellerReply?.repliedAt
    ? new Date(currentReview.sellerReply.repliedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const sellerName =
    currentReview.sellerReply?.repliedBy?.ownerName || "Seller";

  const hasExistingReply = Boolean(sellerReplyText);

  //--->>> HANDLE REPLY

  const handleReply = async () => {
    const trimmedReply = replyText.trim();

    if (!trimmedReply) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    const reviewId = currentReview._id || currentReview.id;

    if (!reviewId) {
      setReplyError("Review ID is missing.");
      return;
    }

    setReplyError("");
    setIsSubmitting(true);

    try {
      const response = await sellerReviewAPI.reply(reviewId, trimmedReply);

      const updatedReview = response?.data?.review;

      if (!updatedReview) {
        throw new Error("Updated review was not returned by the server.");
      }

      const mergedReview = {
        ...currentReview,
        ...updatedReview,

        //--->>> Preserve shop information
        shopName: updatedReview.shopName || currentReview.shopName,

        shopImage: updatedReview.shopImage || currentReview.shopImage,

        shopCategory: updatedReview.shopCategory || currentReview.shopCategory,

        //--->>> Preserve product information
        productName: updatedReview.productName || currentReview.productName,

        productId: updatedReview.productId || currentReview.productId,
      };

      //--->>> UPDATE MODAL IMMEDIATELY

      setLocalReview(mergedReview);

      //--->>>> UPDATE TEXTAREA

      setReplyText(mergedReview.sellerReply?.text || trimmedReply);

      //---->>> UPDATE PARENT REVIEW LIST

      if (onReplySuccess) {
        onReplySuccess(mergedReview);
      }
    } catch (error) {
      console.error("Reply to review error:", error);

      setReplyError(
        error.response?.data?.message ||
          error.message ||
          "Unable to submit your reply.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022B3A]/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[#164854] bg-[#022B3A] px-5 py-4 text-white">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">
              Review Details
            </p>

            <h2 className="mt-1 text-lg font-bold">
              {currentReview._id || currentReview.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            aria-label="Close review details"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* RATING */}

          <section className="rounded-xl bg-[#F8F4E9] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
                  {isShopReview ? "Shop Review" : "Product Review"}
                </p>

                <h3 className="mt-1 font-bold text-[#022B3A]">
                  {isShopReview ? shopName : productName}
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#FF8C00]">
                <Star size={22} fill="#FF8C00" />
              </div>
            </div>

            <div className="mt-4">
              <ReviewRatingBadge rating={currentReview.rating} size={19} />
            </div>
          </section>

          {/* CUSTOMER */}

          <section className="mt-5 rounded-xl border border-[#DDE4E2] p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
                <User size={18} />
              </div>

              <h3 className="font-bold text-[#022B3A]">Customer Information</h3>
            </div>

            <div className="mt-4 space-y-3">
              <p className="font-semibold text-[#022B3A]">{customerName}</p>

              {customerPhone && (
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Phone size={15} />
                  <span>{customerPhone}</span>
                </div>
              )}

              {customerEmail && (
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Mail size={15} />
                  <span>{customerEmail}</span>
                </div>
              )}
            </div>
          </section>

          {/* REVIEW */}

          <section className="mt-5 rounded-xl border border-[#DDE4E2] p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#022B3A]">Customer Review</h3>

              <span className="text-xs text-[#64748B]">{formattedDate}</span>
            </div>

            <div className="mt-4 rounded-xl bg-[#FAFBFA] p-4">
              <p className="text-sm leading-6 text-[#475569]">
                "{currentReview.comment}"
              </p>
            </div>
          </section>

          {/* SELLER REPLY */}

          <section className="mt-5 rounded-xl border border-[#DDE4E2] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#022B3A]">Seller Reply</h3>

                <p className="mt-1 text-xs text-[#64748B]">
                  {hasExistingReply
                    ? "Your reply to this customer."
                    : "Reply to this customer review."}
                </p>
              </div>
            </div>

            {/* EXISTING SELLER REPLY */}

            {hasExistingReply && (
              <div className="mt-4 rounded-xl bg-[#F8F4E9] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#022B3A]">
                    {sellerName}
                  </p>

                  {sellerReplyDate && (
                    <span className="text-xs text-[#64748B]">
                      {sellerReplyDate}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-6 text-[#475569]">
                  "{sellerReplyText}"
                </p>
              </div>
            )}

            {/* REPLY INPUT */}

            <div className="mt-4">
              <textarea
                value={replyText}
                onChange={(event) => {
                  setReplyText(event.target.value);

                  if (replyError) {
                    setReplyError("");
                  }
                }}
                placeholder="Write your reply..."
                rows={4}
                disabled={isSubmitting}
                className="w-full resize-none rounded-xl border border-[#DDE4E2] bg-[#FAFBFA] p-4 text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:bg-white"
              />

              {replyError && (
                <p className="mt-2 text-sm text-red-500">{replyError}</p>
              )}

              <button
                type="button"
                onClick={handleReply}
                disabled={isSubmitting || !replyText.trim()}
                className="cursor-pointer mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#022B3A] text-sm font-semibold text-white transition hover:bg-[#033B4F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />

                {isSubmitting
                  ? "Sending..."
                  : hasExistingReply
                    ? "Update Reply"
                    : "Send Reply"}
              </button>
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <div className="border-t border-[#DDE4E2] bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full rounded-xl bg-[#022B3A] px-5 py-3 font-semibold text-white transition hover:bg-[#033B4F]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewDetailsModal;
