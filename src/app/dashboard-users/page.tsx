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
  Loader2,
  AlertTriangle,
  Filter,
  Building,
  X,
  Users,
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

// AuthGuard component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);
      } catch {
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (authLoading) {
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

  return <>{children}</>;
};

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AccountRequest | null>(null);

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "department" | "role" | null
  >(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const actionsDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowActionsDropdown(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter functions
  const handleFilterSelect = (filterType: "department" | "role") => {
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setDepartmentFilter("");
    setRoleFilter("");
    setActiveFilter(null);
    setCurrentPage(1);
  };

  const getFilteredUsers = () => {
    return accountRequests.filter((user) => {
      const matchesDepartment =
        !departmentFilter ||
        user.department?.toLowerCase().includes(departmentFilter.toLowerCase());

      const matchesRole =
        !roleFilter ||
        user.acc_role?.toLowerCase().includes(roleFilter.toLowerCase());

      return matchesDepartment && matchesRole;
    });
  };

  const getUniqueDepartments = () => {
    return [
      ...new Set(
        accountRequests.map((user) => user.department).filter(Boolean)
      ),
    ].sort();
  };

  const getUniqueRoles = () => {
    // Only get roles from acc_role column
    const allRoles = accountRequests
      .map((user) => user.acc_role)
      .filter(Boolean);
    return [...new Set(allRoles)].sort();
  };

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
    const userToEdit = accountRequests.find(
      (user) => user.id === selectedRows[0]
    );
    if (userToEdit) {
      setEditingUser(userToEdit);
      setShowEditModal(true);
    }
    setShowActionsDropdown(false);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditingUser((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    if (!editingUser.first_name?.trim()) {
      alert("First name is required");
      return;
    }

    if (!editingUser.last_name?.trim()) {
      alert("Last name is required");
      return;
    }

    if (!editingUser.department?.trim()) {
      alert("Department is required");
      return;
    }

    const { error } = await supabase
      .from("account_requests")
      .update({
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        department: editingUser.department,
        phone_number: editingUser.phone_number,
        acc_role: editingUser.acc_role,
        approved_acc_role: editingUser.approved_acc_role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingUser.id);

    if (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    } else {
      setAccountRequests((prev) =>
        prev.map((user) => (user.id === editingUser.id ? editingUser : user))
      );
      setShowEditModal(false);
      setEditingUser(null);
      setSelectedRows([]);
      console.log("User updated successfully");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingUser(null);
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

  // Get filtered users for display
  const filteredUsers = getFilteredUsers();
  const totalFilteredPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Calculate proper pagination info for display
  const startItem = startIndex + 1;
  const endItem = Math.min(endIndex, filteredUsers.length);

  // Pagination calculations for total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Use filtered pagination for navigation
  const actualTotalPages =
    departmentFilter || roleFilter ? totalFilteredPages : totalPages;

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= actualTotalPages) {
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
      i <= Math.min(actualTotalPages - 1, currentPage + delta);
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

    if (currentPage + delta < actualTotalPages - 1) {
      rangeWithDots.push("...", actualTotalPages);
    } else {
      rangeWithDots.push(actualTotalPages);
    }

    return rangeWithDots.filter(
      (item, index, array) => array.indexOf(item) === index
    );
  };

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
    <AuthGuard>
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
                      Users Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Manage and view all account requests from users in the
                      system
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {/* Filter Dropdown */}
                    <div className="relative" ref={filterDropdownRef}>
                      <button
                        onClick={() =>
                          setShowFilterDropdown(!showFilterDropdown)
                        }
                        className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium transition-all duration-200 ${
                          activeFilter || departmentFilter || roleFilter
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-600"
                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>

                      {showFilterDropdown && (
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1">
                            <button
                              onClick={() => handleFilterSelect("department")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                              <Building className="w-4 h-4 mr-3" />
                              Filter by Department
                            </button>
                            <button
                              onClick={() => handleFilterSelect("role")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                              <Users className="w-4 h-4 mr-3" />
                              Filter by Account Role
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Filter Dropdown for Department */}
                    {activeFilter === "department" && (
                      <select
                        value={departmentFilter}
                        onChange={(e) => {
                          setDepartmentFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Departments</option>
                        {getUniqueDepartments().map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Active Filter Dropdown for Account Role */}
                    {activeFilter === "role" && (
                      <select
                        value={roleFilter}
                        onChange={(e) => {
                          setRoleFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Account Roles</option>
                        {getUniqueRoles().map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Clear Filter Button */}
                    {(departmentFilter || roleFilter || activeFilter) && (
                      <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4 mr-1 inline" />
                        Clear
                      </button>
                    )}

                    {/* Actions Dropdown Button */}
                    <div className="relative" ref={actionsDropdownRef}>
                      <button
                        onClick={() =>
                          setShowActionsDropdown(!showActionsDropdown)
                        }
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium rounded-md shadow-sm transition-all duration-200"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </button>

                      {/* Actions Dropdown Menu */}
                      {showActionsDropdown && (
                        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none z-50">
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
                                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                              }`}
                            >
                              <Edit className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
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
                                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-400"
                              }`}
                            >
                              <Trash2 className="w-4 h-4 mr-3 text-red-600 dark:text-red-400" />
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
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredUsers.length} total users{" "}
                      {departmentFilter || roleFilter
                        ? `(filtered from ${totalCount})`
                        : ""}
                    </p>
                    {filteredUsers.length > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {startItem} to {endItem} of{" "}
                        {filteredUsers.length} results
                      </p>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
                        <span className="ml-3 text-gray-600 dark:text-gray-400">
                          Loading...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-red-500 dark:text-red-400">
                          <span className="font-semibold">Error:</span> {error}
                        </div>
                      </div>
                    ) : currentUsers.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <span className="text-gray-500 dark:text-gray-400">
                          No users found{" "}
                          {(departmentFilter || roleFilter) &&
                            "matching the current filters"}
                        </span>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                checked={
                                  selectedRows.length === currentUsers.length &&
                                  currentUsers.length > 0
                                }
                                onChange={() => {
                                  if (
                                    selectedRows.length === currentUsers.length
                                  ) {
                                    setSelectedRows([]);
                                  } else {
                                    setSelectedRows(
                                      currentUsers.map((request) => request.id)
                                    );
                                  }
                                }}
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              First Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Last Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Phone Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Account Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Approved Role
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {currentUsers.map((request) => (
                            <tr
                              key={request.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="w-12 px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                  checked={selectedRows.includes(request.id)}
                                  onChange={() =>
                                    handleCheckboxChange(request.id)
                                  }
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {request.first_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {request.last_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {request.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {request.department}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {request.phone_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                                  {request.acc_role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {request.approved_acc_role ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                                    {request.approved_acc_role}
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400">
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
                  {actualTotalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={goToPrevious}
                            disabled={currentPage === 1}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
                              currentPage === 1
                                ? "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                                : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            }`}
                          >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                          </button>

                          <div className="flex items-center space-x-1">
                            {getVisiblePages().map((page, index) => (
                              <React.Fragment key={index}>
                                {page === "..." ? (
                                  <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => goToPage(page as number)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                      currentPage === page
                                        ? "bg-orange-500 dark:bg-orange-600 text-white"
                                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                            disabled={currentPage === actualTotalPages}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
                              currentPage === actualTotalPages
                                ? "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                                : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            }`}
                          >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                          </button>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Page {currentPage} of {actualTotalPages}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={handleCancelEdit}
              />

              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Edit User
                    </h3>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={editingUser.first_name || ""}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="First name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={editingUser.last_name || ""}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Last name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editingUser.email || ""}
                          className="w-full px-3 py-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 cursor-not-allowed"
                          disabled
                          placeholder="Email (read-only)"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Email cannot be edited
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={editingUser.department || ""}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Department"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phone_number"
                          value={editingUser.phone_number || ""}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Role
                        </label>
                        <input
                          type="text"
                          name="acc_role"
                          value={editingUser.acc_role || ""}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Account role"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Approved Role
                        </label>
                        <input
                          type="text"
                          name="approved_acc_role"
                          value={editingUser.approved_acc_role || ""}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Approved role (leave empty if not approved)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
              onClick={() => setShowDeleteModal(false)}
            ></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-sm w-full z-50">
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Delete Selected Users
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete **
                      {selectedRows.length}** user records? This action cannot
                      be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-center gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-700 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                  onClick={handleDeleteSelectedRows}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default UsersPage;
