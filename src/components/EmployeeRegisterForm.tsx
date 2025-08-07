"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
      // Step 1: Sign up user
      const { data: signUpData, error: authError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`,
              acc_role: acc_role,
            },
          },
        }
      );

      if (authError)
        throw new Error(`Authentication error: ${authError.message}`);

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("User ID not returned from authentication");

      // Wait briefly to avoid race condition
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Insert into account_requests table
      const { error: insertError } = await supabase
        .from("account_requests")
        .insert([
          {
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            department,
            phone_number: phoneNumber,
            acc_role,
            status: "Pending",
          },
        ]);

      if (insertError) {
        // Cleanup failed user
        try {
          await supabase.auth.admin.deleteUser(userId);
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
        throw new Error(
          `Failed to save registration data: ${insertError.message}`
        );
      }

      alert(
        "Registration submitted successfully! Please wait for approval from the Super Admin before logging in."
      );

      // Reset
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
    <form
      className="space-y-4 bg-white rounded-2xl shadow-xl p-8"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
        Employee Registration
      </h2>

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
          value={formData.email}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
        />
      </div>

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
          value={formData.firstName}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
        />
      </div>

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
          value={formData.lastName}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
        />
      </div>

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
          value={formData.department}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
        >
          <option value="" disabled>
            Select department
          </option>
          <option value="BSIT">BSIT</option>
          <option value="BSCS">BSCS</option>
          <option value="BSIS">BSIS</option>
        </select>
      </div>

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
          value={formData.phoneNumber}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
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
          value={formData.password}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
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
          value={formData.confirmpassword}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
        />
      </div>

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
          value={formData.acc_role}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400"
        >
          <option value="" disabled>
            Select a role
          </option>
          <option value="CCIS Dean">CCIS Dean</option>
          <option value="Lab Technician">Lab Technician</option>
          <option value="Comlab Adviser">Comlab Adviser</option>
          <option value="Department Chairperson">Department Chairperson</option>
          <option value="Associate Dean">Associate Dean</option>
          <option value="College Clerk">College Clerk</option>
          <option value="Student Assistant">Student Assistant</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Instructor">Instructor</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
