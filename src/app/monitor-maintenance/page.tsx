"use client";

import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useAlert } from "@/contexts/AlertContext";

interface ChecklistItem {
  status: string;
  remarks: string;
}

interface MaintenanceLog {
  id: number;
  user_id: number;
  laboratory: string;
  date: string;
  checklist_data: string;
  additional_concerns: string | null;
  status: string;
  created_at: string;
}

export default function MonitorMaintenancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      console.log("Current User Role:", user?.role);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/maintenance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        console.error(
          "Failed to fetch logs:",
          response.status,
          response.statusText
        );
        if (response.status === 403) {
          console.error("User role not authorized. Role:", user?.role);
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  const handleConfirm = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/maintenance/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status: "Confirmed" }),
        }
      );

      if (response.ok) {
        showAlert({
          type: "success",
          message: "Maintenance log confirmed successfully",
        });
        fetchLogs(); // Refresh list
      } else {
        showAlert({
          type: "error",
          message: "Failed to confirm log",
        });
      }
    } catch (error) {
      console.error("Error confirming log:", error);
      showAlert({
        type: "error",
        message: "An error occurred",
      });
    }
  };

  const openDetails = (log: MaintenanceLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  if (authLoading) return <Loader />;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <Sidebar />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Daily Maintenance Logs
            </h1>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Laboratory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">
                          No logs found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {log.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {log.laboratory}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                log.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => openDetails(log)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              View Details
                            </button>
                            {log.status !== "Confirmed" && (
                              <button
                                onClick={() => handleConfirm(log.id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Confirm
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Maintenance Details
                </h2>
                <button
                  onClick={closeDetails}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Laboratory
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedLog.laboratory}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedLog.date}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Checklist
                  </h3>
                  <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                    {(() => {
                      try {
                        const checklist = JSON.parse(
                          selectedLog.checklist_data
                        ) as Record<string, ChecklistItem>;
                        return (
                          <ul className="space-y-2">
                            {Object.entries(checklist).map(([item, data]) => (
                              <li key={item} className="text-sm">
                                <span className="font-medium">{item}:</span>{" "}
                                <span
                                  className={
                                    data.status === "Check"
                                      ? "text-green-600"
                                      : data.status === "Issue"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }
                                >
                                  {data.status}
                                </span>
                                {data.remarks && (
                                  <span className="text-gray-500 ml-2">
                                    ({data.remarks})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        );
                      } catch {
                        return <p>Error parsing checklist data</p>;
                      }
                    })()}
                  </div>
                </div>
                {selectedLog.additional_concerns && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                      Additional Concerns
                    </h3>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedLog.additional_concerns}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
