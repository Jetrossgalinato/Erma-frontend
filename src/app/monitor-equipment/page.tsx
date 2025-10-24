"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { EquipmentLog, fetchEquipmentLogs } from "./utils/helpers";
import PageHeader from "./components/PageHeader";
import LogsCard from "./components/LogsCard";

export default function MonitorEquipmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Auth guard logic
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch equipment logs
  const loadEquipmentLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetchEquipmentLogs({
        page,
        limit: itemsPerPage,
      });

      setEquipmentLogs(response.logs);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error("Error fetching equipment logs:", error);
      // Optionally show error toast/notification
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadEquipmentLogs(currentPage);
    }
  }, [currentPage, isAuthenticated, loadEquipmentLogs]);

  const handleRefresh = () => {
    loadEquipmentLogs(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500 dark:text-gray-300">Loading...</span>
      </div>
    );
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
              <PageHeader onRefresh={handleRefresh} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <LogsCard
                logs={equipmentLogs}
                loading={loading}
                currentPage={currentPage}
                totalCount={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
