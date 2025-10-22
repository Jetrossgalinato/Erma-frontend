"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useAuthStore } from "@/store/authStore";

// Import components
import DashboardHeader from "./components/DashboardHeader";
import StatsGrid from "./components/StatsGrid";
import ChartsSection from "./components/ChartsSection";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";

// Import utilities
import { fetchDashboardStats, DashboardStats } from "./utils/helpers";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch dashboard statistics
  const loadDashboardData = useCallback(async (showAnimation = false) => {
    if (showAnimation) {
      setIsRefreshing(true);
    }

    try {
      setError(null);
      const stats = await fetchDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(errorMessage);
      console.error("Dashboard data fetch error:", err);
    } finally {
      if (showAnimation) {
        // Keep animation running for at least 500ms for better UX
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      }
    }
  }, []);

  // Initial data load
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      loadDashboardData(false);
    }
  }, [isAuthenticated, loadDashboardData]);

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  const handleRefreshClick = () => {
    if (!isRefreshing) {
      loadDashboardData(true);
    }
  };

  const handleRetry = () => {
    loadDashboardData(false);
  };

  // Show loading state while mounting or authenticating
  if (!mounted || authLoading) {
    return <LoadingState />;
  }

  // Don't render if not authenticated (will redirect)
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
              <DashboardHeader
                onRefresh={handleRefreshClick}
                isRefreshing={isRefreshing}
              />

              {error ? (
                <ErrorMessage message={error} onRetry={handleRetry} />
              ) : (
                <>
                  {/* Stats cards */}
                  <StatsGrid stats={dashboardStats} />

                  {/* Charts */}
                  <ChartsSection />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
