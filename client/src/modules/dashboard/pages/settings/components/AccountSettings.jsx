import { useEffect, useState } from "react";
import { User, KeyRound, LogOut, ChevronRight, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../../shared/context/AuthContext";
import { sellerAuthAPI } from "../../../../../services/api";
import LogoutModal from "../../../components/LogoutModal";

function AccountSettings() {
  const navigate = useNavigate();
  const { logoutSeller } = useAuth();

  //--->>> PROFILE STATE

  const [profileData, setProfileData] = useState({
    ownerName: "",
    email: "",
    phone: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  //--->>> PASSWORD STATE

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  //--->>> LOGOUT STATE

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  //--->>> LOAD SELLER PROFILE

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await sellerAuthAPI.me();

        const seller = response.data?.seller;

        if (seller) {
          setProfileData({
            ownerName: seller.ownerName || "",
            email: seller.email || "",
            phone: seller.phone || "",
          });
        }
      } catch (err) {
        console.error("Load seller profile error:", err);

        setProfileMessage(
          err.response?.data?.message || "Unable to load account details.",
        );

        setProfileMessageType("error");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  //--->>> PROFILE INPUT CHANGE

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileMessageType("");
  };

  //---->>>> UPDATE PROFILE

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!profileData.ownerName.trim()) {
      setProfileMessage("Seller name cannot be empty.");
      setProfileMessageType("error");
      return;
    }

    if (!profileData.email.trim()) {
      setProfileMessage("Email cannot be empty.");
      setProfileMessageType("error");
      return;
    }

    if (!profileData.phone.trim()) {
      setProfileMessage("Phone number cannot be empty.");
      setProfileMessageType("error");
      return;
    }

    setProfileSaving(true);
    setProfileMessage("");
    setProfileMessageType("");

    try {
      const response = await sellerAuthAPI.updateProfile({
        ownerName: profileData.ownerName.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
      });

      const seller = response.data?.seller;

      if (seller) {
        setProfileData({
          ownerName: seller.ownerName || "",
          email: seller.email || "",
          phone: seller.phone || "",
        });
      }

      setProfileMessage(
        response.data?.message || "Account details updated successfully.",
      );

      setProfileMessageType("success");

      //--->>> Flash message disappears after 2.5 seconds
      setTimeout(() => {
        setProfileMessage("");
        setProfileMessageType("");
      }, 2500);
    } catch (err) {
      console.error("Update seller profile error:", err);

      setProfileMessage(
        err.response?.data?.message || "Unable to update account details.",
      );

      setProfileMessageType("error");
    } finally {
      setProfileSaving(false);
    }
  };

  //--->>> PASSWORD INPUT CHANGE

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  //--->> PASSWORD CHANGE

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage("Please fill all password fields.");
      setMessageType("error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      const response = await sellerAuthAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setMessage(response.data?.message || "Password changed successfully.");

      setMessageType("success");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      //--->>>> Flash message disappears after 2.5 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2500);
    } catch (err) {
      console.error("Change password error:", err);

      setMessage(err.response?.data?.message || "Unable to change password.");

      setMessageType("error");
    }
  };

  //--->> OPEN LOGOUT MODAL

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  //--->>> CONFIRM LOGOUT

  const confirmLogout = async () => {
    try {
      await logoutSeller();

      setShowLogoutModal(false);

      navigate("/seller/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Seller logout failed:", error);

      setShowLogoutModal(false);

      navigate("/seller/login", {
        replace: true,
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* ACCOUNT DETAILS */}

        <div className="rounded-xl border border-[#DDE4E2] bg-[#F8F4E9]">
          <form onSubmit={handleProfileSubmit} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
                <User size={19} />
              </div>

              <div>
                <p className="font-semibold text-[#022B3A]">Account Details</p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Update your seller name, email and phone number.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* SELLER NAME */}

              <div>
                <label
                  htmlFor="ownerName"
                  className="mb-2 block text-sm font-semibold text-[#022B3A]"
                >
                  Seller Name
                </label>

                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  value={profileData.ownerName}
                  onChange={handleProfileChange}
                  disabled={profileLoading || profileSaving}
                  className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20 disabled:cursor-not-allowed disabled:bg-[#F1F5F9]"
                  placeholder="Enter seller name"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="profileEmail"
                  className="mb-2 block text-sm font-semibold text-[#022B3A]"
                >
                  Email
                </label>

                <input
                  id="profileEmail"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={profileLoading || profileSaving}
                  className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20 disabled:cursor-not-allowed disabled:bg-[#F1F5F9]"
                  placeholder="Enter email address"
                />
              </div>

              {/* PHONE */}

              <div>
                <label
                  htmlFor="profilePhone"
                  className="mb-2 block text-sm font-semibold text-[#022B3A]"
                >
                  Phone Number
                </label>

                <input
                  id="profilePhone"
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={profileLoading || profileSaving}
                  className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20 disabled:cursor-not-allowed disabled:bg-[#F1F5F9]"
                  placeholder="Enter phone number"
                />
              </div>

              {/* PROFILE FLASH MESSAGE */}

              {profileMessage && (
                <p
                  className={`text-sm font-semibold ${
                    profileMessageType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {profileMessageType === "success" ? "✓ " : ""}
                  {profileMessage}
                </p>
              )}

              {/* SAVE BUTTON */}

              <div className="flex justify-end border-t border-[#DDE4E2] pt-5">
                <button
                  type="submit"
                  disabled={profileLoading || profileSaving}
                  className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-5 text-sm font-semibold text-white transition hover:bg-[#033B4F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />

                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* CHANGE PASSWORD */}

        <div className="rounded-xl border border-[#DDE4E2] bg-[#F8F4E9]">
          <button
            type="button"
            onClick={() => setShowPasswordForm((previous) => !previous)}
            className="cursor-pointer flex w-full items-center justify-between gap-4 p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
                <KeyRound size={19} />
              </div>

              <div>
                <p className="font-semibold text-[#022B3A]">Change Password</p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Update your account password.
                </p>
              </div>
            </div>

            <ChevronRight
              size={19}
              className={`text-[#64748B] transition-transform ${
                showPasswordForm ? "rotate-90" : ""
              }`}
            />
          </button>

          {/* PASSWORD FORM */}

          {showPasswordForm && (
            <form
              onSubmit={handlePasswordSubmit}
              className="border-t border-[#DDE4E2] p-4"
            >
              <div className="space-y-4">
                {/* CURRENT PASSWORD */}

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                  />
                </div>

                {/* NEW PASSWORD */}

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                  />
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm text-[#022B3A] outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
                  />
                </div>

                {/* PASSWORD FLASH MESSAGE */}

                {message && (
                  <p
                    className={`text-sm font-semibold ${
                      messageType === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {messageType === "success" ? "✓ " : ""}
                    {message}
                  </p>
                )}

                {/* UPDATE BUTTON */}

                <button
                  type="submit"
                  className="cursor-pointer h-11 rounded-xl bg-[#022B3A] px-5 text-sm font-semibold text-white transition hover:bg-[#033B4F]"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-left transition hover:bg-red-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-red-600">
              <LogOut size={19} />
            </div>

            <div>
              <p className="font-semibold text-red-700">Logout</p>

              <p className="mt-1 text-xs text-red-600/70">
                Sign out of your seller account.
              </p>
            </div>
          </div>

          <ChevronRight size={19} className="text-red-500" />
        </button>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

export default AccountSettings;
