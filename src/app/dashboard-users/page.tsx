"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useUsersStore } from "@/store/usersStore";
import {
  fetchUsers,
  updateUser,
  deleteUsers,
  getUniqueDepartments,
  getUniqueRoles,
} from "./utils/helpers";
import { User } from "./utils/helpers";
import PageHeader from "./components/PageHeader";
import LoadingState from "./components/LoadingState";
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

  // Auth guard logic
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

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

    try {
      await updateUser(editingUser.id, {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        department: editingUser.department,
        phone_number: editingUser.phone_number,
        acc_role: editingUser.acc_role,
        approved_acc_role: editingUser.approved_acc_role,
      });

      setUsers(
        users.map((user) => (user.id === editingUser.id ? editingUser : user))
      );
      setShowEditModal(false);
      setEditingUser(null);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error instanceof Error ? error.message : "Failed to update user");
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
      setSelectedRows([]);
      loadUsers(usersPagination.currentPage);
    } catch (error) {
      console.error("Error deleting users:", error);
      alert(error instanceof Error ? error.message : "Failed to delete users");
    }

    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // Pagination info
  const startItem =
    (usersPagination.currentPage - 1) * usersPagination.itemsPerPage + 1;
  const endItem = Math.min(
    usersPagination.currentPage * usersPagination.itemsPerPage,
    usersPagination.totalCount
  );

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
              <PageHeader
                onRefresh={handleRefreshClick}
                isRefreshing={isRefreshing}
              />

              {/* Controls Row */}
              <div className="mb-4 flex items-center justify-end gap-3">
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
              </div>

              {error && (
                <div className="mb-4">
                  <ErrorMessage message={error} />
                </div>
              )}

              {/* Table Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {usersPagination.totalCount} total users
                    {departmentFilter || roleFilter ? " (filtered)" : ""}
                  </p>
                  {usersPagination.totalCount > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {startItem} to {endItem} of{" "}
                      {usersPagination.totalCount} results
                    </p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  {isLoadingUsers ? (
                    <LoadingState />
                  ) : (
                    <UsersTable
                      users={users}
                      selectedRows={selectedRows}
                      onSelectRow={handleCheckboxChange}
                      onSelectAll={handleSelectAll}
                    />
                  )}
                </div>

                <PaginationControls
                  currentPage={usersPagination.currentPage}
                  totalPages={usersPagination.totalPages}
                  startItem={startItem}
                  endItem={endItem}
                  totalCount={usersPagination.totalCount}
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
      {showDeleteModal && (
        <DeleteModal
          selectedCount={selectedRows.length}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
};

export default UsersPage;
