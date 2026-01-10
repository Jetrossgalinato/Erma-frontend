"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useUsersStore } from "@/store/usersStore";
import { useAlert } from "@/contexts/AlertContext";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import {
  fetchUsers,
  updateUser,
  deleteUsers,
  getUniqueDepartments,
  getUniqueRoles,
} from "./utils/helpers";
import { User } from "./utils/helpers";
import PageHeader from "./components/PageHeader";
import ErrorMessage from "./components/ErrorMessage";
import FilterControls from "./components/FilterControls";
import ActionsDropdown from "./components/ActionsDropdown";
import UsersTable from "./components/UsersTable";
import PaginationControls from "./components/PaginationControls";
import EditModal from "./components/EditModal";
import DeleteModal from "./components/DeleteModal";

const UsersPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "department" | "role" | null
  >(null);

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { showAlert } = useAlert();

  const {
    users,
    isLoadingUsers,
    usersPagination,
    departmentFilter,
    roleFilter,
    setUsers,
    setIsLoadingUsers,
    setUsersPagination,
    setDepartmentFilter,
    setRoleFilter,
    clearFilters,
  } = useUsersStore();

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Role-based access control - Only Super Admin can access user management
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      const userRole = user?.role;
      const mappedRole = userRole ? mapRoleToSystemRole(userRole) : null;

      if (mappedRole !== "Super Admin") {
        router.replace("/home");
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch users
  const loadUsers = useCallback(
    async (page = 1, showAnimation = false) => {
      try {
        if (showAnimation) {
          setIsRefreshing(true);
        } else {
          setIsLoadingUsers(true);
        }
        setError(null);

        const response = await fetchUsers({
          page,
          limit: usersPagination.itemsPerPage,
          departmentFilter,
          roleFilter,
          excludeUserId: user?.userId, // Exclude current user
        });

        setUsers(response.users);
        setUsersPagination({
          currentPage: response.page,
          totalCount: response.total_count,
          totalPages: response.total_pages,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load users"
        );
      } finally {
        if (showAnimation) {
          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
        } else {
          setIsLoadingUsers(false);
        }
      }
    },
    [
      usersPagination.itemsPerPage,
      departmentFilter,
      roleFilter,
      user,
      setUsers,
      setIsLoadingUsers,
      setUsersPagination,
    ]
  );

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadUsers(usersPagination.currentPage);
    }
  }, [usersPagination.currentPage, isAuthenticated, authLoading, loadUsers]);

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      loadUsers(usersPagination.currentPage, true);
    }
  }, [isRefreshing, loadUsers, usersPagination.currentPage]);

  const handlePageChange = (page: number) => {
    setUsersPagination({ currentPage: page });
  };

  // Selection handlers
  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === users.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map((user) => user.id));
    }
  };

  // Filter handlers
  const handleFilterSelect = (filterType: "department" | "role") => {
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setUsersPagination({ currentPage: 1 });
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setUsersPagination({ currentPage: 1 });
  };

  const handleClearFilters = () => {
    clearFilters();
    setActiveFilter(null);
  };

  // Edit handlers
  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;
    const userToEdit = users.find((user) => user.id === selectedRows[0]);
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
      showAlert({
        type: "warning",
        message: "First name is required",
      });
      return;
    }

    if (!editingUser.last_name?.trim()) {
      showAlert({
        type: "warning",
        message: "Last name is required",
      });
      return;
    }

    if (!editingUser.department?.trim()) {
      showAlert({
        type: "warning",
        message: "Department is required",
      });
      return;
    }

    try {
      await updateUser(editingUser.id, {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        department: editingUser.department,
        phone_number: editingUser.phone_number,
        acc_role: editingUser.acc_role,
        approved_acc_role: editingUser.approved_acc_role,
        email: editingUser.email,
      });

      setUsers(
        users.map((user) => (user.id === editingUser.id ? editingUser : user))
      );
      setShowEditModal(false);
      setEditingUser(null);
      setSelectedRows([]);

      showAlert({
        type: "success",
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      showAlert({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update user",
      });
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  // Delete handlers
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setShowActionsDropdown(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRows.length === 0) return;

    try {
      await deleteUsers(selectedRows);
      const deletedCount = selectedRows.length;
      setSelectedRows([]);
      loadUsers(usersPagination.currentPage);

      showAlert({
        type: "success",
        message: `Successfully deleted ${deletedCount} user${
          deletedCount > 1 ? "s" : ""
        }`,
      });
    } catch (error) {
      console.error("Error deleting users:", error);
      showAlert({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete users",
      });
    }

    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // Loading state
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
              <div className="mb-8 pt-8 flex items-center justify-between">
                <PageHeader />

                <div className="flex gap-3">
                  <FilterControls
                    departmentFilter={departmentFilter}
                    roleFilter={roleFilter}
                    activeFilter={activeFilter}
                    showFilterDropdown={showFilterDropdown}
                    uniqueDepartments={getUniqueDepartments(users)}
                    uniqueRoles={getUniqueRoles(users)}
                    onDepartmentFilterChange={handleDepartmentFilterChange}
                    onRoleFilterChange={handleRoleFilterChange}
                    onFilterSelect={handleFilterSelect}
                    onToggleFilterDropdown={() =>
                      setShowFilterDropdown(!showFilterDropdown)
                    }
                    onClearFilters={handleClearFilters}
                    setShowFilterDropdown={setShowFilterDropdown}
                  />

                  <ActionsDropdown
                    selectedCount={selectedRows.length}
                    showDropdown={showActionsDropdown}
                    onToggleDropdown={() =>
                      setShowActionsDropdown(!showActionsDropdown)
                    }
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    setShowDropdown={setShowActionsDropdown}
                  />

                  <button
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className={`bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2 ${
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

              {error && (
                <div className="mb-4">
                  <ErrorMessage message={error} />
                </div>
              )}

              {/* Table Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {usersPagination.totalCount} total users
                    {departmentFilter || roleFilter ? " (filtered)" : ""}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <UsersTable
                    users={users}
                    selectedRows={selectedRows}
                    onSelectRow={handleCheckboxChange}
                    onSelectAll={handleSelectAll}
                  />
                </div>

                <PaginationControls
                  currentPage={usersPagination.currentPage}
                  totalCount={usersPagination.totalCount}
                  itemsPerPage={usersPagination.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <EditModal
          user={editingUser}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onChange={handleEditChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        itemCount={selectedRows.length}
        itemType="user"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      {isLoadingUsers && <Loader />}
    </div>
  );
};

export default UsersPage;
