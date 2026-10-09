import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle } from "lucide-react";
import { useAdminAuth } from "../../../shared/context/AdminAuthContext";
import logo from "../../../assets/logo.png";

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: "admin@gmail.com",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleQuickFill = () => {
    setFormData({
      email: "admin@gmail.com",
      password: "123123",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (email.trim().toLowerCase() !== "admin@gmail.com") {
      setError("Access denied. Only the authorized Super Admin (admin@gmail.com) can log in here.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.success) {
        const destination = location.state?.from?.pathname || "/admin";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(
        err?.message ||
          "Super Admin authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090D16] p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-[20%] right-10 w-[500px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Return to site button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Public Marketplace
          </Link>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          {/* Top header accent banner */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          <div className="p-6 sm:p-8">
            {/* Header info */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <ShieldCheck className="h-7 w-7 text-amber-400" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                <KeyRound className="h-3 w-3" />
                Root Authority
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                Super Admin Portal
              </h1>
              <p className="mt-1.5 text-xs text-slate-400">
                Restricted access. Only the designated Super Admin may proceed.
              </p>
            </div>

            {/* Quick Demo Credentials Helper */}
            <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300 flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-amber-200">Required Admin Credentials:</div>
                <div className="text-slate-300 font-mono mt-0.5">
                  admin@gmail.com <span className="text-slate-500">•</span> 123123
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="shrink-0 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1.5 font-medium text-amber-200 transition-colors cursor-pointer"
              >
                Auto Fill
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Super Admin Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@gmail.com"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Authenticating Super Admin...
                  </span>
                ) : (
                  "Access Super Admin Dashboard"
                )}
              </button>
            </form>
          </div>

          {/* Footer security tag */}
          <div className="border-t border-slate-800/80 bg-slate-950/40 p-4 text-center">
            <p className="text-[11px] text-slate-500">
              Session secured with 256-bit encryption • Exclusive to 1 designated Super Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
