"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface EquipmentLog {
  id: number;
  log_message: string;
  created_at: string;
}

export default function MonitorEquipmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };
  const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Auth guard states
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Auth guard logic
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/home");
      } else {
        setCurrentUser(session.user);
      }
      setAuthLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        router.replace("/home");
      } else {
        setCurrentUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const fetchEquipmentLogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        // Calculate offset for pagination
        const offset = (page - 1) * itemsPerPage;

        // First, get the total count
        const { count, error: countError } = await supabase
          .from("equipment_logs")
          .select("*", { count: "exact", head: true });

        if (countError) throw countError;
        setTotalCount(count || 0);

        // Then get the paginated data
        const { data, error } = await supabase
          .from("equipment_logs")
          .select(
            `
        id,
        log_message,
        created_at
      `
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + itemsPerPage - 1);

        if (error) throw error;
        setEquipmentLogs(data || []);
      } catch (error) {
        console.error("Error fetching equipment logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [supabase, itemsPerPage]
  );

  useEffect(() => {
    if (currentUser) {
      fetchEquipmentLogs(currentPage);
    }
  }, [fetchEquipmentLogs, currentPage, currentUser]);

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
              <div className="mb-8 pt-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Equipment Monitoring
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    View detailed logs of all user interactions with equipment
                    records and borrowing requests, including approvals,
                    rejections, modifications, and deletions.
                  </p>
                </div>
                <button
                  onClick={() => fetchEquipmentLogs(currentPage)}
                  className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Equipment Logs
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
                      <span className="ml-3 text-gray-600 dark:text-gray-400">
                        Loading requests...
                      </span>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700"></thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {equipmentLogs.length === 0 ? (
                          <tr>
                            <td
                              colSpan={1}
                              className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                            >
                              No equipment logs found
                            </td>
                          </tr>
                        ) : (
                          equipmentLogs.map((log) => (
                            <tr
                              key={log.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-6 py-4 text-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 text-gray-900 dark:text-gray-100 break-words pr-4">
                                    {log.log_message}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {new Date(
                                      log.created_at
                                    ).toLocaleDateString()}{" "}
                                    {new Date(
                                      log.created_at
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
                {/* Pagination Controls */}
                {!loading && equipmentLogs.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                      {totalCount} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {/* Page numbers */}
                      {Array.from(
                        { length: Math.ceil(totalCount / itemsPerPage) },
                        (_, i) => i + 1
                      )
                        .filter((page) => {
                          const totalPages = Math.ceil(
                            totalCount / itemsPerPage
                          );
                          if (totalPages <= 7) return true;
                          if (page <= 3) return true;
                          if (page >= totalPages - 2) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          const prevPage = array[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-2 text-gray-500 dark:text-gray-400">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 text-sm border rounded-md ${
                                  currentPage === page
                                    ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600"
                                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(totalCount / itemsPerPage)
                            )
                          )
                        }
                        disabled={
                          currentPage >= Math.ceil(totalCount / itemsPerPage)
                        }
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
