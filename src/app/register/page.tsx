"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    department: "",
    phoneNumber: "",
    password: "",
    confirmpassword: "",
    acc_role: "",
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
    setLoading(true);

    const {
      email,
      password,
      confirmpassword,
      firstName,
      lastName,
      department,
      phoneNumber,
      acc_role,
    } = formData;

    if (password !== confirmpassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    // 🧾 Register user in Supabase Auth (store original role)
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          acc_role: acc_role, // 👈 Store the original role selection
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;

    if (userId) {
      const { error: insertError } = await supabase
        .from("account_requests")
        .insert([
          {
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            department,
            phone_number: phoneNumber,
            acc_role: acc_role, // 👈 Store the original role (e.g., "CCIS Dean")
            // approved_acc_role will be set later during the approval process
          },
        ]);

      if (insertError) {
        alert(
          "User created but failed to save extra data: " + insertError.message
        );
      } else {
        alert(
          "Registration submitted! Please wait for approval from the Super Admin before logging in."
        );
      }
    }

    setLoading(false);

    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      department: "",
      phoneNumber: "",
      password: "",
      confirmpassword: "",
      acc_role: "",
    });

    window.location.href = "/login";
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
            Register to <span className="text-orange-600">CRIMS</span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
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

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                required
                onChange={handleChange}
                value={formData.firstName}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                required
                onChange={handleChange}
                value={formData.lastName}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700"
              >
                Department
              </label>
              <select
                id="department"
                required
                onChange={handleChange}
                value={formData.department}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="" disabled>
                  Select department
                </option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                required
                onChange={handleChange}
                value={formData.phoneNumber}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
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

            {/* Role */}
            <div>
              <label
                htmlFor="acc_role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="acc_role"
                required
                onChange={handleChange}
                value={formData.acc_role}
                className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="CCIS Dean">CCIS Dean</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Comlab Adviser">Comlab Adviser</option>
                <option value="Department Chairperson">
                  Department Chairperson
                </option>
                <option value="Associate Dean">Associate Dean</option>
                <option value="College Clerk">College Clerk</option>
                <option value="Student Assistant">Student Assistant</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Instructor">Instructor</option>
              </select>
            </div>

            {/* Submit Button */}
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
