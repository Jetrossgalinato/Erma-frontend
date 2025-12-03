"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import { useAlert } from "@/contexts/AlertContext";
import { useAuthStore } from "@/store/authStore";
import { useRequestsStore } from "@/store/requestsStore";
import RequestTypeSelector from "./components/RequestTypeSelector";
import ActionButtons from "./components/ActionButtons";
import BorrowingTable from "./components/BorrowingTable";
import BookingTable from "./components/BookingTable";
import AcquiringTable from "./components/AcquiringTable";
import PaginationControls from "./components/PaginationControls";
import EmptyState from "./components/EmptyState";
import SkeletonLoader from "./components/SkeletonLoader";
import {
  fetchBorrowingRequests,
  fetchBookingRequests,
  fetchAcquiringRequests,
  markAsReturned,
  markBookingAsDone,
  deleteRequests,
  loadAllRequestsParallel,
} from "./utils/helpers";

// Lazy load modals (they're only needed when user opens them)
const ReturnModal = dynamic(() => import("./components/ReturnModal"), {
  ssr: false,
});
const DoneModal = dynamic(() => import("./components/DoneModal"), {
  ssr: false,
});
const DeleteModal = dynamic(() => import("./components/DeleteModal"), {
  ssr: false,
});

export default function MyRequestsPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

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

  // Initial parallel data load - Optimized for performance
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    let isMounted = true; // Prevent state updates after unmount

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load ALL request types in parallel with single auth verification
        const results = await loadAllRequestsParallel(
          borrowingPage,
          bookingPage,
          acquiringPage
        );

        // Only update state if component is still mounted
        if (isMounted) {
          setBorrowingRequests(results.borrowing.data);
          setBorrowingTotalPages(results.borrowing.total_pages);
          setBookingRequests(results.booking.data);
          setBookingTotalPages(results.booking.total_pages);
          setAcquiringRequests(results.acquiring.data);
          setAcquiringTotalPages(results.acquiring.total_pages);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        if (isMounted) {
          showAlert({
            type: "error",
            message: "Failed to load requests. Please try again.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [
    isAuthenticated,
    authLoading,
    borrowingPage,
    bookingPage,
    acquiringPage,
    setBorrowingRequests,
    setBorrowingTotalPages,
    setBookingRequests,
    setBookingTotalPages,
    setAcquiringRequests,
    setAcquiringTotalPages,
    setIsLoading,
    showAlert,
  ]);

  // Reload specific request type when page changes (after initial load)
  useEffect(() => {
    // Skip if this is the initial load (handled by loadInitialData above)
    if (!isAuthenticated || authLoading || isLoading) return;

    // Only fetch the current request type when user changes pages
    const reloadCurrentType = async () => {
      try {
        if (currentRequestType === "borrowing") {
          const response = await fetchBorrowingRequests(borrowingPage);
          setBorrowingRequests(response.data);
          setBorrowingTotalPages(response.total_pages);
        } else if (currentRequestType === "booking") {
          const response = await fetchBookingRequests(bookingPage);
          setBookingRequests(response.data);
          setBookingTotalPages(response.total_pages);
        } else {
          const response = await fetchAcquiringRequests(acquiringPage);
          setAcquiringRequests(response.data);
          setAcquiringTotalPages(response.total_pages);
        }
      } catch (error) {
        console.error("Failed to reload current request type:", error);
        showAlert({
          type: "error",
          message: "Failed to load requests. Please try again.",
        });
      }
    };

    reloadCurrentType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRequestType]); // Only re-fetch when user switches tabs

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
      showAlert({
        type: "warning",
        message: "Please enter the receiver's name",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await markAsReturned(selectedIds, receiverName.trim());
      showAlert({
        type: "success",
        message: "Return notification sent successfully!",
      });
      setShowReturnModal(false);
      clearModalForms();
      clearSelection();
      // Reload current data
      const response = await fetchBorrowingRequests(borrowingPage);
      setBorrowingRequests(response.data);
      setBorrowingTotalPages(response.total_pages);
    } catch (error) {
      console.error("Failed to mark as returned:", error);
      showAlert({
        type: "error",
        message: "Failed to submit return notification. Please try again.",
      });
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
      showAlert({
        type: "success",
        message: "Booking marked as done successfully!",
      });
      setShowDoneModal(false);
      clearModalForms();
      clearSelection();
      // Reload current data
      const response = await fetchBookingRequests(bookingPage);
      setBookingRequests(response.data);
      setBookingTotalPages(response.total_pages);
    } catch (error) {
      console.error("Failed to mark as done:", error);
      showAlert({
        type: "error",
        message: "Failed to mark booking as done. Please try again.",
      });
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
      showAlert({
        type: "success",
        message: "Requests deleted successfully!",
      });
      setShowDeleteModal(false);
      clearSelection();

      // Reload current data
      if (currentRequestType === "borrowing") {
        const response = await fetchBorrowingRequests(borrowingPage);
        setBorrowingRequests(response.data);
        setBorrowingTotalPages(response.total_pages);
      } else if (currentRequestType === "booking") {
        const response = await fetchBookingRequests(bookingPage);
        setBookingRequests(response.data);
        setBookingTotalPages(response.total_pages);
      } else {
        const response = await fetchAcquiringRequests(acquiringPage);
        setAcquiringRequests(response.data);
        setAcquiringTotalPages(response.total_pages);
      }
    } catch (error) {
      console.error("Failed to delete requests:", error);
      showAlert({
        type: "error",
        message: "Failed to delete requests. Please try again.",
      });
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
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (currentRequestType === "borrowing") {
        const response = await fetchBorrowingRequests(borrowingPage);
        setBorrowingRequests(response.data);
        setBorrowingTotalPages(response.total_pages);
      } else if (currentRequestType === "booking") {
        const response = await fetchBookingRequests(bookingPage);
        setBookingRequests(response.data);
        setBookingTotalPages(response.total_pages);
      } else {
        const response = await fetchAcquiringRequests(acquiringPage);
        setAcquiringRequests(response.data);
        setAcquiringTotalPages(response.total_pages);
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
      showAlert({
        type: "error",
        message: "Failed to refresh data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
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
                {getCurrentData().length === 0 ? (
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
            </>
          )}
        </div>
      </div>
      <Footer />

      {/* Modals - Always available regardless of loading state */}
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
        itemCount={selectedIds.length}
        itemType="request"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
