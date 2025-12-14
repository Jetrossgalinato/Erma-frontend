"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAlert } from "@/contexts/AlertContext";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { fetchFacilitiesList, Facility } from "../facilities/utils/helpers";
import { ChecklistType, ChecklistSection } from "./utils/types";
import {
  initialDailyChecklist,
  initialWeeklyChecklist,
  initialMonthlyChecklist,
} from "./utils/checklistData";
import ChecklistTable from "./components/ChecklistTable";
import LaboratorySelect from "./components/LaboratorySelect";
import ChecklistTypeDropdown from "./components/ChecklistTypeDropdown";

const MaintenanceCheckPage = () => {
  const [selectedType, setSelectedType] = useState<ChecklistType>("Daily");
  const [laboratory, setLaboratory] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [additionalConcerns, setAdditionalConcerns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();
  const { user } = useAuthStore();

  // Fetch facilities
  useEffect(() => {
    const loadFacilities = async () => {
      const data = await fetchFacilitiesList();
      setFacilities(data);
    };
    loadFacilities();
  }, []);

  const [dailyChecklist, setDailyChecklist] = useState<ChecklistSection[]>(
    initialDailyChecklist
  );
  const [weeklyChecklist, setWeeklyChecklist] = useState<ChecklistSection[]>(
    initialWeeklyChecklist
  );
  const [monthlyChecklist, setMonthlyChecklist] = useState<ChecklistSection[]>(
    initialMonthlyChecklist
  );

  const getChecklist = () => {
    switch (selectedType) {
      case "Daily":
        return dailyChecklist;
      case "Weekly":
        return weeklyChecklist;
      case "Monthly":
        return monthlyChecklist;
      default:
        return dailyChecklist;
    }
  };

  const setChecklist = (newChecklist: ChecklistSection[]) => {
    switch (selectedType) {
      case "Daily":
        setDailyChecklist(newChecklist);
        break;
      case "Weekly":
        setWeeklyChecklist(newChecklist);
        break;
      case "Monthly":
        setMonthlyChecklist(newChecklist);
        break;
    }
  };

  const handleStatusChange = (
    sectionIndex: number,
    itemIndex: number,
    checked: boolean
  ) => {
    const currentChecklist = [...getChecklist()];
    currentChecklist[sectionIndex].items[itemIndex].status = checked;
    setChecklist(currentChecklist);
  };

  const handleRemarksChange = (
    sectionIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const currentChecklist = [...getChecklist()];
    currentChecklist[sectionIndex].items[itemIndex].remarks = value;
    setChecklist(currentChecklist);
  };

  const handleSubmit = async () => {
    if (!laboratory.trim()) {
      showAlert({
        type: "error",
        message: "Please enter the laboratory name.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showAlert({
          type: "error",
          message: "You are not authenticated. Please login again.",
        });
        router.push("/login");
        return;
      }

      const checklistData = {
        type: selectedType,
        sections: getChecklist(),
      };

      const payload = {
        laboratory: laboratory,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        checklist_type: selectedType,
        checklist_data: JSON.stringify(checklistData),
        additional_concerns: additionalConcerns,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/technician-maintenance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        showAlert({
          type: "success",
          message: "Maintenance log submitted successfully!",
        });
        // Reset form
        setAdditionalConcerns("");
        setLaboratory("");

        // Reset checklists
        const resetItems = (list: ChecklistSection[]) =>
          list.map((section) => ({
            ...section,
            items: section.items.map((item) => ({
              ...item,
              status: false,
              remarks: "",
            })),
          }));

        setDailyChecklist((prev) => resetItems(prev));
        setWeeklyChecklist((prev) => resetItems(prev));
        setMonthlyChecklist((prev) => resetItems(prev));

        // Only redirect if NOT Lab Technician
        if (user?.role !== "Lab Technician") {
          router.push("/dashboard");
        }
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
        message: "An error occurred while submitting the log.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
              Maintenance Checklist
            </h1>

            <ChecklistTypeDropdown
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {selectedType} Preventive Maintenance Checklist
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Directions: Update the status by marking check if the task
                      is performed, or if an issue is found. Add remarks if
                      necessary.
                    </p>
                  </div>
                  <LaboratorySelect
                    laboratory={laboratory}
                    setLaboratory={setLaboratory}
                    facilities={facilities}
                  />
                </div>
              </div>

              <ChecklistTable
                sections={getChecklist()}
                onStatusChange={handleStatusChange}
                onRemarksChange={handleRemarksChange}
              />

              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  List any additional concerns or issues found
                </label>
                <textarea
                  rows={4}
                  value={additionalConcerns}
                  onChange={(e) => setAdditionalConcerns(e.target.value)}
                  className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  placeholder="Enter additional concerns here..."
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MaintenanceCheckPage;
