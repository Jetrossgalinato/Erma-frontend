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

export default function MyRequestsPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const [borrowingData, setBorrowingData] = useState<Borrowing[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Add modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const [showDoneModal, setShowDoneModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmittingDone, setIsSubmittingDone] = useState(false);

  const [requestType, setRequestType] = useState<"borrowing" | "booking">(
    "borrowing"
  );
  const [bookingData, setBookingData] = useState<Booking[]>([]);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

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

  const fetchBorrowing = useCallback(async () => {
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
      .eq("user_id", user.id) // Assuming auth_id links to the authenticated user
      .single();

    if (accountError || !accountRequest) {
      console.error("Failed to get account request:", accountError);
      setLoading(false);
      return;
    }

    // Filter borrowing data by the account_requests ID
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
      .eq("borrowers_id", accountRequest.id);

    if (error) {
      console.error("Failed to fetch borrowing data:", error);
    } else {
      setBorrowingData(data as Borrowing[]);
    }
    setLoading(false);
  }, [supabase]);

  const fetchBooking = useCallback(async () => {
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
      .eq("bookers_id", accountRequest.id);

    if (error) {
      console.error("Failed to fetch booking data:", error);
    } else {
      setBookingData(data as Booking[]);
    }
    setLoading(false);
  }, [supabase]);

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
        showActionsDropdown &&
        !(event.target as Element).closest(".relative")
      ) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActionsDropdown]);

  const toggleRequestSelection = (requestId: number) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const toggleAllRequests = () => {
    const currentData =
      requestType === "borrowing" ? borrowingData : bookingData;
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
  }, [requestType]);

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
    if (selectedRequests.length === 0) return;

    try {
      const { error } = await supabase
        .from("borrowing")
        .delete()
        .in("id", selectedRequests);

      if (error) {
        console.error("Failed to delete requests:", error);
        // You might want to show a user-friendly error message here
        return;
      }

      // Remove deleted items from local state
      setBorrowingData((prev) =>
        prev.filter((borrowing) => !selectedRequests.includes(borrowing.id))
      );

      // Reset selection after successful deletion
      setSelectedRequests([]);
      setShowActionsDropdown(false);

      console.log("Successfully deleted requests:", selectedRequests);
    } catch (error) {
      console.error("Error deleting requests:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (requestType === "borrowing") {
        fetchBorrowing();
      } else {
        fetchBooking();
      }
    }
  }, [fetchBorrowing, fetchBooking, authLoading, user, requestType]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Requests
              </h1>
              <p className="text-gray-600">
                Track your equipment borrowing requests and their current status
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      {requestType === "borrowing" ? (
                        <>
                          <button
                            onClick={handleBulkReturn}
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            disabled={selectedRequests.length === 0}
                          >
                            <RotateCcw className="w-4 h-4" />
                            Mark as Returned
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                            disabled={selectedRequests.length === 0}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Requests
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleBulkDone}
                            className="w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50 flex items-center gap-2"
                            disabled={selectedRequests.length === 0}
                          >
                            <RotateCcw className="w-4 h-4" />
                            Mark as Done
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                            disabled={selectedRequests.length === 0}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Requests
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  requestType === "borrowing"
                    ? fetchBorrowing()
                    : fetchBooking()
                }
                disabled={loading}
                className="px-4 py-2 cursor-pointer text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="relative">
                <select
                  value={requestType}
                  onChange={(e) => {
                    setRequestType(e.target.value as "borrowing" | "booking");
                  }}
                  className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  <option value="borrowing">Borrowing Requests</option>
                  <option value="booking">Booking Requests</option>
                </select>
                <span className="text-lg font-semibold text-gray-900">
                  (
                  {requestType === "borrowing"
                    ? borrowingData.length
                    : bookingData.length}
                  )
                </span>
              </div>
              <Package className="w-5 h-5 text-gray-500" />
            </div>

            {loading || authLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {authLoading
                    ? "Checking authentication..."
                    : `Loading ${requestType} requests...`}
                </p>
              </div>
            ) : (requestType === "borrowing"
                ? borrowingData.length
                : bookingData.length) === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 text-lg mb-2">
                  No {requestType} requests found
                </p>
                <p className="text-gray-400">
                  Your {requestType} requests will appear here once you make
                  them.
                </p>
              </div>
            ) : requestType === "borrowing" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={
                            borrowingData.length > 0 &&
                            selectedRequests.length === borrowingData.length &&
                            borrowingData.every((item) =>
                              selectedRequests.includes(item.id)
                            )
                          }
                          onChange={toggleAllRequests}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Return Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Date Returned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {borrowingData.map((borrowing) => (
                      <tr key={borrowing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap ">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(borrowing.id)}
                            onChange={() =>
                              toggleRequestSelection(borrowing.id)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>

                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              borrowing.request_status
                            )}`}
                          >
                            {borrowing.request_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          {borrowing.equipments?.name ||
                            `#${borrowing.borrowed_item}`}
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-900 max-w-xs">
                          <div
                            className="truncate"
                            title={borrowing.purpose || "-"}
                          >
                            {borrowing.purpose || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-gray-400" />
                            {borrowing.return_notifications &&
                            borrowing.return_notifications.length > 0
                              ? borrowing.return_notifications[0].receiver_name
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(borrowing.start_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(borrowing.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(borrowing.return_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          {borrowing.date_returned ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-green-500" />
                              {formatDate(borrowing.date_returned)}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not returned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider w-12">
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

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Facility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookingData.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(booking.id)}
                            onChange={() => toggleRequestSelection(booking.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>

                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              booking.status as BorrowingStatus
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          {booking.facilities?.name}
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-900 max-w-xs">
                          <div
                            className="truncate"
                            title={booking.purpose || "-"}
                          >
                            {booking.purpose || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(booking.start_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
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

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                You are about to mark {selectedRequests.length} item(s) as
                returned.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {"Receiver's"} Name *
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Enter the name of person who received the items"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmittingReturn}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReceiverName("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmittingReturn}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={isSubmittingReturn || !receiverName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
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

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                You are about to mark {selectedRequests.length} booking(s) as
                completed.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any completion notes or feedback..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                disabled={isSubmittingDone}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDoneModal(false);
                  setCompletionNotes("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmittingDone}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDone}
                disabled={isSubmittingDone}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
