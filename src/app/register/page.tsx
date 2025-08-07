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
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Register as:</h1>
          <div className="mt-2 flex gap-4 justify-center">
            <button
              onClick={() => setRegisterAs("employee")}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                registerAs === "employee" ? "bg-orange-600" : "bg-gray-400"
              }`}
            >
              Employee
            </button>
            <button
              onClick={() => setRegisterAs("intern")}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                registerAs === "intern" ? "bg-orange-600" : "bg-gray-400"
              }`}
            >
              Intern
            </button>
            <button
              onClick={() => setRegisterAs("supervisor")}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                registerAs === "supervisor" ? "bg-orange-600" : "bg-gray-400"
              }`}
            >
              Supervisor
            </button>
          </div>
        </div>

        {/* Render the selected register form */}
        <div className="w-full max-w-md">
          {registerAs === "employee" && <EmployeeRegisterForm />}
          {registerAs === "intern" && <InternRegisterForm />}
          {registerAs === "supervisor" && <SupervisorRegisterForm />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
