import { useEffect, useMemo, useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  Home,
  Briefcase,
  MapPinned,
  X,
  Save,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Map,
  ArrowLeft,
  LockKeyhole,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { userAPI, addressAPI } from "../../services/api";
import { useAuth } from "../../shared/context/AuthContext";

const profileInputClass =
  "block w-full min-h-[46px] rounded-xl border border-[#D7DFDC] bg-white px-4 py-3 text-sm font-medium text-[#022B3A] outline-none placeholder:text-[#94A3B8] shadow-sm transition-all duration-200 focus:border-[#FF8C00] focus:ring-4 focus:ring-[#FF8C00]/10 disabled:cursor-not-allowed disabled:bg-[#F2F4F3] disabled:text-[#64748B]";

const profileTextareaClass =
  "block w-full rounded-xl border border-[#D7DFDC] bg-white px-4 py-3 text-sm font-medium text-[#022B3A] outline-none placeholder:text-[#94A3B8] shadow-sm transition-all duration-200 focus:border-[#FF8C00] focus:ring-4 focus:ring-[#FF8C00]/10 resize-none";

function MyProfile() {
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const emptyPasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [addresses, setAddresses] = useState([]);

  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);

  const [editingAddress, setEditingAddress] = useState(null);

  const [deleteAddressTarget, setDeleteAddressTarget] = useState(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  const emptyAddressForm = {
    label: "Home",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    isDefault: false,
  };

  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      setIsProfileLoading(true);
      setProfileError("");

      const response = await userAPI.me();
      const data = response?.data?.user;

      if (!data) {
        throw new Error("Unable to load profile.");
      }

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (error) {
      console.error("Load profile error:", error);

      if (authUser) {
        setProfile({
          name: authUser.name || authUser.fullName || "",
          email: authUser.email || "",
          phone: authUser.phone || "",
        });
      }

      setProfileError(
        error?.response?.data?.message || "Unable to load your profile.",
      );
    } finally {
      setIsProfileLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setIsAddressLoading(true);
      setAddressError("");

      const response = await addressAPI.list();

      setAddresses(response?.data?.addresses || []);
    } catch (error) {
      console.error("Load addresses error:", error);

      setAddressError(
        error?.response?.data?.message || "Unable to load your addresses.",
      );
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    const name = profile.name.trim();
    const email = profile.email.trim();
    const phone = profile.phone.trim();

    if (!name) {
      setProfileError("Name is required.");
      return;
    }

    if (!email) {
      setProfileError("Email address is required.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    try {
      setIsProfileSaving(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await userAPI.updateProfile({
        name,
        email,
        phone,
      });

      const updatedUser = response?.data?.user;

      if (updatedUser) {
        setProfile({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
        });
      } else {
        setProfile({
          name,
          email,
          phone,
        });
      }

      setIsEditingProfile(false);

      setProfileSuccess(
        response?.data?.message || "Profile updated successfully.",
      );
    } catch (error) {
      console.error("Update profile error:", error);

      setProfileError(
        error?.response?.data?.message || "Unable to update your profile.",
      );
    } finally {
      setIsProfileSaving(false);
    }
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileError("");
  };

  const openPasswordModal = () => {
    setPasswordForm(emptyPasswordForm);
    setPasswordError("");
    setPasswordSuccess("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (isPasswordSaving) return;

    setIsPasswordModalOpen(false);
    setPasswordForm(emptyPasswordForm);
    setPasswordError("");
    setPasswordSuccess("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const currentPassword = passwordForm.currentPassword;
    const newPassword = passwordForm.newPassword;
    const confirmPassword = passwordForm.confirmPassword;

    if (!currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "Your new password must be different from your current password.",
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setIsPasswordSaving(true);
      setPasswordError("");
      setPasswordSuccess("");

      const response = await userAPI.updatePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(
        response?.data?.message || "Password updated successfully.",
      );

      setPasswordForm(emptyPasswordForm);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Update password error:", error);

      setPasswordError(
        error?.response?.data?.message || "Unable to update your password.",
      );
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);

    setAddressForm({
      ...emptyAddressForm,
      isDefault: addresses.length === 0,
    });

    setAddressError("");
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);

    setAddressForm({
      label: address.label || "Home",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      latitude:
        address.latitude !== undefined && address.latitude !== null
          ? String(address.latitude)
          : "",
      longitude:
        address.longitude !== undefined && address.longitude !== null
          ? String(address.longitude)
          : "",
      isDefault: Boolean(address.isDefault),
    });

    setAddressError("");
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    if (isAddressSaving) return;

    setIsAddressModalOpen(false);
    setEditingAddress(null);
    setAddressForm(emptyAddressForm);
    setAddressError("");
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();

    if (!addressForm.addressLine.trim()) {
      setAddressError("Address line is required.");
      return;
    }

    if (!addressForm.city.trim()) {
      setAddressError("City is required.");
      return;
    }

    if (!addressForm.pincode.trim()) {
      setAddressError("Pincode is required.");
      return;
    }

    try {
      setIsAddressSaving(true);
      setAddressError("");

      const payload = {
        label: addressForm.label.trim() || "Home",
        addressLine: addressForm.addressLine.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
        isDefault: addressForm.isDefault,
      };

      if (addressForm.latitude !== "") {
        payload.latitude = Number(addressForm.latitude);
      }

      if (addressForm.longitude !== "") {
        payload.longitude = Number(addressForm.longitude);
      }

      if (editingAddress) {
        await addressAPI.update(editingAddress._id, payload);
      } else {
        await addressAPI.create(payload);
      }

      await loadAddresses();

      closeAddressModal();
    } catch (error) {
      console.error("Save address error:", error);

      setAddressError(
        error?.response?.data?.message || "Unable to save address.",
      );
    } finally {
      setIsAddressSaving(false);
    }
  };

  const requestDeleteAddress = (address) => {
    setDeleteAddressTarget(address);
    setAddressError("");
  };

  const cancelDeleteAddress = () => {
    if (isDeletingAddress) return;

    setDeleteAddressTarget(null);
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressTarget) return;

    try {
      setIsDeletingAddress(true);
      setAddressError("");

      await addressAPI.delete(deleteAddressTarget._id);

      await loadAddresses();

      setDeleteAddressTarget(null);
    } catch (error) {
      console.error("Delete address error:", error);

      setAddressError(
        error?.response?.data?.message || "Unable to delete address.",
      );

      setDeleteAddressTarget(null);
    } finally {
      setIsDeletingAddress(false);
    }
  };

  const handleSetDefault = async (address) => {
    if (address.isDefault) return;

    try {
      setAddressError("");

      await addressAPI.update(address._id, {
        isDefault: true,
      });

      await loadAddresses();
    } catch (error) {
      console.error("Set default address error:", error);

      setAddressError(
        error?.response?.data?.message || "Unable to update default address.",
      );
    }
  };

  const initials = useMemo(() => {
    const name = profile.name || "User";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile.name]);

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

  if (isProfileLoading && isAddressLoading) {
    return (
      <div className="min-h-screen bg-[#F8F4E9]">
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Loader2 size={27} className="animate-spin text-[#FF8C00]" />
            </div>

            <p className="text-sm font-medium text-[#64748B]">
              Loading your account...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F4E9] py-5 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/*  BACK BUTTON */}

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#DDE4E2] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#022B3A] shadow-sm transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* PAGE HEADER */}

        <div className="mb-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF8C00] sm:text-xs">
            My Account
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[#022B3A] sm:text-4xl">
            Profile & Addresses
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            Manage your account details, security and delivery addresses.
          </p>
        </div>

        {/*  PROFILE HERO */}

        <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#022B3A] shadow-[0_15px_45px_rgba(2,43,58,0.12)]">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#FF8C00]/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FF8C00] text-xl font-bold text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <h2 className="max-w-full truncate text-lg font-bold text-white sm:text-2xl">
                    {profile.name || "Welcome"}
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white/90 sm:text-[10px]">
                    <ShieldCheck size={11} />
                    Customer
                  </span>
                </div>

                <p className="max-w-[240px] truncate text-xs text-white/60 sm:max-w-none sm:text-sm">
                  {profile.email || "No email available"}
                </p>

                <p className="mt-1 text-[11px] text-white/40">
                  ShopLocal account
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <AccountStat value={addresses.length} label="Saved addresses" />

              <AccountStat
                value={profile.phone ? "✓" : "—"}
                label="Phone added"
              />
            </div>
          </div>
        </section>

        {profileError && <AlertBox type="error" message={profileError} />}

        {profileSuccess && <AlertBox type="success" message={profileSuccess} />}

        <section className="mb-6 overflow-hidden rounded-3xl border border-[#E0E5E3] bg-white shadow-[0_8px_30px_rgba(2,43,58,0.05)]">
          <SectionHeader
            icon={<UserCircle size={21} />}
            title="Personal Information"
            description="Your basic account information."
            action={
              !isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileError("");
                    setProfileSuccess("");
                    setIsEditingProfile(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D7DFDC] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
                >
                  <Pencil size={15} />
                  <span>Edit</span>
                </button>
              ) : null
            }
          />

          <div className="p-4 sm:p-7">
            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Full Name" icon={<UserCircle size={18} />}>
                    <input
                      id="profile-name"
                      name="name"
                      type="text"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={profileInputClass}
                    />
                  </FormField>

                  <FormField label="Phone Number" icon={<Phone size={18} />}>
                    <input
                      id="profile-phone"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      className={profileInputClass}
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    icon={<Mail size={18} />}
                    full
                  >
                    <input
                      id="profile-email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      className={profileInputClass}
                    />

                    <p className="mt-2 text-xs text-[#94A3B8]">
                      You can update the email address associated with your
                      account.
                    </p>
                  </FormField>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#E8ECEA] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelProfileEdit}
                    disabled={isProfileSaving}
                    className="rounded-xl border border-[#D7DFDC] bg-white px-5 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:bg-[#F8F4E9]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isProfileSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E67E00] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProfileSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <InfoCard
                  icon={<UserCircle size={20} />}
                  label="Full Name"
                  value={profile.name || "Not provided"}
                />

                <InfoCard
                  icon={<Mail size={20} />}
                  label="Email"
                  value={profile.email || "Not provided"}
                />

                <InfoCard
                  icon={<Phone size={20} />}
                  label="Phone"
                  value={profile.phone || "Not provided"}
                />
              </div>
            )}
          </div>
        </section>

        <section className="mb-6 overflow-hidden rounded-3xl border border-[#E0E5E3] bg-white shadow-[0_8px_30px_rgba(2,43,58,0.05)]">
          <SectionHeader
            icon={<LockKeyhole size={21} />}
            title="Security"
            description="Keep your ShopLocal account secure."
          />

          <div className="p-4 sm:p-7">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8E5] bg-[#FBFCFB] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                  <KeyRound size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-[#022B3A]">Password</h3>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Change your account password.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openPasswordModal}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#022B3A] bg-white px-4 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:border-[#FF8C00] hover:text-[#FF8C00] sm:w-auto"
              >
                <LockKeyhole size={15} />
                Change Password
              </button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#E0E5E3] bg-white shadow-[0_8px_30px_rgba(2,43,58,0.05)]">
          <SectionHeader
            icon={<MapPin size={21} />}
            title="Saved Addresses"
            description="Manage your delivery locations."
            action={
              <button
                type="button"
                onClick={openAddAddress}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E67E00]"
              >
                <Plus size={16} />
                <span>Add Address</span>
              </button>
            }
          />

          <div className="p-4 sm:p-7">
            {addressError && <AlertBox type="error" message={addressError} />}

            {isAddressLoading ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <Loader2 size={30} className="animate-spin text-[#FF8C00]" />
              </div>
            ) : addresses.length === 0 ? (
              <EmptyAddresses onAdd={openAddAddress} />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {addresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    onEdit={() => openEditAddress(address)}
                    onDelete={() => requestDeleteAddress(address)}
                    onSetDefault={() => handleSetDefault(address)}
                    getAddressIcon={getAddressIcon}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {isAddressModalOpen && (
        <AddressModal
          editingAddress={editingAddress}
          addressForm={addressForm}
          isSaving={isAddressSaving}
          error={addressError}
          onChange={handleAddressChange}
          onSubmit={handleAddressSubmit}
          onClose={closeAddressModal}
          setLabel={(label) =>
            setAddressForm((previous) => ({
              ...previous,
              label,
            }))
          }
        />
      )}

      {/* PASSWORD MODAL */}

      {isPasswordModalOpen && (
        <PasswordModal
          passwordForm={passwordForm}
          isSaving={isPasswordSaving}
          error={passwordError}
          success={passwordSuccess}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          onChange={handlePasswordChange}
          onSubmit={handlePasswordSubmit}
          onClose={closePasswordModal}
          setShowCurrentPassword={setShowCurrentPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      )}

      {/* DELETE ADDRESS MODAL */}

      {deleteAddressTarget && (
        <DeleteAddressModal
          address={deleteAddressTarget}
          isDeleting={isDeletingAddress}
          onCancel={cancelDeleteAddress}
          onConfirm={handleDeleteAddress}
        />
      )}
    </div>
  );
}

//-->>> ACCOUNT STAT

function AccountStat({ value, label }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:min-w-[115px] sm:px-4">
      <p className="text-lg font-bold text-white">{value}</p>

      <p className="mt-0.5 text-[10px] font-medium text-white/50 sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

//---->>> SECTION HEADER

function SectionHeader({ icon, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#E8ECEA] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="font-bold text-[#022B3A] sm:text-lg">{title}</h2>

          <p className="mt-0.5 text-xs text-[#94A3B8] sm:text-sm">
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

//--->>>> INFO CARD

function InfoCard({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#E2E8E5] bg-[#FBFCFB] p-4">
      <div className="mb-3 flex items-center gap-2 text-[#FF8C00]">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8] sm:text-[11px]">
          {label}
        </span>
      </div>

      <p className="truncate text-sm font-semibold text-[#022B3A]">{value}</p>
    </div>
  );
}

//--->>> FORM FIELD

function FormField({ label, icon, children, full = false }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#022B3A]">
        {icon && <span className="text-[#FF8C00]">{icon}</span>}

        {label}
      </label>

      {children}
    </div>
  );
}

//--->> ALERT

function AlertBox({ type, message }) {
  const success = type === "success";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {success ? (
        <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
      )}

      <span>{message}</span>
    </div>
  );
}

//--->>> EMPTY ADDRESSES

function EmptyAddresses({ onAdd }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#CBD7D3] bg-[#FBFCFB] px-5 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0D9] text-[#FF8C00]">
        <Map size={28} />
      </div>

      <h3 className="font-bold text-[#022B3A]">No saved addresses</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
        Add a delivery address for a faster checkout experience.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF8C00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E67E00]"
      >
        <Plus size={16} />
        Add Your First Address
      </button>
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  getAddressIcon,
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-4 transition sm:p-5 ${
        address.isDefault
          ? "border-[#FF8C00]/50 bg-[#FFFDFC] shadow-[0_8px_25px_rgba(255,140,0,0.08)]"
          : "border-[#E2E8E5] bg-white hover:border-[#CBD7D3] hover:shadow-sm"
      }`}
    >
      {address.isDefault && (
        <div className="absolute left-0 top-0 h-full w-1 bg-[#FF8C00]" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
            {getAddressIcon(address.label)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[#022B3A]">
                {address.label || "Address"}
              </h3>

              {address.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0D9] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#FF8C00]">
                  <Check size={10} />
                  Default
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-[#94A3B8]">Delivery address</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
            aria-label="Edit address"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete address"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-[#F8F4E9] p-4">
        <p className="break-words text-sm font-medium leading-6 text-[#334155]">
          {address.addressLine}
        </p>

        {(address.city || address.state || address.pincode) && (
          <p className="mt-1 break-words text-sm text-[#64748B]">
            {[address.city, address.state, address.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>

      {!address.isDefault && (
        <button
          type="button"
          onClick={onSetDefault}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8C00] transition hover:text-[#E67E00]"
        >
          <Check size={14} />
          Make default
          <ChevronRight size={13} />
        </button>
      )}
    </article>
  );
}

//--->>> PASSWORD MODAL

function PasswordModal({
  passwordForm,
  isSaving,
  error,
  success,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  onChange,
  onSubmit,
  onClose,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
}) {
  const passwordsMatch =
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center bg-[#022B3A]/65 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#F8F4E9] shadow-2xl sm:max-w-lg sm:rounded-3xl">
        {/* HEADER */}

        <div className="shrink-0 bg-[#022B3A] px-5 py-5 text-white sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF8C00]">
                <LockKeyhole size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
                  Account Security
                </p>

                <h2 className="mt-1 text-lg font-bold">Change Password</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close change password"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <form onSubmit={onSubmit} className="overflow-y-auto p-5 sm:p-7">
          {error && <AlertBox type="error" message={error} />}

          {success && <AlertBox type="success" message={success} />}

          <div className="space-y-5">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onChange}
              placeholder="Enter current password"
              autoComplete="current-password"
              showPassword={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((previous) => !previous)}
            />

            <PasswordField
              label="New Password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={onChange}
              placeholder="Enter new password"
              autoComplete="new-password"
              showPassword={showNewPassword}
              onToggle={() => setShowNewPassword((previous) => !previous)}
            />

            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={onChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
              showPassword={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((previous) => !previous)}
              matchState={
                passwordForm.confirmPassword
                  ? passwordsMatch
                    ? "match"
                    : "mismatch"
                  : null
              }
            />
          </div>

          {/* PASSWORD REQUIREMENT */}

          <div className="mt-5 rounded-2xl border border-[#E0E5E3] bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#022B3A]">
                  Password requirement
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Use at least 8 characters and choose a password different from
                  your current one.
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-[#DDE4E2] bg-white px-5 py-3 text-sm font-semibold text-[#022B3A] transition hover:bg-[#F1F3F2]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E67E00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//--->>> PASSWORD FIELD

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  showPassword,
  onToggle,
  matchState,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-[#022B3A]"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
        />

        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${profileInputClass} pr-12 pl-10 ${
            matchState === "match"
              ? "border-green-300 focus:border-green-500 focus:ring-green-100"
              : matchState === "mismatch"
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : ""
          }`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F3F2] hover:text-[#022B3A]"
          aria-label={
            showPassword
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {matchState === "match" && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-green-600">
          <Check size={13} />
          Passwords match
        </p>
      )}

      {matchState === "mismatch" && (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          Passwords do not match
        </p>
      )}
    </div>
  );
}

//-->>> ADDRESS MODAL

function AddressModal({
  editingAddress,
  addressForm,
  isSaving,
  error,
  onChange,
  onSubmit,
  onClose,
  setLabel,
}) {
  return (
    <div className="fixed inset-0 z-[350] flex items-end justify-center bg-[#022B3A]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#F8F4E9] shadow-2xl sm:max-w-2xl sm:rounded-3xl">
        {/* HEADER */}

        <div className="shrink-0 bg-[#022B3A] px-5 py-4 text-white sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF8C00]">
                ShopLocal
              </p>

              <h2 className="mt-1 truncate text-lg font-bold">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close address modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <form onSubmit={onSubmit} className="overflow-y-auto p-5 sm:p-7">
          {error && <AlertBox type="error" message={error} />}

          <div className="space-y-5">
            {/* LABEL */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
                Address Type
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["Home", "Work", "Other"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setLabel(label)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      addressForm.label === label
                        ? "border-[#FF8C00] bg-[#FFF0D9] text-[#FF8C00]"
                        : "border-[#DDE4E2] bg-white text-[#022B3A] hover:border-[#FF8C00]/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ADDRESS */}

            <div>
              <label
                htmlFor="addressLine"
                className="mb-2 block text-sm font-semibold text-[#022B3A]"
              >
                Address
              </label>

              <textarea
                id="addressLine"
                name="addressLine"
                rows={3}
                value={addressForm.addressLine}
                onChange={onChange}
                placeholder="House / Flat / Building / Street"
                className={profileTextareaClass}
              />
            </div>

            {/* CITY / STATE */}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="City">
                <input
                  name="city"
                  value={addressForm.city}
                  onChange={onChange}
                  placeholder="City"
                  className={profileInputClass}
                />
              </FormField>

              <FormField label="State">
                <input
                  name="state"
                  value={addressForm.state}
                  onChange={onChange}
                  placeholder="State"
                  className={profileInputClass}
                />
              </FormField>
            </div>

            {/* PINCODE */}

            <FormField label="Pincode">
              <input
                name="pincode"
                value={addressForm.pincode}
                onChange={onChange}
                placeholder="Pincode"
                inputMode="numeric"
                className={profileInputClass}
              />
            </FormField>

            {/* DEFAULT */}

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#DDE4E2] bg-white p-4">
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={onChange}
                className="mt-1 h-4 w-4 accent-[#FF8C00]"
              />

              <span>
                <span className="block text-sm font-bold text-[#022B3A]">
                  Make this my default address
                </span>

                <span className="mt-1 block text-xs leading-5 text-[#64748B]">
                  Automatically select this address during checkout.
                </span>
              </span>
            </label>
          </div>

          {/* ACTIONS */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#DDE4E2] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-[#DDE4E2] bg-white px-5 py-3 text-sm font-semibold text-[#022B3A] transition hover:bg-[#F1F3F2]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E67E00] disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {editingAddress ? "Update Address" : "Save Address"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//--->>> DELETE ADDRESS MODAL

function DeleteAddressModal({ address, isDeleting, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center bg-[#022B3A]/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#022B3A]">
                Remove address?
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#64748B]">
                Remove your{" "}
                <span className="font-semibold text-[#022B3A]">
                  {address.label || "saved"}
                </span>{" "}
                address from your account?
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E8ECEA] bg-[#FBFCFB] p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-[#DDE4E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:bg-[#F1F3F2]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Remove Address
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
