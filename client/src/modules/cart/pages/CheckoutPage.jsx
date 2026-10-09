import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Home,
  Briefcase,
  MapPin,
  MapPinned,
  Phone,
  User,
  Plus,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../shared/context/CartContext";
import { useAuth } from "../../../shared/context/AuthContext";
import { addressAPI, orderAPI } from "../../../services/api";

function CheckoutPage() {
  const navigate = useNavigate();

  const { cartItems, subtotal, discount, total, clearCart } = useCart();

  const { user } = useAuth();

  //--->>> ADDRESS STATE

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [addressLoadError, setAddressLoadError] = useState("");

  /*
   * "saved" = user is using one of the existing saved addresses
   * "new"   = user wants to manually enter a new address
   */
  const [addressMode, setAddressMode] = useState("saved");
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  //--->> FORM STATE

  const [formData, setFormData] = useState({
    fullName: user?.name || user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  //--->>> AUTHENTICATION

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    setFormData((previous) => ({
      ...previous,
      fullName: previous.fullName || user?.name || user?.fullName || "",
      phone: previous.phone || user?.phone || "",
    }));
  }, [user]);

  //--->> LOAD SAVED ADDRESSES

  useEffect(() => {
    if (!user) return;

    loadSavedAddresses();
  }, [user]);

  const loadSavedAddresses = async () => {
    try {
      setIsAddressLoading(true);
      setAddressLoadError("");

      const response = await addressAPI.list();

      const addresses = response?.data?.addresses || [];

      setSavedAddresses(addresses);

      //--->>> NO SAVED ADDRESSES

      if (addresses.length === 0) {
        setAddressMode("new");
        setSelectedAddressId(null);

        return;
      }

      //---->>> SELECT DEFAULT ADDRESS

      const defaultAddress =
        addresses.find((address) => address.isDefault) || addresses[0];

      setSelectedAddressId(defaultAddress._id);
      setAddressMode("saved");

      applySavedAddress(defaultAddress);
    } catch (error) {
      console.error("Load checkout addresses error:", error);

      setAddressLoadError(
        error?.response?.data?.message ||
          "Unable to load your saved addresses.",
      );

      setAddressMode("new");
      setSelectedAddressId(null);
    } finally {
      setIsAddressLoading(false);
    }
  };

  //--->>> APPLY SAVED ADDRESS TO CHECKOUT FORM

  const applySavedAddress = (address) => {
    if (!address) return;

    setFormData((previous) => ({
      ...previous,

      fullName: previous.fullName || user?.name || user?.fullName || "",

      phone: previous.phone || user?.phone || "",

      address: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    }));

    setErrors({});
    setOrderError("");
  };

  const handleSelectSavedAddress = (address) => {
    if (!address?._id) return;

    setAddressMode("saved");
    setSelectedAddressId(address._id);

    applySavedAddress(address);
  };

  //--->>> USE NEW ADDRESS

  const handleUseNewAddress = () => {
    setAddressMode("new");
    setSelectedAddressId(null);

    setFormData((previous) => ({
      ...previous,
      fullName: previous.fullName || user?.name || user?.fullName || "",
      phone: previous.phone || user?.phone || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    }));

    setErrors({});
    setOrderError("");
  };

  //--->>> EMPTY CART

  if (!user) {
    return null;
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#F8F4E9] px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0D9]">
            <MapPin size={34} className="text-[#FF8C00]" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#022B3A]">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-500">
            Add some products to your cart before proceeding to checkout.
          </p>

          <button
            type="button"
            onClick={() => navigate("/shops")}
            className="cursor-pointer mt-7 rounded-xl bg-[#022B3A] px-6 py-3 font-semibold text-white transition hover:bg-[#033B4F]"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  const uniqueShopIds = [
    ...new Set(cartItems.map((item) => String(item.shopId)).filter(Boolean)),
  ];

  const hasMultipleShops = uniqueShopIds.length > 1;

  //--->>> INPUT HANDLER

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (addressMode === "saved") {
      setAddressMode("new");
      setSelectedAddressId(null);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (orderError) {
      setOrderError("");
    }
  };

  //--->>> VALIDATION

  const validateForm = () => {
    const newErrors = {};

    const fullName = formData.fullName.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const city = formData.city.trim();
    const state = formData.state.trim();
    const pincode = formData.pincode.trim();

    if (!fullName) {
      newErrors.fullName = "Please enter your full name.";
    } else if (fullName.length < 2) {
      newErrors.fullName = "Please enter a valid name.";
    }

    if (!phone) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!address) {
      newErrors.address = "Please enter your delivery address.";
    } else if (address.length < 10) {
      newErrors.address = "Please enter a more complete address.";
    }

    if (!city) {
      newErrors.city = "Please enter your city.";
    }

    if (!state) {
      newErrors.state = "Please enter your state.";
    }

    if (!pincode) {
      newErrors.pincode = "Please enter your pincode.";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Pincode must contain 6 digits.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  //--->>> PLACE ORDER

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setOrderError("");

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (hasMultipleShops) {
      setOrderError(
        "Your cart contains products from different shops. Please place separate orders for each shop.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!cartItems.length) {
      setOrderError("Your cart is empty.");
      return;
    }

    if (isPlacingOrder) {
      return;
    }

    setIsPlacingOrder(true);

    try {
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }));

      //--->>> DELIVERY ADDRESS

      const deliveryAddress = {
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      //---->>> BACKEND REQUEST

      const response = await orderAPI.create({
        items,
        deliveryAddress,
        paymentMethod: "COD",
      });

      const createdOrder = response?.data?.order;

      if (!createdOrder) {
        throw new Error(
          response?.data?.message ||
            "Order was created but no order data was returned.",
        );
      }

      const normalizedOrder = {
        ...createdOrder,

        backendOrderId: createdOrder._id,

        orderId:
          createdOrder.orderNumber || createdOrder.orderId || createdOrder._id,

        customer: {
          fullName:
            createdOrder.deliveryAddress?.name || formData.fullName.trim(),

          phone: createdOrder.deliveryAddress?.phone || formData.phone.trim(),

          address:
            createdOrder.deliveryAddress?.addressLine ||
            formData.address.trim(),

          city: createdOrder.deliveryAddress?.city || formData.city.trim(),

          state: createdOrder.deliveryAddress?.state || formData.state.trim(),

          pincode:
            createdOrder.deliveryAddress?.pincode || formData.pincode.trim(),
        },

        paymentMethod: createdOrder.paymentMethod || "COD",

        paymentStatus: createdOrder.paymentStatus || "Pending",

        orderStatus: createdOrder.status || "Pending",

        createdAt: createdOrder.createdAt || new Date().toISOString(),

        items: (createdOrder.items || []).map((item) => ({
          id: item._id || item.product,

          productId: item.product,

          quantity: item.quantity,

          itemTotal: item.subtotal,

          product: {
            id: item.product,
            name: item.name,
            image: item.image || "",
          },

          shop: {
            name: cartItems[0]?.shop?.name || "",
          },

          unitPrice: item.price,
        })),

        subtotal: Number(createdOrder.subtotal) || 0,

        discount: Number(createdOrder.discount) || 0,

        deliveryFee: Number(createdOrder.deliveryFee) || 0,

        total: Number(createdOrder.total) || 0,
      };

      //----->>>> SAVE ONLY THE SUCCESS SNAPSHOT

      localStorage.setItem(
        "shoplocal_latest_order",
        JSON.stringify(normalizedOrder),
      );

      //--->>> SAVE ORDER ID

      localStorage.setItem(
        "shoplocal_latest_order_id",
        String(createdOrder._id),
      );

      //--->>> CLEAR CART ONLY AFTER SUCCESS

      clearCart();

      //--->>> GO TO SUCCESS PAGE

      navigate("/order-success", {
        replace: true,
      });
    } catch (error) {
      console.error("Unable to place order:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while placing your order.";

      setOrderError(message);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const formatPrice = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const getAddressIcon = (label) => {
    const normalized = String(label || "").toLowerCase();

    if (normalized === "home") {
      return <Home size={19} />;
    }

    if (normalized === "work" || normalized === "office") {
      return <Briefcase size={19} />;
    }

    return <MapPinned size={19} />;
  };

  return (
    <main className="min-h-screen bg-[#F8F4E9]">
      {/* PAGE HEADER */}

      <div className="border-b border-[#DDE4E2] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="cursor-pointer mb-4 flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#022B3A]"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
              Checkout
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              Complete your delivery details and review your order.
            </p>
          </div>
        </div>
      </div>

      {/* CHECKOUT CONTENT */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handlePlaceOrder}>
          {/* ERROR MESSAGE */}

          {orderError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">{orderError}</p>
            </div>
          )}

          {hasMultipleShops && (
            <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-semibold text-[#022B3A]">
                Your cart contains products from multiple shops.
              </p>

              <p className="mt-1 text-sm text-[#64748B]">
                Orders currently support one shop at a time. Please edit your
                cart and place separate orders for each shop.
              </p>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* LEFT SIDE */}

            <div className="space-y-6">
              {/* DELIVERY INFORMATION */}

              <section className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#022B3A]">
                      Delivery Information
                    </h2>

                    <p className="mt-1 text-sm text-[#64748B]">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                {/* SAVED ADDRESSES */}

                <div className="mb-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#022B3A]">
                        Choose a delivery address
                      </h3>

                      <p className="mt-1 text-xs text-[#64748B]">
                        Select one of your saved addresses or enter a new one.
                      </p>
                    </div>

                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="cursor-pointer text-xs font-semibold text-[#FF8C00] transition hover:text-[#E67E00]"
                      >
                        Manage Addresses
                      </button>
                    )}
                  </div>

                  {isAddressLoading ? (
                    <div className="flex items-center justify-center rounded-xl border border-[#DDE4E2] bg-[#FBFCFB] px-4 py-8">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#64748B]">
                        <Loader2
                          size={18}
                          className="animate-spin text-[#FF8C00]"
                        />
                        Loading saved addresses...
                      </div>
                    </div>
                  ) : savedAddresses.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {savedAddresses.map((address) => {
                        const isSelected =
                          addressMode === "saved" &&
                          selectedAddressId === address._id;

                        return (
                          <button
                            key={address._id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(address)}
                            className={`cursor-pointer relative w-full rounded-xl border-2 p-4 text-left transition ${
                              isSelected
                                ? "border-[#FF8C00] bg-[#FFFDFC] shadow-[0_5px_20px_rgba(255,140,0,0.08)]"
                                : "border-[#DDE4E2] bg-white hover:border-[#FF8C00]/50 hover:bg-[#FFFDFC]"
                            }`}
                          >
                            {/* SELECTED INDICATOR */}

                            <div
                              className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                isSelected
                                  ? "border-[#FF8C00] bg-[#FF8C00] text-white"
                                  : "border-[#CBD5D1] bg-white"
                              }`}
                            >
                              {isSelected && <Check size={12} />}
                            </div>

                            {/* ADDRESS HEADER */}

                            <div className="flex items-start gap-3 pr-7">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  isSelected
                                    ? "bg-[#FFF0D9] text-[#FF8C00]"
                                    : "bg-[#F1F4F2] text-[#64748B]"
                                }`}
                              >
                                {getAddressIcon(address.label)}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-[#022B3A]">
                                    {address.label || "Address"}
                                  </h4>

                                  {address.isDefault && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0D9] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#FF8C00]">
                                      <Check size={9} />
                                      Default
                                    </span>
                                  )}
                                </div>

                                <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                                  Saved delivery address
                                </p>
                              </div>
                            </div>

                            {/* ADDRESS */}

                            <div className="mt-4 rounded-lg bg-[#F8F4E9] p-3">
                              <p className="break-words text-xs font-medium leading-5 text-[#334155]">
                                {address.addressLine || "No address line"}
                              </p>

                              {(address.city ||
                                address.state ||
                                address.pincode) && (
                                <p className="mt-1 break-words text-xs leading-5 text-[#64748B]">
                                  {[
                                    address.city,
                                    address.state,
                                    address.pincode,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {/* NEW ADDRESS OPTION */}

                      <button
                        type="button"
                        onClick={handleUseNewAddress}
                        className={`cursor-pointer relative flex min-h-[170px] w-full items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
                          addressMode === "new"
                            ? "border-[#FF8C00] bg-[#FFFDFC]"
                            : "border-[#CBD7D3] bg-[#FBFCFB] hover:border-[#FF8C00]/60 hover:bg-white"
                        }`}
                      >
                        <div>
                          <div
                            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                              addressMode === "new"
                                ? "bg-[#FFF0D9] text-[#FF8C00]"
                                : "bg-white text-[#64748B]"
                            }`}
                          >
                            <Plus size={21} />
                          </div>

                          <h4 className="mt-3 text-sm font-bold text-[#022B3A]">
                            Use a new address
                          </h4>

                          <p className="mt-1 text-xs text-[#64748B]">
                            Enter a different delivery address
                          </p>

                          {addressMode === "new" && (
                            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#FFF0D9] px-2.5 py-1 text-[10px] font-bold text-[#FF8C00]">
                              <Check size={11} />
                              Selected
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  ) : (
                    /* NO SAVED ADDRESSES */

                    <div className="rounded-xl border border-dashed border-[#CBD7D3] bg-[#FBFCFB] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                          <MapPin size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#022B3A]">
                            No saved addresses
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#64748B]">
                            Enter your delivery address below. You can save
                            addresses from your profile for faster checkout next
                            time.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {addressLoadError && (
                    <p className="mt-2 text-xs font-medium text-[#B45309]">
                      {addressLoadError}
                    </p>
                  )}
                </div>

                {/* SELECTED SAVED ADDRESS NOTICE */}

                {addressMode === "saved" && selectedAddressId && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3.5">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        Saved address selected
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-green-700/80">
                        Your order will be delivered to the selected address
                        below.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* NAME */}

                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold text-[#022B3A]"
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />

                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`h-12 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-[#022B3A] outline-none transition ${
                          errors.fullName
                            ? "border-red-400 focus:ring-2 focus:ring-red-100"
                            : "border-[#DDE4E2] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                        }`}
                      />
                    </div>

                    {errors.fullName && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* PHONE */}

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-[#022B3A]"
                    >
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(event) => {
                          const value = event.target.value.replace(/\D/g, "");

                          if (addressMode === "saved") {
                            setAddressMode("new");
                            setSelectedAddressId(null);
                          }

                          setFormData((previous) => ({
                            ...previous,
                            phone: value,
                          }));

                          if (errors.phone) {
                            setErrors((previous) => ({
                              ...previous,
                              phone: "",
                            }));
                          }

                          if (orderError) {
                            setOrderError("");
                          }
                        }}
                        placeholder="10-digit mobile number"
                        className={`h-12 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-[#022B3A] outline-none transition ${
                          errors.phone
                            ? "border-red-400 focus:ring-2 focus:ring-red-100"
                            : "border-[#DDE4E2] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                        }`}
                      />
                    </div>

                    {errors.phone && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* ADDRESS */}

                <div className="mt-5">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Delivery Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Flat No., Street, Area, Landmark..."
                    className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-[#022B3A] outline-none transition ${
                      errors.address
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-[#DDE4E2] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                    }`}
                  />

                  {errors.address && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.address}
                    </p>
                  )}

                  {addressMode === "saved" && selectedAddressId && (
                    <p className="mt-1.5 text-xs text-[#94A3B8]">
                      This address is from your saved addresses. Editing it here
                      will switch checkout to a new address.
                    </p>
                  )}
                </div>

                {/* CITY / STATE / PINCODE */}

                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  {/* CITY */}

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-semibold text-[#022B3A]"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Nagpur"
                      className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#022B3A] outline-none transition ${
                        errors.city
                          ? "border-red-400 focus:ring-2 focus:ring-red-100"
                          : "border-[#DDE4E2] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                      }`}
                    />

                    {errors.city && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* STATE */}

                  <div>
                    <label
                      htmlFor="state"
                      className="mb-2 block text-sm font-semibold text-[#022B3A]"
                    >
                      State
                    </label>

                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#022B3A] outline-none transition ${
                        errors.state
                          ? "border-red-400 focus:ring-2 focus:ring-red-100"
                          : "border-[#DDE4E2] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                      }`}
                    />

                    {errors.state && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* PINCODE */}

                  <div>
                    <label
                      htmlFor="pincode"
                      className="mb-2 block text-sm font-semibold text-[#022B3A]"
                    >
                      Pincode
                    </label>

                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "");

                        if (addressMode === "saved") {
                          setAddressMode("new");
                          setSelectedAddressId(null);
                        }

                        setFormData((previous) => ({
                          ...previous,
                          pincode: value,
                        }));

                        if (errors.pincode) {
                          setErrors((previous) => ({
                            ...previous,
                            pincode: "",
                          }));
                        }

                        if (orderError) {
                          setOrderError("");
                        }
                      }}
                      placeholder="440022"
                      className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#022B3A] outline-none transition ${
                        errors.pincode
                          ? "border-red-400 focus:ring-2 focus:ring-red-100"
                          : "border-[#DDE4E2] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                      }`}
                    />

                    {errors.pincode && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                {/* NEW ADDRESS INFO */}

                {addressMode === "new" && savedAddresses.length > 0 && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#DDE4E2] bg-[#FBFCFB] p-4">
                    <Plus
                      size={18}
                      className="mt-0.5 shrink-0 text-[#FF8C00]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#022B3A]">
                        New delivery address
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#64748B]">
                        Enter the address where you want this order delivered.
                        Your saved addresses will remain unchanged.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* PAYMENT METHOD */}

              <section className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#022B3A]">
                    Payment Method
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Currently available payment option.
                  </p>
                </div>

                <div className="rounded-xl border-2 border-[#FF8C00] bg-[#FFF0D9] p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#FF8C00]">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FF8C00]" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-[#022B3A]">
                          Cash on Delivery
                        </h3>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#FF8C00]">
                          COD
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Pay in cash when your order is delivered to your
                        address.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ORDER ITEMS */}

              <section className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#022B3A]">
                      Your Items
                    </h2>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {cartItems.length}{" "}
                      {cartItems.length === 1 ? "product" : "products"} in your
                      order
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="cursor-pointer text-sm font-semibold text-[#FF8C00] transition hover:text-[#E67E00]"
                  >
                    Edit Cart
                  </button>
                </div>

                <div className="divide-y divide-[#DDE4E2]">
                  {cartItems.map((item) => {
                    const price = Number(item.product?.price) || 0;

                    const itemDiscount = Number(item.product?.discount) || 0;

                    const finalPrice =
                      itemDiscount > 0
                        ? Math.round(price - (price * itemDiscount) / 100)
                        : price;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 font-semibold text-[#022B3A]">
                            {item.product?.name || "Product"}
                          </h3>

                          {item.shop?.name && (
                            <p className="mt-1 text-xs text-[#64748B]">
                              {item.shop.name}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-semibold text-[#022B3A]">
                              {formatPrice(finalPrice)}
                            </span>

                            <span className="text-[#64748B]">
                              × {item.quantity}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-bold text-[#022B3A]">
                            {formatPrice(finalPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* RIGHT SIDE */}

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold text-[#022B3A]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Subtotal</span>

                    <span className="font-semibold text-[#022B3A]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Discount</span>

                    <span className="font-semibold text-green-600">
                      - {formatPrice(discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Delivery</span>

                    <span className="font-semibold text-green-600">FREE</span>
                  </div>

                  <div className="border-t border-[#DDE4E2] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#022B3A]">
                        Total
                      </span>

                      <span className="text-2xl font-bold text-[#022B3A]">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 rounded-xl bg-[#FFF0D9] p-4">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#FF8C00]"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#022B3A]">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      You will pay {formatPrice(total)} in cash when your order
                      arrives.
                    </p>
                  </div>
                </div>

                {/* PLACE ORDER */}

                <button
                  type="submit"
                  disabled={isPlacingOrder || hasMultipleShops}
                  className="cursor-pointer mt-6 flex w-full items-center justify-center rounded-xl bg-[#FF8C00] px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#E67E00] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPlacingOrder
                    ? "Placing Order..."
                    : `Place Order · ${formatPrice(total)}`}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-[#64748B]">
                  By placing this order, you confirm that the delivery
                  information provided above is correct.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CheckoutPage;
