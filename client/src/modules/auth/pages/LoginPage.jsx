import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Store, LoaderCircle } from "lucide-react";

import { useAuth } from "../../../shared/context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  /* HANDLE LOGIN */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const result = await login({
        email,
        password,
      });

      /*
       * Login successful.
       *
       * AuthContext has already stored:
       * - user
       * - token
       *
       * Now redirect customer to home.
       */

      if (result?.success) {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setError(
        error?.message ||
          "Unable to login. Please check your credentials and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F4E9] px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[90vh] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          {/* LEFT SIDE */}

          <div className="hidden bg-[#022B3A] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              {/* Logo */}

              <Link
                to="/"
                className="inline-flex items-center gap-3"
                aria-label="ShopLocal Home"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8C00]">
                  <Store size={25} />
                </div>

                <p className="text-2xl font-bold leading-none">
                  <span className="text-[#FF8C00]">Shop</span>
                  <span className="text-white">Local</span>
                </p>
              </Link>

              {/* Hero Text */}

              <div className="mt-20 max-w-md">
                <h1 className="text-4xl font-bold leading-tight">
                  Discover your local world.
                </h1>

                <p className="mt-5 text-lg leading-8 text-white/70">
                  Find nearby shops, explore products, and support local
                  businesses.
                </p>
              </div>
            </div>

            <p className="text-sm text-white/50">Shop smart. Buy local.</p>
          </div>

          {/* RIGHT SIDE */}

          <div className="p-6 sm:p-10 lg:p-12">
            {/* Mobile Logo */}

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
              {/* Heading */}

              <h2 className="text-3xl font-bold text-[#022B3A]">
                Welcome back
              </h2>

              <p className="mt-2 text-gray-500">
                Login to continue to ShopLocal.
              </p>

              {/*----->>> ERROR MESSAGE */}

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              {/*--->> LOGIN FORM */}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Email */}

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
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-gray-800 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-[#022B3A]"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
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
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-12 text-gray-800 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isSubmitting}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#FF8C00] disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8C00] py-3.5 font-semibold text-white transition hover:bg-[#e67d00] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />

                      <span>Logging in...</span>
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              {/* Signup */}

              <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?
                <Link
                  to="/signup"
                  className="font-semibold text-[#FF8C00] hover:underline"
                >
                  Create an account
                </Link>
              </p>

              {/* Shop Owner */}

              <div className="mt-8 border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-500">Are you a shop owner?</p>

                <Link
                  to="/seller/login"
                  className="mt-1 inline-block text-sm font-semibold text-[#022B3A] hover:text-[#FF8C00]"
                >
                  Login to your shop account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
