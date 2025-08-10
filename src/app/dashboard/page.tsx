"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFacilitiesCount, setActiveFacilitiesCount] = useState<
    number | null
  >(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);

    const fetchActiveFacilities = async () => {
      // If you have is_active column, uncomment the .eq() filter
      const { count, error } = await supabase
        .from("facilities")
        // .eq("is_active", true) // optional filter
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching facilities count:", error.message);
      } else {
        setActiveFacilitiesCount(count ?? 0);
      }
    };

    fetchActiveFacilities();
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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
        <DashboardNavbar />
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="w-64 h-full">
          <Sidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 relative overflow-y-auto focus:outline-none mt-16">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Welcome to your dashboard! {"Here's"} an overview of your
                  system.
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
                {/* Total Equipment */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Equipment
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {/* Replace with dynamic value if needed */}
                            124
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Facilities */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Facilities
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {activeFacilitiesCount !== null
                              ? activeFacilitiesCount
                              : "Loading..."}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
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
                              d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zm8 0h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Pending Requests
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            12
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
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
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Alerts
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            3
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {[
                        {
                          id: 1,
                          type: "equipment",
                          message: "New equipment added to Lab A",
                          time: "2 hours ago",
                          color: "blue",
                        },
                        {
                          id: 2,
                          type: "request",
                          message: "Equipment request approved",
                          time: "4 hours ago",
                          color: "green",
                        },
                        {
                          id: 3,
                          type: "alert",
                          message: "Maintenance required for Equipment XYZ",
                          time: "6 hours ago",
                          color: "yellow",
                        },
                      ].map((item, itemIdx, arr) => (
                        <li key={item.id}>
                          <div className="relative pb-8">
                            {itemIdx !== arr.length - 1 && (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={`
                                    h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                                    ${
                                      item.color === "blue" ? "bg-blue-500" : ""
                                    }
                                    ${
                                      item.color === "green"
                                        ? "bg-green-500"
                                        : ""
                                    }
                                    ${
                                      item.color === "yellow"
                                        ? "bg-yellow-500"
                                        : ""
                                    }
                                  `}
                                >
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {item.message}
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time>{item.time}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
