"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmployeeRegisterForm from "../../components/EmployeeRegisterForm";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [registerAs] = useState<"employee" | "intern" | "supervisor">(
    "employee"
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is already authenticated
      const token = localStorage.getItem("authToken");
      if (token) {
        router.replace("/home");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
      </div>
    );
  }

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
