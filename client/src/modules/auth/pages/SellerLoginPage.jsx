import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Store } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";

function SellerLoginPage() {
  const navigate = useNavigate();
  const { loginSeller } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
       * Backend:
       *
       * await authAPI.login({
       *   email,
       *   password,
       * });
       */
      const result = await loginSeller({
        email: email.trim(),
        password,
      });

      if (result?.success) {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F4E9] px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[90vh] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          {/* LEFT */}

          <div className="hidden bg-[#022B3A] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]">
                  <Store size={25} />
                </div>

                <p className="text-2xl font-bold leading-none">
                  <span className="text-[#FF8C00]">Shop</span>
                  <span className="text-white">Local</span>
                </p>
              </Link>

              <div className="mt-20 max-w-md">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Store size={16} />
                  Shop Owner
                </div>

                <h1 className="text-4xl font-bold leading-tight">
                  Grow your local business online.
                </h1>

                <p className="mt-5 text-lg leading-8 text-white/70">
                  Manage your storefront, products, orders, customers, and
                  delivery through ShopLocal.
                </p>
              </div>
            </div>

            <p className="text-sm text-white/50">Grow local. Sell local.</p>
          </div>

          {/* RIGHT */}

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mb-10 flex justify-center lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF8C00] text-white">
                  <Store size={22} />
                </div>

                <p className="text-2xl font-bold leading-none">
                  <span className="text-[#FF8C00]">Shop</span>
                  <span className="text-black">Local</span>
                </p>
              </Link>
            </div>

            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-bold text-[#022B3A]">
                Shop Owner Login
              </h2>

              <p className="mt-2 text-gray-500">
                Manage your ShopLocal business account.
              </p>

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Business Account Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="owner@yourshop.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-gray-800 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-[#022B3A]"
                    >
                      Password
                    </label>

                    <Link
                      to="/seller/forgot-password"
                      className="text-sm font-medium text-[#FF8C00] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-12 text-gray-800 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF8C00]"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full rounded-xl bg-[#FF8C00] py-3.5 font-semibold text-white transition hover:bg-[#e67d00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Login to Shop Owner Account"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don't have a shop owner account?{" "}
                <Link
                  to="/seller/register"
                  className="font-semibold text-[#FF8C00] hover:underline"
                >
                  Register your shop
                </Link>
              </p>

              <div className="mt-6 border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-500">
                  Looking to shop locally?
                </p>

                <Link
                  to="/login"
                  className="mt-1 inline-block text-sm font-semibold text-[#022B3A] hover:text-[#FF8C00]"
                >
                  Customer Login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SellerLoginPage;
