"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronDown,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useRef } from "react";

interface AccountRequest {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  phone_number: string;
  acc_role: string;
  approved_acc_role: string | null;
  email: string;
}

const UsersPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10); // You can make this configurable

  const supabase = createClientComponentClient();
  const [, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Fetch total count for pagination
  const fetchTotalCount = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("execute_sql", {
        query: `
          SELECT COUNT(*) as total_count
          FROM account_requests ar
          INNER JOIN auth.users au ON ar.user_id = au.id
          WHERE ar.is_intern IS NULL 
            AND ar.is_supervisor IS NULL
        `,
      });

      if (error) {
        console.error("Error fetching total count:", error);
        setTotalCount(0);
      } else {
        setTotalCount(data?.[0]?.total_count || 0);
      }
    } catch (err) {
      console.error("Error fetching total count:", err);
      setTotalCount(0);
    }
  }, [supabase]);

  const fetchAccountRequests = useCallback(
    async (page: number = 1, showAnimation = false) => {
      try {
        if (showAnimation) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const offset = (page - 1) * itemsPerPage;

        // Use raw SQL query to join account_requests with auth.users
        const { data, error } = await supabase.rpc("execute_sql", {
          query: `
          SELECT 
            ar.id,
            ar.first_name,
            ar.last_name,
            ar.department,
            ar.phone_number,
            ar.acc_role,
            ar.approved_acc_role,
            au.email
          FROM account_requests ar
          INNER JOIN auth.users au ON ar.user_id = au.id
          WHERE ar.is_intern IS NULL 
            AND ar.is_supervisor IS NULL
          ORDER BY ar.first_name, ar.last_name
          LIMIT ${itemsPerPage} OFFSET ${offset}
        `,
        });

        if (error) {
          console.error("Error fetching account requests:", error);
          setError("Failed to fetch account requests");
        } else {
          setAccountRequests(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        if (showAnimation) {
          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
        } else {
          setLoading(false);
        }
      }
    },
    [supabase, itemsPerPage]
  );

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      fetchTotalCount();
      fetchAccountRequests(currentPage, true);
    }
  }, [isRefreshing, fetchAccountRequests, fetchTotalCount, currentPage]);

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;
    // Add your edit functionality here
    console.log("Edit user:", selectedRows[0]);
    setShowActionsDropdown(false);
  };

  const handleDeleteSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    const { error } = await supabase
      .from("account_requests")
      .delete()
      .in("id", selectedRows);

    if (error) {
      console.error("Error deleting users:", error);
      alert("Failed to delete selected users");
    } else {
      setSelectedRows([]);
      fetchTotalCount();
      fetchAccountRequests(currentPage);
      console.log(`Successfully deleted ${selectedRows.length} users.`);
    }

    setShowDeleteModal(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchTotalCount();
    fetchAccountRequests(currentPage);

    // Set up real-time subscription for updates
    const subscription = supabase
      .channel("account_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "account_requests",
        },
        () => {
          fetchTotalCount();
          fetchAccountRequests(currentPage);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAccountRequests, fetchTotalCount, supabase, currentPage]);

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(
      (item, index, array) => array.indexOf(item) === index
    );
  };

  if (!mounted || authLoading) {
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
                    Users Management
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Manage and view all account requests from users in the
                    system
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* Actions Dropdown Button */}
                  <div className="relative" ref={actionsDropdownRef}>
                    <button
                      onClick={() =>
                        setShowActionsDropdown(!showActionsDropdown)
                      }
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Actions
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>

                    {/* Actions Dropdown Menu */}
                    {showActionsDropdown && (
                      <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          {/* Edit Selected Option */}
                          <button
                            onClick={() => {
                              handleEditClick();
                              setShowActionsDropdown(false);
                            }}
                            disabled={selectedRows.length !== 1}
                            className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                              selectedRows.length !== 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            <Edit className="w-4 h-4 mr-3 text-blue-600" />
                            Edit Selected (
                            {selectedRows.length === 1
                              ? "1"
                              : selectedRows.length}
                            )
                          </button>

                          {/* Delete Selected Option */}
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setShowActionsDropdown(false);
                            }}
                            disabled={selectedRows.length === 0}
                            className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                              selectedRows.length === 0
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-red-50 hover:text-red-900"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-3 text-red-600" />
                            Delete Selected ({selectedRows.length})
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Refresh button */}
                  <button
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      isRefreshing
                        ? "cursor-not-allowed opacity-75"
                        : "hover:shadow-md"
                    }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {totalCount} total users
                  </p>
                  {totalCount > 0 && (
                    <p className="text-sm text-gray-500">
                      Showing {startItem} to {endItem} of {totalCount} results
                    </p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-3 text-gray-600">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-red-500">
                        <span className="font-semibold">Error:</span> {error}
                      </div>
                    </div>
                  ) : accountRequests.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <span className="text-gray-500">
                        No account requests found
                      </span>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              checked={
                                selectedRows.length ===
                                  accountRequests.length &&
                                accountRequests.length > 0
                              }
                              onChange={() => {
                                if (
                                  selectedRows.length === accountRequests.length
                                ) {
                                  setSelectedRows([]);
                                } else {
                                  setSelectedRows(
                                    accountRequests.map((request) => request.id)
                                  );
                                }
                              }}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            First Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Approved Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accountRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="w-12 px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                checked={selectedRows.includes(request.id)}
                                onChange={() =>
                                  handleCheckboxChange(request.id)
                                }
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {request.first_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {request.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {request.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {request.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {request.phone_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {request.acc_role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {request.approved_acc_role ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {request.approved_acc_role}
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={goToPrevious}
                          disabled={currentPage === 1}
                          className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                              : "text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <ChevronLeft size={16} className="mr-1" />
                          Previous
                        </button>

                        <div className="flex items-center space-x-1">
                          {getVisiblePages().map((page, index) => (
                            <React.Fragment key={index}>
                              {page === "..." ? (
                                <span className="px-3 py-2 text-gray-500">
                                  ...
                                </span>
                              ) : (
                                <button
                                  onClick={() => goToPage(page as number)}
                                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    currentPage === page
                                      ? "bg-orange-500 text-white"
                                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <button
                          onClick={goToNext}
                          disabled={currentPage === totalPages}
                          className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                              : "text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          Next
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>

                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full z-50">
            <div className="p-6">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Selected Users
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete **
                    {selectedRows.length}** user records? This action cannot be
                    undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                onClick={handleDeleteSelectedRows}
              >
                Delete
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
