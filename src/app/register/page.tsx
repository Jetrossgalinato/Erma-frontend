"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmpassword: "",
    role: "",
    department: "",
    phone: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      email,
      first_name,
      last_name,
      password,
      confirmpassword,
      role,
      department,
      phone,
      reason,
    } = formData;

    if (password !== confirmpassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${first_name} ${last_name}`,
          role,
          department,
          phone,
          reason,
        },
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert(
        "Registration successful! Please check your email to verify your account."
      );
    }
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
            <h2 className="text-xl font-semibold text-gray-700">Welcome! 👋</h2>
            Register to <span className="text-orange-600">CRIMS</span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                onChange={handleChange}
                value={formData.email}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  required
                  onChange={handleChange}
                  value={formData.first_name}
                  className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="flex-1">
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  required
                  onChange={handleChange}
                  value={formData.last_name}
                  className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700"
              >
                Department
              </label>
              <input
                type="text"
                id="department"
                required
                onChange={handleChange}
                value={formData.department}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                required
                onChange={handleChange}
                value={formData.phone}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for Request
              </label>
              <textarea
                id="reason"
                required
                onChange={handleChange}
                value={formData.reason}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                rows={3}
              ></textarea>
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
                onChange={handleChange}
                value={formData.password}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="confirmpassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmpassword"
                required
                onChange={handleChange}
                value={formData.confirmpassword}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                required
                onChange={handleChange}
                value={formData.role}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-orange-600 font-semibold hover:underline"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
