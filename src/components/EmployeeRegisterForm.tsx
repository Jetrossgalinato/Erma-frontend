"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EmployeeRegisterForm() {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const subtitles = [
    "Ready to join the team?",
    "Start your journey with us!",
    "Your future begins here.",
    "Let's build something great.",
    "Welcome aboard!",
  ];

  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    const randomSubtitle =
      subtitles[Math.floor(Math.random() * subtitles.length)];
    setSubtitle(randomSubtitle);
  }, []);

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

    try {
      // Call FastAPI registration endpoint
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          department,
          phone_number: phoneNumber,
          acc_role,
          status: "Pending",
          is_employee: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Registration failed.");
      }

      alert(
        "Registration submitted successfully! Please wait for approval from the Super Admin before logging in."
      );

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
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
          Welcome! 👋
        </h2>
        Register to <span className="text-orange-600">CRMS</span>
        <p className="text-xs font-normal sm:text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      </div>

      <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
        {/* Email */}
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
            value={formData.email}
            onChange={handleChange}
            className="mt-1 sm:mt-1.5 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
          />
        </div>

        {/* First Name */}
        <div className="px-2">
          <label
            htmlFor="firstName"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 sm:mt-1.5 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
          />
        </div>

        {/* Last Name */}
        <div className="px-2">
          <label
            htmlFor="lastName"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 sm:mt-1.5 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
          />
        </div>

        {/* Department */}
        <div className="px-2">
          <label
            htmlFor="department"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Department
          </label>
          <select
            id="department"
            required
            value={formData.department}
            onChange={handleChange}
            className="mt-1 sm:mt-1.5 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
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
        <div className="px-2">
          <label
            htmlFor="phoneNumber"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 sm:mt-1.5 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
          />
        </div>

        {/* Password */}
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
              value={formData.password}
              onChange={handleChange}
              className="mt-1 sm:mt-1.5 w-full pr-10 sm:pr-12 px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="px-2">
          <label
            htmlFor="confirmpassword"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmpassword"
              required
              value={formData.confirmpassword}
              onChange={handleChange}
              className="mt-1 sm:mt-1.5 w-full pr-10 sm:pr-12 px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Role */}
        <div className="px-2">
          <label
            htmlFor="acc_role"
            className="block text-xs sm:text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="acc_role"
            required
            value={formData.acc_role}
            onChange={handleChange}
            className="mt-1 sm:mt-1.5 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-black border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs sm:text-sm"
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

        {/* Submit */}
        <div className="px-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 sm:py-2.5 px-3 rounded shadow transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-orange-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
