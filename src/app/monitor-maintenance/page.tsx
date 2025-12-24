"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useAlert } from "@/contexts/AlertContext";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import MaintenanceLogHeader from "./components/MaintenanceLogHeader";
import MaintenanceLogTable from "./components/MaintenanceLogTable";
import MaintenanceLogDetailsModal from "./components/MaintenanceLogDetailsModal";
import PaginationControls from "./components/PaginationControls";
import {
  MaintenanceLog,
  fetchMaintenanceLogs,
  confirmMaintenanceLog,
  rejectMaintenanceLog,
  deleteMaintenanceLog,
} from "./utils/helpers";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMaintenanceLogs(
        currentPage,
        itemsPerPage,
        filterType
      );
      setLogs(data.logs);
      setTotalCount(data.total_count);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterType]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLogs();
    }
  }, [isAuthenticated, loadLogs]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleConfirm = async (id: number, logType: string) => {
    try {
      await confirmMaintenanceLog(id, logType);
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
    } catch (error) {
      console.error("Error confirming log:", error);
      showAlert({
        type: "error",
        message: "Failed to confirm maintenance log",
      });
    }
  };

  const handleReject = async (id: number, logType: string) => {
    try {
      await rejectMaintenanceLog(id, logType);
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === id && log.log_type === logType
            ? { ...log, status: "Rejected" }
            : log
        )
      );
      showAlert({
        type: "success",
        message: "Maintenance log rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting log:", error);
      showAlert({
        type: "error",
        message: "Failed to reject maintenance log",
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
      await deleteMaintenanceLog(logToDelete.id, logToDelete.logType);
      setLogs((prevLogs) =>
        prevLogs.filter(
          (log) =>
            !(log.id === logToDelete.id && log.log_type === logToDelete.logType)
        )
      );
      showAlert({
        type: "success",
        message: "Maintenance log deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting log:", error);
      showAlert({
        type: "error",
        message: "Failed to delete maintenance log",
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
              <MaintenanceLogHeader
                filterType={filterType}
                setFilterType={setFilterType}
                onRefresh={loadLogs}
              />

              <div className="mt-6">
                <MaintenanceLogTable
                  logs={logs}
                  loading={loading}
                  onConfirm={handleConfirm}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onViewDetails={openDetails}
                />
                {!loading && logs.length > 0 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalCount={totalCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MaintenanceLogDetailsModal
        isOpen={isModalOpen}
        onClose={closeDetails}
        log={selectedLog}
        onConfirm={handleConfirm}
        onReject={handleReject}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        itemType="maintenance log"
        message="Are you sure you want to delete this maintenance log? This action cannot be undone."
      />
    </div>
  );
}
