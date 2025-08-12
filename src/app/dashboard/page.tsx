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

  // Create stats array for StatCardsGrid
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      bgColor: "bg-purple-500",
      iconPath:
        "M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      bgColor: "bg-yellow-500",
      iconPath:
        "M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zm8 0h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z",
    },
    {
      title: "Total Equipments",
      value: totalEquipment,
      bgColor: "bg-blue-500",
      iconPath:
        "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      title: "Active Facilities",
      value: activeFacilitiesCount,
      bgColor: "bg-green-500",
      iconPath:
        "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    {
      title: "Total Supplies",
      value: totalSupply,
      bgColor: "bg-indigo-500",
      iconPath: "M4 6h16M4 10h16M4 14h16M4 18h16",
    },
    {
      title: "Borrowed (Last 7 Days)",
      value: borrowedLast7Days,
      bgColor: "bg-orange-500",
      iconPath: "M9 17v-6a2 2 0 00-2-2H5l7-7 7 7h-2a2 2 0 00-2 2v6",
    },
    {
      title: "Borrowed Today",
      value: borrowedToday,
      bgColor: "bg-red-500",
      iconPath: "M12 8v4l3 3",
    },
    {
      title: "Equipment Categories",
      value: totalEquipmentCategories,
      bgColor: "bg-teal-500",
      iconPath: "M3 7h18M3 12h18M3 17h18",
    },
  ];

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="animate-pulse bg-gray-200 w-64 h-full" />
        <div className="flex-1 flex flex-col">
          <div className="animate-pulse bg-gray-200 h-16 w-full" />
          <div className="flex-1 p-6">
            <div className="animate-pulse bg-gray-200 h-8 w-48 mb-4 rounded" />
            <div className="animate-pulse bg-gray-200 h-4 w-64 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
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
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Welcome to your dashboard! {"Here's"} an overview of the
                    system.
                  </p>
                </div>
                <button
                  onClick={handleRefreshClick}
                  disabled={isRefreshing}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                    isRefreshing
                      ? "cursor-not-allowed opacity-75"
                      : "hover:shadow-md"
                  }`}
                >
                  <span
                    className={`inline-block mr-2 transition-transform duration-300 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  >
                    ⟳
                  </span>
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
