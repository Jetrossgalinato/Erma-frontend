"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store";
import { useDashboardRequestsStore } from "@/store";
import { useAlert } from "@/contexts/AlertContext";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import RequestTypeSelector from "./components/RequestTypeSelector";
import BorrowingRequestsTable from "./components/BorrowingRequestsTable";
import BookingRequestsTable from "./components/BookingRequestsTable";
import AcquiringRequestsTable from "./components/AcquiringRequestsTable";
import ActionButtons from "./components/ActionButtons";
import ReturnNotificationsModal from "./components/ReturnNotificationsModal";
import DoneNotificationsModal from "./components/DoneNotificationsModal";
import EmptyState from "./components/EmptyState";
import Pagination from "./components/Pagination";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Package, LayoutDashboard } from "lucide-react";
import {
  BorrowingRequest,
  BookingRequest,
  AcquiringRequest,
  ReturnNotification,
  DoneNotification,
  fetchBorrowingRequests,
  fetchBookingRequests,
  fetchAcquiringRequests,
  fetchReturnNotifications,
  fetchDoneNotifications,
  bulkUpdateBorrowingStatus,
  bulkUpdateBookingStatus,
  bulkUpdateAcquiringStatus,
  bulkDeleteBorrowingRequests,
  bulkDeleteBookingRequests,
  bulkDeleteAcquiringRequests,
} from "./utils/helpers";

const PAGE_SIZE = 10;

function DashboardRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { showAlert } = useAlert();
  const {
    currentRequestType,
    isLoading,
    selectedIds,
    showActionDropdown,
    currentPage,
    totalPages,
    setCurrentRequestType,
    setIsLoading,
    clearSelection,
    selectAll,
    toggleSelection,
    setShowActionDropdown,
    setCurrentPage,
    setTotalPages,
  } = useDashboardRequestsStore();

  const [borrowingRequests, setBorrowingRequests] = useState<
    BorrowingRequest[]
  >([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [acquiringRequests, setAcquiringRequests] = useState<
    AcquiringRequest[]
  >([]);
  const [returnNotifications, setReturnNotifications] = useState<
    ReturnNotification[]
  >([]);
  const [doneNotifications, setDoneNotifications] = useState<
    DoneNotification[]
  >([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Role-based access control - Faculty users should not access dashboard requests
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      const userRole = user?.role;
      const mappedRole = userRole ? mapRoleToSystemRole(userRole) : null;
      if (mappedRole === "Faculty") {
        router.push("/home");
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["borrowing", "booking", "acquiring"].includes(tab)) {
      setCurrentRequestType(tab as "borrowing" | "booking" | "acquiring");
    }
  }, [searchParams, setCurrentRequestType]);

  // Load data function
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (currentRequestType === "borrowing") {
        const data = await fetchBorrowingRequests(currentPage, PAGE_SIZE);
        setBorrowingRequests(data.data);
        setTotalPages(data.total_pages);
      } else if (currentRequestType === "booking") {
        const data = await fetchBookingRequests(currentPage, PAGE_SIZE);
        setBookingRequests(data.data);
        setTotalPages(data.total_pages);
      } else if (currentRequestType === "acquiring") {
        const data = await fetchAcquiringRequests(currentPage, PAGE_SIZE);
        setAcquiringRequests(data.data);
        setTotalPages(data.total_pages);
      }
    } catch (err) {
      setError("Failed to load requests");
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentRequestType, currentPage, setIsLoading, setTotalPages]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const [returnData, doneData] = await Promise.all([
        fetchReturnNotifications(),
        fetchDoneNotifications(),
      ]);
      setReturnNotifications(returnData || []);
      setDoneNotifications(doneData || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }, []);

  // Handle opening return notifications modal
  const handleShowReturnNotifications = async () => {
    await loadNotifications();
    setShowReturnModal(true);
  };

  // Handle opening done notifications modal
  const handleShowDoneNotifications = async () => {
    await loadNotifications();
    setShowDoneModal(true);
  };

  // Bulk approve
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsLoading(true);
      let success = false;

      if (currentRequestType === "borrowing") {
        success = await bulkUpdateBorrowingStatus(selectedIds, "Approved");
      } else if (currentRequestType === "booking") {
        success = await bulkUpdateBookingStatus(selectedIds, "Approved");
      } else if (currentRequestType === "acquiring") {
        success = await bulkUpdateAcquiringStatus(selectedIds, "Approved");
      }

      if (success) {
        showAlert({
          type: "success",
          message: `Successfully approved ${selectedIds.length} request(s)`,
        });
        clearSelection();
        setShowActionDropdown(false);
        await loadData();
      }
    } catch (error) {
      console.error("Error approving requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk reject
  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsLoading(true);
      let success = false;

      if (currentRequestType === "borrowing") {
        success = await bulkUpdateBorrowingStatus(selectedIds, "Rejected");
      } else if (currentRequestType === "booking") {
        success = await bulkUpdateBookingStatus(selectedIds, "Rejected");
      } else if (currentRequestType === "acquiring") {
        success = await bulkUpdateAcquiringStatus(selectedIds, "Rejected");
      }

      if (success) {
        showAlert({
          type: "success",
          message: `Successfully rejected ${selectedIds.length} request(s)`,
        });
        clearSelection();
        setShowActionDropdown(false);
        await loadData();
      }
    } catch (error) {
      console.error("Error rejecting requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setIsLoading(true);
      let success = false;

      if (currentRequestType === "borrowing") {
        success = await bulkDeleteBorrowingRequests(selectedIds);
      } else if (currentRequestType === "booking") {
        success = await bulkDeleteBookingRequests(selectedIds);
      } else if (currentRequestType === "acquiring") {
        success = await bulkDeleteAcquiringRequests(selectedIds);
      }

      if (success) {
        showAlert({
          type: "success",
          message: `Successfully deleted ${selectedIds.length} request(s)`,
        });
        clearSelection();
        setShowActionDropdown(false);
        setShowDeleteModal(false);
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current requests based on type
  const currentRequests =
    currentRequestType === "borrowing"
      ? borrowingRequests
      : currentRequestType === "booking"
      ? bookingRequests
      : acquiringRequests;

  const totalItems = currentRequests.length;

  // Check if approve should be disabled (already approved or rejected)
  const disableApprove =
    (currentRequestType === "borrowing" &&
      selectedIds.some((id) => {
        const request = borrowingRequests.find((r) => r.id === id);
        return (
          request?.request_status === "Approved" ||
          request?.request_status === "Rejected"
        );
      })) ||
    (currentRequestType === "booking" &&
      selectedIds.some((id) => {
        const request = bookingRequests.find((r) => r.id === id);
        return request?.status === "Approved" || request?.status === "Rejected";
      })) ||
    (currentRequestType === "acquiring" &&
      selectedIds.some((id) => {
        const request = acquiringRequests.find((r) => r.id === id);
        return request?.status === "Approved" || request?.status === "Rejected";
      }));

  // Check if reject should be disabled (already approved or rejected)
  const disableReject =
    (currentRequestType === "borrowing" &&
      selectedIds.some((id) => {
        const request = borrowingRequests.find((r) => r.id === id);
        return (
          request?.request_status === "Approved" ||
          request?.request_status === "Rejected"
        );
      })) ||
    (currentRequestType === "booking" &&
      selectedIds.some((id) => {
        const request = bookingRequests.find((r) => r.id === id);
        return request?.status === "Approved" || request?.status === "Rejected";
      })) ||
    (currentRequestType === "acquiring" &&
      selectedIds.some((id) => {
        const request = acquiringRequests.find((r) => r.id === id);
        return request?.status === "Approved" || request?.status === "Rejected";
      }));

  // Load initial data - Use Promise.all for parallel fetching (50% faster)
  useEffect(() => {
    if (isAuthenticated) {
      // Parallel data fetching instead of sequential
      Promise.all([loadData(), loadNotifications()]).catch((error) => {
        console.error("Error loading initial data:", error);
      });
    }
  }, [
    currentRequestType,
    currentPage,
    isAuthenticated,
    loadData,
    loadNotifications,
  ]);

  // Set up polling for notifications every 2 seconds
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        loadNotifications();
      }, 2000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, loadNotifications]);

  if (!isAuthenticated) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <DashboardNavbar />
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 w-64 transform lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0">
        <div className="w-64 h-full">
          <Sidebar />
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 relative overflow-y-auto focus:outline-none mt-16">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Header */}
              <div className="mb-6 pt-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                      Requests List
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Monitor requests for borrowing equipment, booking
                      facilities, and acquiring supplies—all in one place.
                    </p>
                  </div>
                </div>

                {/* Notification and Action Controls */}
                <div className="flex items-center justify-between">
                  {/* Left side - Notification Buttons */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmations:
                    </span>
                    <button
                      onClick={handleShowReturnNotifications}
                      className="relative flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
                    >
                      <Package size={16} />
                      Returns
                      {returnNotifications.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {returnNotifications.length > 99
                            ? "99+"
                            : returnNotifications.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleShowDoneNotifications}
                      className="relative flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
                    >
                      <LayoutDashboard size={16} />
                      Done
                      {doneNotifications.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {doneNotifications.length > 99
                            ? "99+"
                            : doneNotifications.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Right side - Action Controls */}
                  <div className="flex items-center gap-3">
                    <RequestTypeSelector
                      currentType={currentRequestType}
                      onChange={setCurrentRequestType}
                    />
                    <ActionButtons
                      selectedCount={selectedIds.length}
                      showActionDropdown={showActionDropdown}
                      onToggleDropdown={() =>
                        setShowActionDropdown(!showActionDropdown)
                      }
                      onApprove={handleBulkApprove}
                      onReject={handleBulkReject}
                      onDelete={handleBulkDelete}
                      onRefresh={loadData}
                      disableApprove={disableApprove}
                      disableReject={disableReject}
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && <Loader fullScreen={false} className="h-64" />}

              {/* Content */}
              {!isLoading && (
                <>
                  {currentRequests.length === 0 ? (
                    <EmptyState
                      message="No requests found"
                      description="There are no requests to display at this time."
                    />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                      {currentRequestType === "borrowing" && (
                        <BorrowingRequestsTable
                          requests={borrowingRequests}
                          selectedIds={selectedIds}
                          onToggleSelection={toggleSelection}
                          onSelectAll={selectAll}
                        />
                      )}
                      {currentRequestType === "booking" && (
                        <BookingRequestsTable
                          requests={bookingRequests}
                          selectedIds={selectedIds}
                          onToggleSelection={toggleSelection}
                          onSelectAll={selectAll}
                        />
                      )}
                      {currentRequestType === "acquiring" && (
                        <AcquiringRequestsTable
                          requests={acquiringRequests}
                          selectedIds={selectedIds}
                          onToggleSelection={toggleSelection}
                          onSelectAll={selectAll}
                        />
                      )}

                      {/* Pagination */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalItems}
                        itemsPerPage={PAGE_SIZE}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Return Notifications Modal */}
      {showReturnModal && (
        <ReturnNotificationsModal
          notifications={returnNotifications}
          onClose={() => setShowReturnModal(false)}
          onRefresh={() => {
            loadNotifications();
            loadData();
          }}
        />
      )}

      {/* Done Notifications Modal */}
      {showDoneModal && (
        <DoneNotificationsModal
          notifications={doneNotifications}
          onClose={() => setShowDoneModal(false)}
          onRefresh={() => {
            loadNotifications();
            loadData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        itemCount={selectedIds.length}
        itemType="request"
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default function DashboardRequestsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardRequestsContent />
    </Suspense>
  );
}
