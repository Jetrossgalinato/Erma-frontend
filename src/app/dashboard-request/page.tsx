"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store";
import { useDashboardRequestsStore } from "@/store";
import RequestTypeSelector from "./components/RequestTypeSelector";
import BorrowingRequestsTable from "./components/BorrowingRequestsTable";
import BookingRequestsTable from "./components/BookingRequestsTable";
import AcquiringRequestsTable from "./components/AcquiringRequestsTable";
import ActionButtons from "./components/ActionButtons";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import Pagination from "./components/Pagination";
import {
  BorrowingRequest,
  BookingRequest,
  AcquiringRequest,
  fetchBorrowingRequests,
  fetchBookingRequests,
  fetchAcquiringRequests,
  bulkUpdateBorrowingStatus,
  bulkUpdateBookingStatus,
  bulkUpdateAcquiringStatus,
  bulkDeleteBorrowingRequests,
  bulkDeleteBookingRequests,
  bulkDeleteAcquiringRequests,
} from "./utils/helpers";

const PAGE_SIZE = 10;

export default function DashboardRequestsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
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
  const [error, setError] = useState<string | null>(null);

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
        alert(`Successfully approved ${selectedIds.length} request(s)`);
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
        alert(`Successfully rejected ${selectedIds.length} request(s)`);
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
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} request(s)?`
      )
    ) {
      return;
    }

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
        alert(`Successfully deleted ${selectedIds.length} request(s)`);
        clearSelection();
        setShowActionDropdown(false);
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

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  // Fetch data based on current request type
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [currentRequestType, currentPage, isAuthenticated, loadData]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500 dark:text-gray-300">Loading...</span>
      </div>
    );
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
              <div className="mb-8 pt-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    Requests List
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Monitor requests for borrowing equipment, booking
                    facilities, and acquiring supplies—all in one place.
                  </p>
                </div>
                <div className="flex items-center gap-4">
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
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && <LoadingState />}

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
    </div>
  );
}
