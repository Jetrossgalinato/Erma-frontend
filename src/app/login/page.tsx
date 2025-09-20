"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("employee");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/home");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (authError) return setError(authError.message);
    const user = authData?.user;
    if (!user) return setError("No user data returned.");
    const { data: roleData, error: roleError } = await supabase
      .from("account_requests")
      .select("is_approved")
      .eq("user_id", user.id)
      .single();
    if (roleError || !roleData) {
      setError(`No ${role} record found for this user.`);
      await supabase.auth.signOut();
      return;
    }
    if (!roleData.is_approved) {
      setError("Your account is pending approval.");
      await supabase.auth.signOut();
      return;
    }
    setError("");
    router.push("/home");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

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
            Login to <span className="text-orange-600">CRMS</span>
          </div>
          <form className="space-y-3 sm:space-y-4" onSubmit={handleLogin}>
            <div className="px-2">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 sm:mt-1.5 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
              />
            </div>
            <div className="px-2">
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-gray-700"
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
                  className="mt-1 sm:mt-1.5 w-full pr-10 sm:pr-12 px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-xs sm:text-sm text-red-500 text-center px-2">
                {error}
              </p>
            )}
            <div className="px-2">
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 sm:py-2.5 px-3 rounded shadow transition text-xs sm:text-sm"
              >
                Sign In
              </button>
            </div>
          </form>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-orange-600 font-semibold hover:underline"
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
