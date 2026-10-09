import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Store, User } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
       * Backend connection:
       *
       * await authAPI.register({
       *   name,
       *   email,
       *   password,
       * });
       */
      const result = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result?.success) {
        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to create account.");
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
                  <User size={16} />
                  Customer Account
                </div>

                <h1 className="text-4xl font-bold leading-tight">
                  Be part of your local community.
                </h1>

                <p className="mt-5 text-lg leading-8 text-white/70">
                  Discover neighbourhood shops, explore local products, and
                  connect with businesses around you.
                </p>
              </div>
            </div>

            <p className="text-sm text-white/50">Shop smart. Buy local.</p>
          </div>

          {/* RIGHT */}

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 flex justify-center lg:hidden">
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
                Create your account
              </h2>

              <p className="mt-2 text-gray-500">
                Join ShopLocal and discover businesses near you.
              </p>

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                {/* NAME */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Email Address
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
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Password
                  </label>

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
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-12 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
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

                {/* CONFIRM PASSWORD */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#022B3A]"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-12 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF8C00]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full rounded-xl bg-[#FF8C00] py-3.5 font-semibold text-white transition hover:bg-[#e67d00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Customer Account"}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#FF8C00] hover:underline"
                >
                  Login
                </Link>
              </p>

              <div className="mt-6 border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-500">
                  Want to sell on ShopLocal?
                </p>

                <Link
                  to="/seller/register"
                  className="mt-1 inline-block text-sm font-semibold text-[#022B3A] hover:text-[#FF8C00]"
                >
                  Register your shop →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignupPage;
