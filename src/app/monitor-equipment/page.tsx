"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useMonitoringStore } from "@/store/monitoringStore";
import { fetchEquipmentLogs } from "./utils/helpers";
import PageHeader from "./components/PageHeader";
import LogsCard from "./components/LogsCard";
import ErrorMessage from "./components/ErrorMessage";

export default function MonitorEquipmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const {
    equipmentLogs,
    isLoadingEquipmentLogs,
    equipmentLogsPagination,
    setEquipmentLogs,
    setIsLoadingEquipmentLogs,
    setEquipmentLogsPagination,
  } = useMonitoringStore();

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
  const loadEquipmentLogs = useCallback(
    async (page = 1) => {
      try {
        setError(null);
        setIsLoadingEquipmentLogs(true);
        const response = await fetchEquipmentLogs({
          page,
          limit: equipmentLogsPagination.itemsPerPage,
        });

        setEquipmentLogs(response.logs);
        setEquipmentLogsPagination({
          currentPage: response.page,
          totalCount: response.total_count,
          totalPages: response.total_pages,
        });
      } catch (error) {
        console.error("Error fetching equipment logs:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load equipment logs"
        );
      } finally {
        setIsLoadingEquipmentLogs(false);
      }
    },
    [
      equipmentLogsPagination.itemsPerPage,
      setEquipmentLogs,
      setIsLoadingEquipmentLogs,
      setEquipmentLogsPagination,
    ]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadEquipmentLogs(equipmentLogsPagination.currentPage);
    }
  }, [equipmentLogsPagination.currentPage, isAuthenticated, loadEquipmentLogs]);

  const handleRefresh = () => {
    loadEquipmentLogs(equipmentLogsPagination.currentPage);
  };

  const handlePageChange = (page: number) => {
    setEquipmentLogsPagination({ currentPage: page });
  };

  if (authLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return null;
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

            {error && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
                <ErrorMessage message={error} />
              </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <LogsCard
                logs={equipmentLogs}
                loading={isLoadingEquipmentLogs}
                currentPage={equipmentLogsPagination.currentPage}
                totalCount={equipmentLogsPagination.totalCount}
                itemsPerPage={equipmentLogsPagination.itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
