"use client";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/authStore";
import { useRequestsStore } from "@/store/requestsStore";
import RequestTypeSelector from "./components/RequestTypeSelector";
import ActionButtons from "./components/ActionButtons";
import BorrowingTable from "./components/BorrowingTable";
import BookingTable from "./components/BookingTable";
import AcquiringTable from "./components/AcquiringTable";
import PaginationControls from "./components/PaginationControls";
import ReturnModal from "./components/ReturnModal";
import DoneModal from "./components/DoneModal";
import DeleteModal from "./components/DeleteModal";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import {
  fetchBorrowingRequests,
  fetchBookingRequests,
  fetchAcquiringRequests,
  markAsReturned,
  markBookingAsDone,
  deleteRequests,
} from "./utils/helpers";

export default function MyRequestsPage() {
  const router = useRouter();

  // Auth store
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Requests store
  const {
    currentRequestType,
    setCurrentRequestType,
    borrowingRequests,
    borrowingPage,
    borrowingTotalPages,
    setBorrowingRequests,
    setBorrowingPage,
    setBorrowingTotalPages,
    bookingRequests,
    bookingPage,
    bookingTotalPages,
    setBookingRequests,
    setBookingPage,
    setBookingTotalPages,
    acquiringRequests,
    acquiringPage,
    acquiringTotalPages,
    setAcquiringRequests,
    setAcquiringPage,
    setAcquiringTotalPages,
    isLoading,
    setIsLoading,
    selectedIds,
    clearSelection,
    selectAll,
    toggleSelection,
    showReturnModal,
    showDoneModal,
    showDeleteModal,
    setShowReturnModal,
    setShowDoneModal,
    setShowDeleteModal,
    receiverName,
    completionNotes,
    setReceiverName,
    setCompletionNotes,
    isSubmitting,
    setIsSubmitting,
    clearModalForms,
  } = useRequestsStore();

  // Get current data based on request type
  const getCurrentData = () => {
    if (currentRequestType === "borrowing") return borrowingRequests;
    if (currentRequestType === "booking") return bookingRequests;
    return acquiringRequests;
  };

  const getCurrentPage = () => {
    if (currentRequestType === "borrowing") return borrowingPage;
    if (currentRequestType === "booking") return bookingPage;
    return acquiringPage;
  };

  const getTotalPages = () => {
    if (currentRequestType === "borrowing") return borrowingTotalPages;
    if (currentRequestType === "booking") return bookingTotalPages;
    return acquiringTotalPages;
  };

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch functions
  const loadBorrowingRequests = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response = await fetchBorrowingRequests(page);
        setBorrowingRequests(response.data);
        setBorrowingTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to fetch borrowing requests:", error);
        alert("Failed to load borrowing requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [setBorrowingRequests, setBorrowingTotalPages, setIsLoading]
  );

  const loadBookingRequests = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response = await fetchBookingRequests(page);
        setBookingRequests(response.data);
        setBookingTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to fetch booking requests:", error);
        alert("Failed to load booking requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [setBookingRequests, setBookingTotalPages, setIsLoading]
  );

  const loadAcquiringRequests = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response = await fetchAcquiringRequests(page);
        setAcquiringRequests(response.data);
        setAcquiringTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to fetch acquiring requests:", error);
        alert("Failed to load acquiring requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [setAcquiringRequests, setAcquiringTotalPages, setIsLoading]
  );

  // Load data when request type or page changes
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    if (currentRequestType === "borrowing") {
      loadBorrowingRequests(borrowingPage);
    } else if (currentRequestType === "booking") {
      loadBookingRequests(bookingPage);
    } else {
      loadAcquiringRequests(acquiringPage);
    }
  }, [
    isAuthenticated,
    authLoading,
    currentRequestType,
    borrowingPage,
    bookingPage,
    acquiringPage,
    loadBorrowingRequests,
    loadBookingRequests,
    loadAcquiringRequests,
  ]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAll(getCurrentData().map((req) => req.id));
    } else {
      clearSelection();
    }
  };

  const handleSelectOne = (id: number) => {
    toggleSelection(id);
  };

  // Action handlers
  const handleMarkReturned = () => {
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async () => {
    if (!receiverName.trim()) {
      alert("Please enter the receiver's name");
      return;
    }

    setIsSubmitting(true);
    try {
      await markAsReturned(selectedIds, receiverName.trim());
      alert("Return notification sent successfully!");
      setShowReturnModal(false);
      clearModalForms();
      clearSelection();
      loadBorrowingRequests(borrowingPage);
    } catch (error) {
      console.error("Failed to mark as returned:", error);
      alert("Failed to submit return notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = () => {
    setShowDoneModal(true);
  };

  const handleSubmitDone = async () => {
    setIsSubmitting(true);
    try {
      await markBookingAsDone(selectedIds, completionNotes.trim() || undefined);
      alert("Booking marked as done successfully!");
      setShowDoneModal(false);
      clearModalForms();
      clearSelection();
      loadBookingRequests(bookingPage);
    } catch (error) {
      console.error("Failed to mark as done:", error);
      alert("Failed to mark booking as done. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteRequests(currentRequestType, selectedIds);
      alert("Requests deleted successfully!");
      setShowDeleteModal(false);
      clearSelection();

      // Reload current data
      if (currentRequestType === "borrowing") {
        loadBorrowingRequests(borrowingPage);
      } else if (currentRequestType === "booking") {
        loadBookingRequests(bookingPage);
      } else {
        loadAcquiringRequests(acquiringPage);
      }
    } catch (error) {
      console.error("Failed to delete requests:", error);
      alert("Failed to delete requests. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentRequestType === "borrowing" && borrowingPage > 1) {
      setBorrowingPage(borrowingPage - 1);
    } else if (currentRequestType === "booking" && bookingPage > 1) {
      setBookingPage(bookingPage - 1);
    } else if (currentRequestType === "acquiring" && acquiringPage > 1) {
      setAcquiringPage(acquiringPage - 1);
    }
  };

  const handleNextPage = () => {
    if (
      currentRequestType === "borrowing" &&
      borrowingPage < borrowingTotalPages
    ) {
      setBorrowingPage(borrowingPage + 1);
    } else if (
      currentRequestType === "booking" &&
      bookingPage < bookingTotalPages
    ) {
      setBookingPage(bookingPage + 1);
    } else if (
      currentRequestType === "acquiring" &&
      acquiringPage < acquiringTotalPages
    ) {
      setAcquiringPage(acquiringPage + 1);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    if (currentRequestType === "borrowing") {
      loadBorrowingRequests(borrowingPage);
    } else if (currentRequestType === "booking") {
      loadBookingRequests(bookingPage);
    } else {
      loadAcquiringRequests(acquiringPage);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingState />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                My Requests
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Track your borrowing, booking, and acquiring requests
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <RequestTypeSelector
                currentType={currentRequestType}
                onChange={setCurrentRequestType}
              />
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 justify-center"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <ActionButtons
            requestType={currentRequestType}
            selectedCount={selectedIds.length}
            onMarkReturned={
              currentRequestType === "borrowing"
                ? handleMarkReturned
                : undefined
            }
            onMarkDone={
              currentRequestType === "booking" ? handleMarkDone : undefined
            }
            onDelete={handleDelete}
          />

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {isLoading ? (
              <LoadingState />
            ) : getCurrentData().length === 0 ? (
              <EmptyState requestType={currentRequestType} />
            ) : (
              <>
                {currentRequestType === "borrowing" && (
                  <BorrowingTable
                    requests={borrowingRequests}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                  />
                )}
                {currentRequestType === "booking" && (
                  <BookingTable
                    requests={bookingRequests}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                  />
                )}
                {currentRequestType === "acquiring" && (
                  <AcquiringTable
                    requests={acquiringRequests}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                  />
                )}
                <PaginationControls
                  currentPage={getCurrentPage()}
                  totalPages={getTotalPages()}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Modals */}
      <ReturnModal
        isOpen={showReturnModal}
        selectedCount={selectedIds.length}
        receiverName={receiverName}
        isSubmitting={isSubmitting}
        onReceiverNameChange={setReceiverName}
        onSubmit={handleSubmitReturn}
        onClose={() => {
          setShowReturnModal(false);
          clearModalForms();
        }}
      />

      <DoneModal
        isOpen={showDoneModal}
        selectedCount={selectedIds.length}
        completionNotes={completionNotes}
        isSubmitting={isSubmitting}
        onCompletionNotesChange={setCompletionNotes}
        onSubmit={handleSubmitDone}
        onClose={() => {
          setShowDoneModal(false);
          clearModalForms();
        }}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        selectedCount={selectedIds.length}
        isDeleting={isSubmitting}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
