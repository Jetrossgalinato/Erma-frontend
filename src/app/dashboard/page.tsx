"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";

// Import components
import DashboardHeader from "./components/DashboardHeader";
import StatsGrid from "./components/StatsGrid";
import ErrorMessage from "./components/ErrorMessage";
import SkeletonLoader from "./components/SkeletonLoader";

// Lazy load charts for better initial load performance
const ChartsSection = dynamic(() => import("./components/ChartsSection"), {
  ssr: false,
  loading: () => (
    <div className="space-y-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 animate-pulse"
        >
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  ),
});

// Import utilities
import { loadAllDashboardData, DashboardStats } from "./utils/helpers";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  // Fetch dashboard statistics with parallel loading for optimal performance
  const loadDashboardData = async (showAnimation = false) => {
    if (showAnimation) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoad(true);
    }

    try {
      setError(null);
      // Load all dashboard data in parallel (stats + all chart data)
      const { stats } = await loadAllDashboardData();
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
      } else {
        setIsInitialLoad(false);
      }
    }
  };

  // Initial data load
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && !authLoading) {
      loadDashboardData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

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
    return <Loader />;
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

              {isInitialLoad ? (
                <SkeletonLoader />
              ) : error ? (
                <ErrorMessage message={error} onRetry={handleRetry} />
              ) : (
                <>
                  {/* Stats cards */}
                  <StatsGrid stats={dashboardStats} />

                  {/* Charts - Lazy loaded */}
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
