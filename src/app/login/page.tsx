"use client";
import Navbar from "../../components/Navbar";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(to right, #FEDD9E, #FDF1AD)" }}
    >
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Login to <span className="text-orange-600">CCIS ERMA</span>
          </h2>

          <form className="space-y-4">
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
              <input
                type="password"
                id="password"
                required
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

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
              href="#"
              className="text-orange-600 font-semibold hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-700 py-4">
        © 2025 CCIS ERMA. All rights reserved.
      </footer>
    </div>
  );
}
