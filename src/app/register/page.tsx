"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmployeeRegisterForm from "../../components/EmployeeRegisterForm";
import InternRegisterForm from "../../components/InternRegisterForm";
import SupervisorRegisterForm from "../../components/SupervisorRegisterForm";

export default function RegisterPage() {
  const [registerAs, setRegisterAs] = useState<
    "employee" | "intern" | "supervisor"
  >("employee");

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
            <span className="text-orange-600 font-semibold">CRIMS</span> as:
          </p>
        </div>

        {/* Dropdown for role selection */}
        <div className="mb-4 text-center">
          <select
            value={registerAs}
            onChange={(e) =>
              setRegisterAs(
                e.target.value as "employee" | "intern" | "supervisor"
              )
            }
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="employee">Employee</option>
            <option value="intern">Intern</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>

        {/* Render the selected register form */}
        <div className="w-full max-w-md mt-6">
          {registerAs === "employee" && <EmployeeRegisterForm />}
          {registerAs === "intern" && <InternRegisterForm />}
          {registerAs === "supervisor" && <SupervisorRegisterForm />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
