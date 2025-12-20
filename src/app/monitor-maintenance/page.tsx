"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useAlert } from "@/contexts/AlertContext";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import {
  Eye,
  CheckCircle,
  X,
  Calendar,
  MapPin,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  User,
  Trash2,
  Filter,
  Clock,
} from "lucide-react";

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
  user_first_name: string;
  user_last_name: string;
  user_role: string;
  checklist_type: string;
  log_type: string;
}

export default function MonitorMaintenancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("All");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<{
    id: number;
    logType: string;
  } | null>(null);

  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role === "Lab Technician") {
        router.push("/dashboard");
        showAlert({
          type: "error",
          message: "Access denied. Lab Technicians cannot access this page.",
        });
      }
    }
  }, [isAuthenticated, authLoading, router, user, showAlert]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

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
  }, [user?.role]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated, fetchLogs]);

  const handleConfirm = async (id: number, logType: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/maintenance/${id}/status?log_type=${logType}`,
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
        setLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.id === id && log.log_type === logType
              ? { ...log, status: "Confirmed" }
              : log
          )
        );
        showAlert({
          type: "success",
          message: "Maintenance log confirmed successfully",
        });
      } else {
        showAlert({
          type: "error",
          message: "Failed to confirm maintenance log",
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

  const handleDelete = (id: number, logType: string) => {
    setLogToDelete({ id, logType });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!logToDelete) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/maintenance/${logToDelete.id}?log_type=${logToDelete.logType}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        setLogs((prevLogs) =>
          prevLogs.filter(
            (log) =>
              !(
                log.id === logToDelete.id &&
                log.log_type === logToDelete.logType
              )
          )
        );
        showAlert({
          type: "success",
          message: "Maintenance log deleted successfully",
        });
      } else {
        showAlert({
          type: "error",
          message: "Failed to delete maintenance log",
        });
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      showAlert({
        type: "error",
        message: "An error occurred",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setLogToDelete(null);
    }
  };

  const openDetails = (log: MaintenanceLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType === "All") return true;
    return log.checklist_type === filterType;
  });

  const closeDetails = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  if (authLoading || (isAuthenticated && user?.role === "Lab Technician")) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <DashboardNavbar />
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="w-64 h-full">
          <Sidebar />
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 relative overflow-y-auto focus:outline-none mt-16">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-8 pt-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    Maintenance Logs
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Review and confirm maintenance reports submitted by student
                    assistants and lab technicians.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="All">All Types</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <button
                    onClick={fetchLogs}
                    className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date & Time
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Laboratory
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Submitted By
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Status
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLogs.length === 0 && !loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                              <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                              <p className="text-lg font-medium">
                                No maintenance logs found
                              </p>
                              <p className="text-sm">
                                No logs match the selected filter.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log, index) => (
                          <tr
                            key={`${log.log_type}-${log.id}`}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-800"
                                : "bg-gray-50/50 dark:bg-gray-700/20"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{log.date}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(log.created_at).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                              {log.laboratory}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {log.user_first_name} {log.user_last_name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {log.user_role}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                              <div className="flex flex-col gap-1">
                                <span
                                  className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border w-fit ${
                                    log.status === "Confirmed"
                                      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
                                  }`}
                                >
                                  {log.status === "Confirmed" ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5" />
                                  )}
                                  {log.status}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                  Type: {log.checklist_type}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openDetails(log)}
                                  className="inline-flex items-center justify-center p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-500 rounded-lg transition-all duration-200 border border-indigo-600 dark:border-indigo-400"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {log.status !== "Confirmed" && (
                                  <button
                                    onClick={() =>
                                      handleConfirm(log.id, log.log_type)
                                    }
                                    className="inline-flex items-center justify-center p-2 text-green-600 hover:text-white hover:bg-green-600 dark:text-green-400 dark:hover:bg-green-500 rounded-lg transition-all duration-200 border border-green-600 dark:border-green-400"
                                    title="Confirm"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDelete(log.id, log.log_type)
                                  }
                                  className="inline-flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:bg-red-500 rounded-lg transition-all duration-200 border border-red-600 dark:border-red-400"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-6 h-6" />
                Maintenance Report Details
              </h2>
              <button
                onClick={closeDetails}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Laboratory
                    </h3>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {selectedLog.laboratory}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      Date
                    </h3>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {selectedLog.date}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-orange-500" />
                    Maintenance Checklist
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    {(() => {
                      try {
                        const parsedData = JSON.parse(
                          selectedLog.checklist_data
                        );

                        // Check if it's the technician format (has sections)
                        if (
                          parsedData.sections &&
                          Array.isArray(parsedData.sections)
                        ) {
                          interface TechChecklistItem {
                            task: string;
                            status: boolean;
                            remarks: string;
                          }

                          interface TechChecklistSection {
                            title: string;
                            items: TechChecklistItem[];
                          }

                          interface TechChecklistData {
                            type: string;
                            sections: TechChecklistSection[];
                          }

                          const techData = parsedData as TechChecklistData;
                          return (
                            <div className="space-y-6">
                              {techData.sections.map((section, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
                                >
                                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    {section.title}
                                  </h4>
                                  <ul className="space-y-3">
                                    {section.items.map((item, iIdx) => (
                                      <li
                                        key={iIdx}
                                        className="text-sm flex justify-between items-start gap-4"
                                      >
                                        <div className="flex-1">
                                          <span className="text-gray-600 dark:text-gray-300 block">
                                            {item.task}
                                          </span>
                                          {item.remarks && (
                                            <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                              Note: {item.remarks}
                                            </p>
                                          )}
                                        </div>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                            item.status
                                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                                              : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700"
                                          }`}
                                        >
                                          {item.status ? "Check" : "Issue"}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        const checklist = parsedData as Record<
                          string,
                          ChecklistItem
                        >;
                        return (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <ul className="space-y-3">
                              {Object.entries(checklist).map(([item, data]) => (
                                <li
                                  key={item}
                                  className="text-sm flex justify-between items-start gap-4"
                                >
                                  <div className="flex-1">
                                    <span className="text-gray-600 dark:text-gray-300 block">
                                      {item}
                                    </span>
                                    {data.remarks && (
                                      <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                        Note: {data.remarks}
                                      </p>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                      data.status === "Check"
                                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                                        : data.status === "Issue"
                                        ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700"
                                        : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700"
                                    }`}
                                  >
                                    {data.status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      } catch {
                        return <p>Error parsing checklist data</p>;
                      }
                    })()}
                  </div>
                </div>
                {selectedLog.additional_concerns && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-400 text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Additional Concerns
                    </h3>
                    <p className="text-amber-800 dark:text-amber-300">
                      {selectedLog.additional_concerns}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedLog.status !== "Confirmed" && (
                  <button
                    onClick={() => {
                      handleConfirm(selectedLog.id, selectedLog.log_type);
                      closeDetails();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Report
                  </button>
                )}
                <button
                  onClick={closeDetails}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        itemType="maintenance log"
        message="Are you sure you want to delete this maintenance log? This action cannot be undone."
      />
      {loading && <Loader />}
    </div>
  );
}
