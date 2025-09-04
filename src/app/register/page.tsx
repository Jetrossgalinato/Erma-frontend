"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmployeeRegisterForm from "../../components/EmployeeRegisterForm";

export default function RegisterPage() {
  const [registerAs] = useState<"employee" | "intern" | "supervisor">(
    "employee"
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(to left, #facc76ff, #FDF1AD)" }}
    >
      <Navbar />

      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        {/* New Heading */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Welcome back! 👋</h2>
          <p className="text-lg text-gray-700">
            Register to{" "}
            <span className="text-orange-600 font-semibold">CRIMS</span> as an
            Employee
          </p>
        </div>

        {/* Render the selected register form */}
        <div className="w-full max-w-md mt-6">
          {registerAs === "employee" && <EmployeeRegisterForm />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
