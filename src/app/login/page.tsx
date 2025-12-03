"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loader from "@/components/Loader";
import { useAlert } from "@/contexts/AlertContext";
import { Eye, EyeOff } from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuthStore();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    const subtitles = [
      "You've got this — let's go!",
      "Every login is a fresh start.",
      "Make today count!",
      "Progress begins here.",
      "Keep pushing forward.",
    ];
    setSubtitle(subtitles[Math.floor(Math.random() * subtitles.length)]);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/home");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.detail || "Login failed.");
        return;
      }

      if (!result.user || !result.user.is_approved) {
        setError(
          result.user
            ? "Your account is pending approval."
            : "No user data returned."
        );
        return;
      }

      const userRole =
        result.user.role ||
        result.user.approved_acc_role ||
        result.user.acc_role ||
        "";

      const userData = {
        userId: result.user.id?.toString() || "",
        email: result.user.email || email,
        role: userRole,
        accountRequestId: result.user.id,
      };

      // Store additional user data in localStorage for navbar
      const fullUserData = {
        email: result.user.email || email,
        first_name: result.user.first_name || "",
        last_name: result.user.last_name || "",
        acc_role: userRole,
      };
      localStorage.setItem("userData", JSON.stringify(fullUserData));

      login(result.access_token, userData);
      setError("");
      showAlert({
        type: "success",
        message: "You have logged in successfully!",
      });
      setTimeout(() => router.push("/home"), 1500);
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  if (authLoading) return <Loader />;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(to left, #facc76ff, #FDF1AD)" }}
    >
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
              Welcome back! 👋
            </h2>
            Login to <span className="text-orange-500">CRMS</span>
            <p className="text-xs font-normal sm:text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="px-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 ml-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-depth"
              />
            </div>

            <div className="px-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 ml-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  // We add pr-12 here specifically for the icon space
                  className="input-depth pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 pt-1 text-gray-400 hover:text-orange-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center px-2 bg-red-50 py-1 rounded border border-red-100 mt-2">
                {error}
              </p>
            )}

            <div className="px-2 pt-2">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5 text-white font-semibold py-2.5 px-3 rounded-lg shadow-md transition-all duration-200 text-sm"
              >
                Sign In
              </button>
            </div>
          </form>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-orange-500 font-semibold hover:underline decoration-2 underline-offset-4"
            >
              Register
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
