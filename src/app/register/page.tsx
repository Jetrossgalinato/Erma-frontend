"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmployeeRegisterForm from "../../components/EmployeeRegisterForm";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [registerAs] = useState<"employee" | "intern" | "supervisor">(
    "employee",
  );
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(to left, #facc76ff, #FDF1AD)" }}
    >
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {/* Render the selected register form */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mt-4 mx-auto">
          {registerAs === "employee" && <EmployeeRegisterForm />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
