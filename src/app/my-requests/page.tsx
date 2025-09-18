"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCallback, useState, useEffect } from "react";
import {
  RefreshCw,
  Calendar,
  User,
  X,
  Send,
  Package,
  ChevronDown,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

type BorrowingStatus = "Pending" | "Approved" | "Rejected";

interface Borrowing {
  id: number;
  request_status: BorrowingStatus;
  availability: string;
  purpose: string | null;
  start_date: string | null;
  end_date: string | null;
  return_date: string | null;
  date_returned: string | null;
  return_notifications?: {
    id: number;
    borrowing_id: number;
    receiver_name: string;
    status: string;
    message: string;
  }[];
  borrowers_id: number;
  borrowed_item: number;
  equipments?: {
    id: number;
    name: string;
  };
}

interface Booking {
  id: number;
  status: string;
  purpose: string | null;
  start_date: string | null;
  end_date: string | null;
  bookers_id: number;
  facility_id: number;
  facilities?: {
    id: number;
    name: string;
  };
}

interface Acquiring {
  id: number;
  created_at: string;
  purpose: string | null;
  quantity: number;
  status: string;
  acquirers_id: number;
  supply_id: number;
  supplies?: {
    id: number;
    name: string;
  };
  account_requests?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

// Pagination constants
const PAGE_SIZE = 10;

export default function MyRequestsPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const [borrowingData, setBorrowingData] = useState<Borrowing[]>([]);
  const [borrowingTotal, setBorrowingTotal] = useState(0);
  const [borrowingPage, setBorrowingPage] = useState(1);

  const [bookingData, setBookingData] = useState<Booking[]>([]);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [bookingPage, setBookingPage] = useState(1);

  const [acquiringData, setAcquiringData] = useState<Acquiring[]>([]);
  const [acquiringTotal, setAcquiringTotal] = useState(0);
  const [acquiringPage, setAcquiringPage] = useState(1);

  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Add modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const [showDoneModal, setShowDoneModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmittingDone, setIsSubmittingDone] = useState(false);

  const [requestType, setRequestType] = useState<
    "borrowing" | "booking" | "acquiring"
  >("borrowing");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showRequestTypeDropdown, setShowRequestTypeDropdown] = useState(false);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Pagination helpers
  const currentPage =
    requestType === "borrowing"
      ? borrowingPage
      : requestType === "booking"
      ? bookingPage
      : acquiringPage;

  const totalItems =
    requestType === "borrowing"
      ? borrowingTotal
      : requestType === "booking"
      ? bookingTotal
      : acquiringTotal;

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

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

  const fetchBorrowing = useCallback(
    async (page = borrowingPage) => {
      setLoading(true);

      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Failed to get current user:", userError);
        setLoading(false);
        return;
      }

      // First, get the user's account_requests ID
      const { data: accountRequest, error: accountError } = await supabase
        .from("account_requests")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (accountError || !accountRequest) {
        console.error("Failed to get account request:", accountError);
        setLoading(false);
        return;
      }

      // Get total count
      const { count: total, error: countError } = await supabase
        .from("borrowing")
        .select("id", { count: "exact", head: true })
        .eq("borrowers_id", accountRequest.id);

      if (countError) {
        setLoading(false);
        return;
      }
      setBorrowingTotal(total || 0);

      // Filter borrowing data by the account_requests ID with pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("borrowing")
        .select(
          `
      *,
      equipments!borrowed_item (
        id,
        name
      ),
      return_notifications!borrowing_id (
        id,
        borrowing_id,
        receiver_name,
        status,
        message
      )
      `
        )
        .eq("borrowers_id", accountRequest.id)
        .order("id", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Failed to fetch borrowing data:", error);
      } else {
        setBorrowingData(data as Borrowing[]);
      }
      setLoading(false);
    },
    [supabase, borrowingPage]
  );

  const fetchBooking = useCallback(
    async (page = bookingPage) => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Failed to get current user:", userError);
        setLoading(false);
        return;
      }

      const { data: accountRequest, error: accountError } = await supabase
        .from("account_requests")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (accountError || !accountRequest) {
        console.error("Failed to get account request:", accountError);
        setLoading(false);
        return;
      }

      // Get total count
      const { count: total, error: countError } = await supabase
        .from("booking")
        .select("id", { count: "exact", head: true })
        .eq("bookers_id", accountRequest.id);

      if (countError) {
        setLoading(false);
        return;
      }
      setBookingTotal(total || 0);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("booking")
        .select(
          `
      *,
      facilities (
        id,
        name
      )
    `
        )
        .eq("bookers_id", accountRequest.id)
        .order("id", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Failed to fetch booking data:", error);
      } else {
        setBookingData(data as Booking[]);
      }
      setLoading(false);
    },
    [supabase, bookingPage]
  );

  const fetchAcquiring = useCallback(
    async (page = acquiringPage) => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Failed to get current user:", userError);
        setLoading(false);
        return;
      }

      const { data: accountRequest, error: accountError } = await supabase
        .from("account_requests")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (accountError || !accountRequest) {
        console.error("Failed to get account request:", accountError);
        setLoading(false);
        return;
      }

      // Get total count
      const { count: total, error: countError } = await supabase
        .from("acquiring")
        .select("id", { count: "exact", head: true })
        .eq("acquirers_id", accountRequest.id);

      if (countError) {
        setLoading(false);
        return;
      }
      setAcquiringTotal(total || 0);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("acquiring")
        .select(
          `
      *,
      supplies (
        id,
        name
      ),
      account_requests!acquirers_id (
        id,
        first_name,
        last_name
      )
    `
        )
        .eq("acquirers_id", accountRequest.id)
        .order("id", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Failed to fetch acquiring data:", error);
      } else {
        setAcquiringData(data as Acquiring[]);
      }
      setLoading(false);
    },
    [supabase, acquiringPage]
  );

  const handleBulkDone = async () => {
    setShowDoneModal(true);
    setShowActionsDropdown(false);
  };

  const handleSubmitDone = async () => {
    setIsSubmittingDone(true);

    try {
      // Create done notifications for admin
      const doneNotifications = selectedRequests.map((requestId) => ({
        booking_id: requestId,
        completion_notes: completionNotes.trim() || null,
        status: "pending_confirmation",
        message: `User has marked booking as completed.${
          completionNotes.trim() ? ` Notes: ${completionNotes.trim()}` : ""
        }`,
      }));

      // Insert notifications into done_notifications table
      const { error: notificationError } = await supabase
        .from("done_notifications")
        .insert(doneNotifications);

      if (notificationError) {
        console.error(
          "Failed to create done notifications:",
          notificationError
        );
        alert("Failed to submit completion notification. Please try again.");
        return;
      }

      // Reset modal state
      setShowDoneModal(false);
      setCompletionNotes("");
      setSelectedRequests([]);

      // Refresh booking data
      fetchBooking();

      alert("Completion notification sent to admin for confirmation!");
    } catch (error) {
      console.error("Error submitting completion notification:", error);
      alert("Failed to submit completion notification. Please try again.");
    } finally {
      setIsSubmittingDone(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showRequestTypeDropdown &&
        !(event.target as Element).closest(".request-type-dropdown")
      ) {
        setShowRequestTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRequestTypeDropdown]);

  const toggleRequestSelection = (requestId: number) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const toggleAllRequests = () => {
    const currentData =
      requestType === "borrowing"
        ? borrowingData
        : requestType === "booking"
        ? bookingData
        : acquiringData;
    if (
      selectedRequests.length === currentData.length &&
      currentData.length > 0
    ) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(currentData.map((req) => req.id));
    }
  };

  useEffect(() => {
    setSelectedRequests([]);
    setShowActionsDropdown(false);
  }, [requestType, borrowingPage, bookingPage, acquiringPage]);

  const handleBulkReturn = async () => {
    setShowReturnModal(true);
    setShowActionsDropdown(false);
  };

  const handleSubmitReturn = async () => {
    if (!receiverName.trim()) {
      alert("Please enter the receiver's name");
      return;
    }

    setIsSubmittingReturn(true);

    try {
      // Create return notifications for super admin
      const returnNotifications = selectedRequests.map((requestId) => ({
        borrowing_id: requestId,
        receiver_name: receiverName.trim(),
        status: "pending_confirmation",
        message: `User has marked items as returned. Receiver: ${receiverName.trim()}`,
      }));

      // Insert notifications into a return_notifications table
      const { error } = await supabase
        .from("return_notifications")
        .insert(returnNotifications);

      if (error) {
        console.error("Failed to create return notifications:", error);
        alert("Failed to submit return notification. Please try again.");
        return;
      }

      // Reset modal state
      setShowReturnModal(false);
      setReceiverName("");
      setSelectedRequests([]);

      alert("Return notification sent to admin for confirmation!");
    } catch (error) {
      console.error("Error submitting return:", error);
      alert("Failed to submit return notification. Please try again.");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleBulkDelete = async () => {
    setShowDeleteModal(true);
    setShowActionsDropdown(false);
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (requestType === "borrowing") {
        fetchBorrowing(borrowingPage);
      } else if (requestType === "booking") {
        fetchBooking(bookingPage);
      } else {
        fetchAcquiring(acquiringPage);
      }
    }
  }, [
    fetchBorrowing,
    fetchBooking,
    fetchAcquiring,
    authLoading,
    user,
    requestType,
    borrowingPage,
    bookingPage,
    acquiringPage,
  ]);

  const getStatusColor = (status: BorrowingStatus): string => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleConfirmDelete = async () => {
    if (selectedRequests.length === 0) return;

    setIsDeleting(true);

    try {
      const tableName =
        requestType === "borrowing"
          ? "borrowing"
          : requestType === "booking"
          ? "booking"
          : "acquiring";

      const { error } = await supabase
        .from(tableName)
        .delete()
        .in("id", selectedRequests);

      if (error) {
        console.error("Failed to delete requests:", error);
        alert("Failed to delete requests. Please try again.");
        return;
      }

      // Update the appropriate state
      if (requestType === "borrowing") {
        setBorrowingData((prev) =>
          prev.filter((item) => !selectedRequests.includes(item.id))
        );
        fetchBorrowing(borrowingPage);
      } else if (requestType === "booking") {
        setBookingData((prev) =>
          prev.filter((item) => !selectedRequests.includes(item.id))
        );
        fetchBooking(bookingPage);
      } else {
        setAcquiringData((prev) =>
          prev.filter((item) => !selectedRequests.includes(item.id))
        );
        fetchAcquiring(acquiringPage);
      }

      // Reset selection and close modal
      setSelectedRequests([]);
      setShowDeleteModal(false);
      setShowActionsDropdown(false);

      console.log("Successfully deleted requests:", selectedRequests);
    } catch (error) {
      console.error("Error deleting requests:", error);
      alert("Failed to delete requests. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination controls
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (requestType === "borrowing") setBorrowingPage(page);
    else if (requestType === "booking") setBookingPage(page);
    else setAcquiringPage(page);
  };

  // Reset page when changing request type
  useEffect(() => {
    if (requestType === "borrowing") setBorrowingPage(1);
    else if (requestType === "booking") setBookingPage(1);
    else setAcquiringPage(1);
  }, [requestType]);

  // Pagination UI
  function Pagination() {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
        <div className="text-xs sm:text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-1">
          <button
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 p-2 sm:p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                My Requests
              </h1>
              <p className="text-xs sm:text-base text-gray-600">
                Track your equipment borrowing requests and their current status
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex justify-end mb-2 sm:mb-6 w-full sm:w-auto">
                <div className="relative inline-block text-left request-type-dropdown w-full sm:w-auto">
                  <button
                    onClick={() =>
                      setShowRequestTypeDropdown(!showRequestTypeDropdown)
                    }
                    className="inline-flex items-center justify-between w-full sm:w-48 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {
                      {
                        borrowing: "Borrowing Requests",
                        booking: "Booking Requests",
                        acquiring: "Acquiring Requests",
                      }[requestType]
                    }
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>

                  {showRequestTypeDropdown && (
                    <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        {[
                          { key: "borrowing", label: "Borrowing Requests" },
                          { key: "booking", label: "Booking Requests" },
                          { key: "acquiring", label: "Acquiring Requests" },
                        ].map((type) => (
                          <button
                            key={type.key}
                            onClick={() => {
                              setRequestType(
                                type.key as
                                  | "borrowing"
                                  | "booking"
                                  | "acquiring"
                              );
                              setShowRequestTypeDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-xs sm:text-sm text-left hover:bg-gray-100 ${
                              requestType === type.key
                                ? "bg-orange-50 text-orange-600 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto ${
                      selectedRequests.length > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={selectedRequests.length === 0}
                  >
                    Actions ({selectedRequests.length})
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showActionsDropdown && (
                    <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        {requestType === "borrowing" ? (
                          <>
                            <button
                              onClick={handleBulkReturn}
                              className="w-full px-4 py-2 text-xs sm:text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              disabled={selectedRequests.length === 0}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Mark as Returned
                            </button>
                            <button
                              onClick={handleBulkDelete}
                              className="w-full px-4 py-2 text-xs sm:text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                              disabled={selectedRequests.length === 0}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Requests
                            </button>
                          </>
                        ) : requestType === "booking" ? (
                          <>
                            <button
                              onClick={handleBulkDone}
                              className="w-full px-4 py-2 text-xs sm:text-sm text-left text-green-600 hover:bg-green-50 flex items-center gap-2"
                              disabled={selectedRequests.length === 0}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Mark as Done
                            </button>
                            <button
                              onClick={handleBulkDelete}
                              className="w-full px-4 py-2 text-xs sm:text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                              disabled={selectedRequests.length === 0}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Requests
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setShowActionsDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-xs sm:text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                            disabled={selectedRequests.length === 0}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Requests
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    requestType === "borrowing"
                      ? fetchBorrowing(currentPage)
                      : requestType === "booking"
                      ? fetchBooking(currentPage)
                      : fetchAcquiring(currentPage)
                  }
                  disabled={loading}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 cursor-pointer text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto flex-1 flex flex-col">
            {loading || authLoading ? (
              <div className="p-4 sm:p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p className="text-gray-500 text-xs sm:text-base">
                  {authLoading
                    ? "Checking authentication..."
                    : `Loading ${requestType} requests...`}
                </p>
              </div>
            ) : (requestType === "borrowing"
                ? borrowingData.length
                : requestType === "booking"
                ? bookingData.length
                : acquiringData.length) === 0 ? (
              <div className="p-4 sm:p-8 text-center">
                <Package className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 text-base sm:text-lg mb-2">
                  No {requestType} requests found
                </p>
                <p className="text-gray-400 text-xs sm:text-base">
                  Your {requestType} requests will appear here once you make
                  them.
                </p>
              </div>
            ) : requestType === "borrowing" ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider w-8 sm:w-12">
                          <input
                            type="checkbox"
                            checked={
                              borrowingData.length > 0 &&
                              selectedRequests.length ===
                                borrowingData.length &&
                              borrowingData.every((item) =>
                                selectedRequests.includes(item.id)
                              )
                            }
                            onChange={toggleAllRequests}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Receiver
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Return Date
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Date Returned
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Availability
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {borrowingData.map((borrowing) => (
                        <tr key={borrowing.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap ">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(borrowing.id)}
                              onChange={() =>
                                toggleRequestSelection(borrowing.id)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                borrowing.request_status
                              )}`}
                            >
                              {borrowing.request_status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            {borrowing.equipments?.name ||
                              `#${borrowing.borrowed_item}`}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 text-gray-900 max-w-xs">
                            <div
                              className="truncate"
                              title={borrowing.purpose || "-"}
                            >
                              {borrowing.purpose || "-"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-gray-400" />
                              {borrowing.return_notifications &&
                              borrowing.return_notifications.length > 0
                                ? borrowing.return_notifications[0]
                                    .receiver_name
                                : "-"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(borrowing.start_date)}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(borrowing.end_date)}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(borrowing.return_date)}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            {borrowing.date_returned ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-green-500" />
                                {formatDate(borrowing.date_returned)}
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                Not returned
                              </span>
                            )}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-900">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                borrowing.availability === "Available"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {borrowing.availability}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination />
              </>
            ) : requestType === "booking" ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider w-8 sm:w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedRequests.length === bookingData.length &&
                              bookingData.length > 0
                            }
                            onChange={toggleAllRequests}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookingData.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(booking.id)}
                              onChange={() =>
                                toggleRequestSelection(booking.id)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                booking.status as BorrowingStatus
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            {booking.facilities?.name}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 text-gray-900 max-w-xs">
                            <div
                              className="truncate"
                              title={booking.purpose || "-"}
                            >
                              {booking.purpose || "-"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(booking.start_date)}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(booking.end_date)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination />
              </>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider w-8 sm:w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedRequests.length ===
                                acquiringData.length && acquiringData.length > 0
                            }
                            onChange={toggleAllRequests}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Supply
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {acquiringData.map((acquiring) => (
                        <tr key={acquiring.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(acquiring.id)}
                              onChange={() =>
                                toggleRequestSelection(acquiring.id)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                acquiring.status as BorrowingStatus
                              )}`}
                            >
                              {acquiring.status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            {acquiring.supplies?.name ||
                              `#${acquiring.supply_id}`}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 whitespace-nowrap text-gray-900">
                            {acquiring.quantity}
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 border-r border-gray-200 text-gray-900 max-w-xs">
                            <div
                              className="truncate"
                              title={acquiring.purpose || "-"}
                            >
                              {acquiring.purpose || "-"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-900">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(acquiring.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {/* Modals */}
      {showReturnModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Mark Items as Returned
              </h3>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReceiverName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-2 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                You are about to mark {selectedRequests.length} item(s) as
                returned.
              </p>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {"Receiver's"} Name *
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Enter the name of person who received the items"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmittingReturn}
              />
            </div>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReceiverName("");
                }}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmittingReturn}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={isSubmittingReturn || !receiverName.trim()}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReturn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSubmittingReturn ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDoneModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Mark Booking(s) as Done
              </h3>
              <button
                onClick={() => {
                  setShowDoneModal(false);
                  setCompletionNotes("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-2 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                You are about to mark {selectedRequests.length} booking(s) as
                completed.
              </p>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Completion Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any completion notes or feedback..."
                rows={3}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                disabled={isSubmittingDone}
              />
            </div>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDoneModal(false);
                  setCompletionNotes("");
                }}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmittingDone}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDone}
                disabled={isSubmittingDone}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingDone ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {isSubmittingDone ? "Updating..." : "Mark as Done"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Delete Requests
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-600">
                Are you sure you want to delete {selectedRequests.length}{" "}
                selected request(s)? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sticky Footer */}
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
        }
        body {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        #__next > div {
          flex: 1 0 auto;
        }
        footer {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
