"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  verifyAuth,
  fetchBorrowingRequests,
  fetchBookingRequests,
  fetchAcquiringRequests,
  markAsReturned,
  markBookingAsDone,
  deleteRequests,
  type Borrowing,
  type Booking,
  type Acquiring,
} from "./utils/helpers";

export default function MyRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Request type state
  const [requestType, setRequestType] = useState<
    "borrowing" | "booking" | "acquiring"
  >("borrowing");

  // Data states
  const [borrowingData, setBorrowingData] = useState<Borrowing[]>([]);
  const [borrowingPage, setBorrowingPage] = useState(1);
  const [borrowingTotalPages, setBorrowingTotalPages] = useState(1);

  const [bookingData, setBookingData] = useState<Booking[]>([]);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);

  const [acquiringData, setAcquiringData] = useState<Acquiring[]>([]);
  const [acquiringPage, setAcquiringPage] = useState(1);
  const [acquiringTotalPages, setAcquiringTotalPages] = useState(1);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const [showDoneModal, setShowDoneModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmittingDone, setIsSubmittingDone] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current data based on request type
  const getCurrentData = () => {
    if (requestType === "borrowing") return borrowingData;
    if (requestType === "booking") return bookingData;
    return acquiringData;
  };

  const getCurrentPage = () => {
    if (requestType === "borrowing") return borrowingPage;
    if (requestType === "booking") return bookingPage;
    return acquiringPage;
  };

  const getTotalPages = () => {
    if (requestType === "borrowing") return borrowingTotalPages;
    if (requestType === "booking") return bookingTotalPages;
    return acquiringTotalPages;
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await verifyAuth();
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      setAuthenticated(true);
      setAuthLoading(false);
    };

    checkAuth();
  }, [router]);

  // Fetch functions
  const loadBorrowingRequests = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await fetchBorrowingRequests(page);
      setBorrowingData(response.data);
      setBorrowingTotalPages(response.total_pages);
    } catch (error) {
      console.error("Failed to fetch borrowing requests:", error);
      alert("Failed to load borrowing requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBookingRequests = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await fetchBookingRequests(page);
      setBookingData(response.data);
      setBookingTotalPages(response.total_pages);
    } catch (error) {
      console.error("Failed to fetch booking requests:", error);
      alert("Failed to load booking requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAcquiringRequests = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await fetchAcquiringRequests(page);
      setAcquiringData(response.data);
      setAcquiringTotalPages(response.total_pages);
    } catch (error) {
      console.error("Failed to fetch acquiring requests:", error);
      alert("Failed to load acquiring requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when request type or page changes
  useEffect(() => {
    if (!authenticated) return;

    if (requestType === "borrowing") {
      loadBorrowingRequests(borrowingPage);
    } else if (requestType === "booking") {
      loadBookingRequests(bookingPage);
    } else {
      loadAcquiringRequests(acquiringPage);
    }
  }, [
    authenticated,
    requestType,
    borrowingPage,
    bookingPage,
    acquiringPage,
    loadBorrowingRequests,
    loadBookingRequests,
    loadAcquiringRequests,
  ]);

  // Clear selections when changing request type or page
  useEffect(() => {
    setSelectedIds([]);
  }, [requestType, borrowingPage, bookingPage, acquiringPage]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(getCurrentData().map((req) => req.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
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

    setIsSubmittingReturn(true);
    try {
      await markAsReturned(selectedIds, receiverName.trim());
      alert("Return notification sent successfully!");
      setShowReturnModal(false);
      setReceiverName("");
      setSelectedIds([]);
      loadBorrowingRequests(borrowingPage);
    } catch (error) {
      console.error("Failed to mark as returned:", error);
      alert("Failed to submit return notification. Please try again.");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleMarkDone = () => {
    setShowDoneModal(true);
  };

  const handleSubmitDone = async () => {
    setIsSubmittingDone(true);
    try {
      await markBookingAsDone(selectedIds, completionNotes.trim() || undefined);
      alert("Booking marked as done successfully!");
      setShowDoneModal(false);
      setCompletionNotes("");
      setSelectedIds([]);
      loadBookingRequests(bookingPage);
    } catch (error) {
      console.error("Failed to mark as done:", error);
      alert("Failed to mark booking as done. Please try again.");
    } finally {
      setIsSubmittingDone(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRequests(requestType, selectedIds);
      alert("Requests deleted successfully!");
      setShowDeleteModal(false);
      setSelectedIds([]);

      // Reload current data
      if (requestType === "borrowing") {
        loadBorrowingRequests(borrowingPage);
      } else if (requestType === "booking") {
        loadBookingRequests(bookingPage);
      } else {
        loadAcquiringRequests(acquiringPage);
      }
    } catch (error) {
      console.error("Failed to delete requests:", error);
      alert("Failed to delete requests. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (requestType === "borrowing" && borrowingPage > 1) {
      setBorrowingPage(borrowingPage - 1);
    } else if (requestType === "booking" && bookingPage > 1) {
      setBookingPage(bookingPage - 1);
    } else if (requestType === "acquiring" && acquiringPage > 1) {
      setAcquiringPage(acquiringPage - 1);
    }
  };

  const handleNextPage = () => {
    if (requestType === "borrowing" && borrowingPage < borrowingTotalPages) {
      setBorrowingPage(borrowingPage + 1);
    } else if (requestType === "booking" && bookingPage < bookingTotalPages) {
      setBookingPage(bookingPage + 1);
    } else if (
      requestType === "acquiring" &&
      acquiringPage < acquiringTotalPages
    ) {
      setAcquiringPage(acquiringPage + 1);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    if (requestType === "borrowing") {
      loadBorrowingRequests(borrowingPage);
    } else if (requestType === "booking") {
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
                currentType={requestType}
                onChange={setRequestType}
              />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 justify-center"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <ActionButtons
            requestType={requestType}
            selectedCount={selectedIds.length}
            onMarkReturned={
              requestType === "borrowing" ? handleMarkReturned : undefined
            }
            onMarkDone={requestType === "booking" ? handleMarkDone : undefined}
            onDelete={handleDelete}
          />

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <LoadingState />
            ) : getCurrentData().length === 0 ? (
              <EmptyState requestType={requestType} />
            ) : (
              <>
                {requestType === "borrowing" && (
                  <BorrowingTable
                    requests={borrowingData}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                  />
                )}
                {requestType === "booking" && (
                  <BookingTable
                    requests={bookingData}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                  />
                )}
                {requestType === "acquiring" && (
                  <AcquiringTable
                    requests={acquiringData}
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
        isSubmitting={isSubmittingReturn}
        onReceiverNameChange={setReceiverName}
        onSubmit={handleSubmitReturn}
        onClose={() => {
          setShowReturnModal(false);
          setReceiverName("");
        }}
      />

      <DoneModal
        isOpen={showDoneModal}
        selectedCount={selectedIds.length}
        completionNotes={completionNotes}
        isSubmitting={isSubmittingDone}
        onCompletionNotesChange={setCompletionNotes}
        onSubmit={handleSubmitDone}
        onClose={() => {
          setShowDoneModal(false);
          setCompletionNotes("");
        }}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        selectedCount={selectedIds.length}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
