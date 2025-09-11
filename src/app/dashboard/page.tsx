"use client";
import { useCallback, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import EquipmentCountPerPersonLiableChart from "@/components/EquipmentCountPerPersonLiableChart";
import EquipmentCategoryChart from "@/components/EquipmentCategoryChart";
import EquipmentStatusChart from "@/components/EquipmentStatusChart";
import EquipmentPerFacilityChart from "@/components/EquipmentPerFacilityChart";
import EquipmentAvailabilityChart from "@/components/EquipmentAvailabilityChart";
import { StatCardsGrid } from "@/components/StatCards";
import {
  Users,
  Clock,
  Monitor,
  Building,
  Package,
  TrendingUp,
  Calendar,
  Grid3X3,
  RefreshCw,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [totalEquipment, setTotalEquipment] = useState<number | null>(null);
  const [activeFacilitiesCount, setActiveFacilitiesCount] = useState<
    number | null
  >(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [borrowedLast7Days, setBorrowedLast7Days] = useState<number | null>(
    null
  );
  const [borrowedToday, setBorrowedToday] = useState<number | null>(null);
  const [totalEquipmentCategories, setTotalEquipmentCategories] = useState<
    number | null
  >(null);

  const supabase = createClientComponentClient();

  const [, setUser] = useState<SupabaseUser | null>(null);
  const [, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error);
          router.push("/login");
          return;
        }

        if (!session?.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);

        // Allow all authenticated users for now
        // TODO: Add role-based restrictions if needed
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const fetchCounts = useCallback(
    async (showAnimation = false) => {
      if (showAnimation) {
        setIsRefreshing(true);
      }

      const { data, error } = await supabase.rpc("get_dashboard_counts");

      if (error) {
        console.error("Error fetching dashboard counts:", error);
        setTotalUsers(0);
        setPendingRequests(0);
        setTotalEquipment(0);
        setActiveFacilitiesCount(0);
        setTotalSupply(0);
        setBorrowedLast7Days(0);
        setBorrowedToday(0);
        setTotalEquipmentCategories(0);
      } else {
        setTotalUsers(data.total_users ?? 0);
        setPendingRequests(data.pending_requests ?? 0);
        setTotalEquipment(data.total_equipment ?? 0);
        setActiveFacilitiesCount(data.active_facilities ?? 0);
        setTotalSupply(data.total_supplies ?? 0);
        setBorrowedLast7Days(data.borrowed_last_7_days ?? 0);
        setBorrowedToday(data.borrowed_today ?? 0);
        setTotalEquipmentCategories(data.total_equipment_categories ?? 0);
      }

      if (showAnimation) {
        // Keep animation running for at least 500ms for better UX
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      }
    },
    [supabase]
  );

  useEffect(() => {
    setMounted(true);
    fetchCounts(false);
  }, [fetchCounts]);

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  const handleRefreshClick = () => {
    if (!isRefreshing) {
      fetchCounts(true);
    }
  };

  // Create stats array for StatCardsGrid with Lucide icons
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      bgColor: "bg-purple-500",
      icon: Users,
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      bgColor: "bg-yellow-500",
      icon: Clock,
    },
    {
      title: "Total Equipments",
      value: totalEquipment,
      bgColor: "bg-blue-500",
      icon: Monitor,
    },
    {
      title: "Active Facilities",
      value: activeFacilitiesCount,
      bgColor: "bg-green-500",
      icon: Building,
    },
    {
      title: "Total Supplies",
      value: totalSupply,
      bgColor: "bg-indigo-500",
      icon: Package,
    },
    {
      title: "Borrowed (Last 7 Days)",
      value: borrowedLast7Days,
      bgColor: "bg-orange-500",
      icon: TrendingUp,
    },
    {
      title: "Borrowed Today",
      value: borrowedToday,
      bgColor: "bg-red-500",
      icon: Calendar,
    },
    {
      title: "Equipment Categories",
      value: totalEquipmentCategories,
      bgColor: "bg-teal-500",
      icon: Grid3X3,
    },
  ];

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-64 h-full" />
        <div className="flex-1 flex flex-col">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 w-full" />
          <div className="flex-1 p-6">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 mb-4 rounded" />
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-64 rounded" />
          </div>
        </div>
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
              <div className="mb-8 pt-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Welcome to your dashboard! {"Here's"} an overview of the
                    system.
                  </p>
                </div>
                <button
                  onClick={handleRefreshClick}
                  disabled={isRefreshing}
                  className={`bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    isRefreshing ? "cursor-not-allowed opacity-75" : ""
                  }`}
                >
                  <RefreshCw
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {/* Stats cards using StatCardsGrid component */}
              <StatCardsGrid stats={stats} />

              {/* Equipment per person liable chart */}
              <div className="mb-8">
                <EquipmentCountPerPersonLiableChart />
              </div>
              {/* Equipment Categories Chart */}
              <div className="mb-8">
                <EquipmentCategoryChart />
              </div>
              {/* Equipment Status Chart */}
              <div className="mb-8">
                <EquipmentStatusChart />
              </div>
              {/* Equipment Per Facility Chart */}
              <div className="mb-8">
                <EquipmentPerFacilityChart />
              </div>
              {/* Equipment Availability Chart */}
              <div className="mb-8">
                <EquipmentAvailabilityChart />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
