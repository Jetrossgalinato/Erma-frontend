"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("employee"); // Default role
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError(authError.message);
      return;
    }

    const user = authData?.user;
    if (!user) {
      setError("No user data returned.");
      return;
    }

    // Always query from account_requests
    const query = supabase
      .from("account_requests")
      .select("is_approved")
      .eq("user_id", user.id);

    const { data: roleData, error: roleError } = await query.single();

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
    alert("You have logged in successfully!");
    router.push("/home");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(to left, #facc76ff, #FDF1AD)" }}
    >
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-2xl font-bold text-gray-800 mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Welcome back! 👋
            </h2>
            Login to <span className="text-orange-600">CRIMS</span>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 w-full pr-12 px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="mt-1 absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={0}
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
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
            >
              Sign In
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600 text-center">
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
