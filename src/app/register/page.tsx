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

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {/* Render the selected register form */}
        <div className="w-full max-w-xs sm:max-w-md mt-4 mx-auto">
          {registerAs === "employee" && <EmployeeRegisterForm />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
