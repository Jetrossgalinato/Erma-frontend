"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useAlert } from "@/contexts/AlertContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchFacilitiesList, Facility } from "../facilities/utils/helpers";
import { checklistItems } from "./utils/checklistData";
import DailyChecklistTable from "./components/DailyChecklistTable";
import DailyLaboratorySelect from "./components/DailyLaboratorySelect";

const DailyMaintenancePage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  // Form State
  const [laboratory, setLaboratory] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [checklist, setChecklist] = useState<
    Record<string, { status: string; remarks: string }>
  >({});
  const [additionalConcerns, setAdditionalConcerns] = useState("");

  // Fetch facilities
  useEffect(() => {
    const loadFacilities = async () => {
      const data = await fetchFacilitiesList();
      setFacilities(data);
    };
    loadFacilities();
  }, []);

  // Initialize checklist state
  useEffect(() => {
    const initialChecklist: Record<
      string,
      { status: string; remarks: string }
    > = {};
    Object.values(checklistItems)
      .flat()
      .forEach((item) => {
        initialChecklist[item] = { status: "", remarks: "" };
      });
    setChecklist(initialChecklist);
  }, []);

  // Role Check
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const rawRole =
      user?.role ||
      (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);

    if (rawRole !== "Student Assistant") {
      // Optional: Redirect if not Student Assistant
      // router.push("/home");
    }
  }, [isAuthenticated, user, router, authLoading]);

  const handleStatusChange = (item: string, status: string) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: { ...prev[item], status },
    }));
  };

  const handleRemarksChange = (item: string, remarks: string) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: { ...prev[item], remarks },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/maintenance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            laboratory,
            date,
            checklist_data: JSON.stringify(checklist),
            additional_concerns: additionalConcerns,
          }),
        }
      );

      if (response.ok) {
        showAlert({
          type: "success",
          message: "Maintenance log submitted successfully!",
        });
        router.push("/home");
      } else {
        const errorData = await response.json();
        showAlert({
          type: "error",
          message: errorData.detail || "Failed to submit maintenance log.",
        });
      }
    } catch (error) {
      console.error("Error submitting maintenance log:", error);
      showAlert({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              CCIS Computer Laboratory
            </h1>
            <h2 className="text-xl font-bold text-gray-900 italic">
              SA DAILY PREVENTIVE MAINTENANCE CHECKLIST
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DailyLaboratorySelect
                laboratory={laboratory}
                setLaboratory={setLaboratory}
                facilities={facilities}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Directions:</strong> Update the status by marking check
                (✓) if the task is performed, (✕) if an issue is found, (N/A) if
                not applicable. Add remarks if necessary.
              </p>
            </div>

            <DailyChecklistTable
              checklist={checklist}
              onStatusChange={handleStatusChange}
              onRemarksChange={handleRemarksChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                List any additional concerns or issues found
              </label>
              <textarea
                rows={4}
                value={additionalConcerns}
                onChange={(e) => setAdditionalConcerns(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DailyMaintenancePage;
