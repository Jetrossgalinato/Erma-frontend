"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [totalEquipment, setTotalEquipment] = useState<number | null>(null);
  const [activeFacilitiesCount, setActiveFacilitiesCount] = useState<
    number | null
  >(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);

    const fetchCounts = async () => {
      const { data, error } = await supabase.rpc("get_dashboard_counts");

      if (error) {
        console.error("Error fetching dashboard counts:", error);
        setTotalUsers(0);
        setPendingRequests(0);
        setTotalEquipment(0);
        setActiveFacilitiesCount(0);
        return;
      }

      setTotalUsers(data.total_users ?? 0);
      setPendingRequests(data.pending_requests ?? 0);
      setTotalEquipment(data.total_equipment ?? 0);
      setActiveFacilitiesCount(data.active_facilities ?? 0);
    };

    fetchCounts();
  }, [supabase]);

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

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
              <div className="mb-8 pt-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Welcome to your dashboard! {"Here's"} an overview of your
                  system.
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                  title="Total Users"
                  value={totalUsers}
                  bgColor="bg-purple-500"
                  iconPath="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <StatCard
                  title="Pending Requests"
                  value={pendingRequests}
                  bgColor="bg-yellow-500"
                  iconPath="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zm8 0h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z"
                />
                <StatCard
                  title="Total Equipment"
                  value={totalEquipment}
                  bgColor="bg-blue-500"
                  iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
                <StatCard
                  title="Active Facilities"
                  value={activeFacilitiesCount}
                  bgColor="bg-green-500"
                  iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  bgColor,
  iconPath,
}: {
  title: string;
  value: number | null;
  bgColor: string;
  iconPath: string;
}) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`w-8 h-8 ${bgColor} rounded-md flex items-center justify-center`}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={iconPath}
                />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-semibold text-gray-900">
                {value !== null ? value : "Loading..."}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
