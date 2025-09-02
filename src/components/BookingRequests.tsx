"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ChevronDown,
  Check,
  X,
  Trash2,
  Loader2,
  RefreshCw,
  Bell,
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define the BookingRequest type
interface BookingRequest {
  id: string;
  facilities?: {
    id?: string;
    name?: string;
  };
  account_requests?: {
    id?: string;
    first_name?: string;
    last_name?: string;
  };
  user_id?: string;
  status?: string;
  purpose?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
}

interface DoneNotification {
  id: string;
  booking_id: string;
  completion_notes?: string;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
  booking?: {
    id: string;
    facilities?: {
      id: string;
      name: string;
    };
    account_requests?: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
}

// Initialize Supabase client
const supabase = createClientComponentClient();

export default function BookingRequests() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [, setIsDropdownOpen] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [doneNotifications, setDoneNotifications] = useState<
    DoneNotification[]
  >([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          console.error("Auth error:", error);
          return;
        }

        setUser(session.user);

        // Fetch user profile from account_requests table
        const { data: profileData, error: profileError } = await supabase
          .from("account_requests")
          .select("first_name, last_name")
          .eq("user_id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        } else {
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        const { data: profileData, error: profileError } = await supabase
          .from("account_requests")
          .select("first_name, last_name")
          .eq("user_id", session.user.id)
          .single();

        if (!profileError) {
          setUserProfile(profileData);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchDoneNotifications();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("booking")
        .select("*, facilities(name), account_requests(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching booking requests:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDoneNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("done_notifications")
        .select(
          `
        *,
        booking!inner(
          id,
          facilities(name),
          account_requests(first_name, last_name)
        )
      `
        )
        .eq("status", "pending_confirmation")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDoneNotifications((data as DoneNotification[]) || []);
      setNotificationCount(data?.length || 0);
    } catch (err) {
      console.error("Error fetching done notifications:", err);
    }
  };

  const createNotificationForBookers = async (
    title: string,
    message: string,
    bookingIds: string[]
  ) => {
    try {
      // Get the booker IDs for the selected requests
      const { data: bookingData, error: bookingError } = await supabase
        .from("booking")
        .select("bookers_id")
        .in("id", bookingIds);

      if (bookingError) throw bookingError;

      // Create unique booker IDs (in case same user has multiple requests)
      const uniqueBookerIds = [
        ...new Set(bookingData?.map((b) => b.bookers_id) || []),
      ];

      if (uniqueBookerIds.length > 0) {
        const notifications = uniqueBookerIds.map((bookerId) => ({
          title,
          message,
          user_id: bookerId,
          is_read: false,
          created_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) throw error;
      }
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(
        requests.map((request) => request.id).filter(Boolean)
      );
    } else {
      setSelectedRequests([]);
    }
  };

  const handleAction = async (action: "Approve" | "Reject" | "Delete") => {
    if (selectedRequests.length === 0) return;

    try {
      setLoading(true);

      if (action === "Delete") {
        // CREATE NOTIFICATIONS BEFORE DELETING
        await createNotificationForBookers(
          "Booking Request Deleted",
          `Your booking request has been deleted by admin.`,
          selectedRequests
        );

        const { error } = await supabase
          .from("booking")
          .delete()
          .in("id", selectedRequests);

        if (error) throw error;
      } else {
        const status = action === "Approve" ? "Approved" : "Rejected";
        const { error } = await supabase
          .from("booking")
          .update({ status })
          .in("id", selectedRequests);

        if (error) throw error;

        // CREATE NOTIFICATIONS AFTER UPDATING STATUS
        await createNotificationForBookers(
          `Booking Request ${action}d`,
          `Your booking request has been ${action.toLowerCase()}d by admin.`,
          selectedRequests
        );
      }

      // Refresh the data and clear selections
      await fetchRequests();
      setSelectedRequests([]);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationAction = async (
    notificationId: string,
    action: "confirm" | "dismiss"
  ) => {
    try {
      const notification = doneNotifications.find(
        (n) => n.id === notificationId
      );

      if (action === "confirm") {
        // Update the booking status to completed
        if (notification) {
          const { error: bookingError } = await supabase
            .from("booking")
            .update({ status: "Completed" })
            .eq("id", notification.booking_id);

          if (bookingError) throw bookingError;
        }
      }

      // Update notification status
      const { error } = await supabase
        .from("done_notifications")
        .update({
          status: action === "confirm" ? "confirmed" : "dismissed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;

      // SEND NOTIFICATION TO THE BOOKER
      if (notification?.booking_id) {
        const title =
          action === "confirm"
            ? "Booking Completion Confirmed"
            : "Booking Completion Dismissed";
        const message =
          action === "confirm"
            ? "Your booking completion has been confirmed by admin."
            : "Your booking completion notification has been dismissed by admin.";

        await createNotificationForBookers(title, message, [
          notification.booking_id,
        ]);
      }

      // Refresh data
      await fetchDoneNotifications();
      await fetchRequests();
    } catch (err) {
      console.error(`Error ${action}ing notification:`, err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showActionDropdown &&
        !(event.target as Element).closest(".relative")
      ) {
        setShowActionDropdown(false);
      }
      if (
        showNotifications &&
        !(event.target as Element).closest(".relative")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActionDropdown, showNotifications]); // Add showNotifications to dependencies

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests((prev) => [...prev, requestId]);
    } else {
      setSelectedRequests((prev) => prev.filter((id) => id !== requestId));
    }
  };

  const isAllSelected =
    requests.length > 0 && selectedRequests.length === requests.length;
  const isSomeSelected =
    selectedRequests.length > 0 && selectedRequests.length < requests.length;

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };

    const colorClass =
      statusColors[status?.toLowerCase() as keyof typeof statusColors] ||
      statusColors.default;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Add this logging function after your other functions
  const logFacilityBookingAction = async (
    action: string,
    bookingIds: string[],
    additionalInfo?: string
  ) => {
    if (!user || !userProfile) return;

    try {
      // Get booking details for logging
      const { data: bookingData, error: bookingError } = await supabase
        .from("booking")
        .select(
          `
        id,
        facilities(name),
        account_requests(first_name, last_name)
      `
        )
        .in("id", bookingIds);

      if (bookingError) throw bookingError;

      const adminName =
        `${userProfile.first_name} ${userProfile.last_name}`.trim();

      // Create individual log entries for each booking
      const logPromises = bookingData?.map(async (booking) => {
        const bookerName = booking.account_requests
          ? `${booking.account_requests.first_name} ${booking.account_requests.last_name}`.trim()
          : "Unknown User";

        const facilityName = booking.facilities?.name || "Unknown Facility";

        const logMessage = additionalInfo
          ? `Admin ${adminName} ${action} booking request for facility "${facilityName}" by ${bookerName}. ${additionalInfo}`
          : `Admin ${adminName} ${action} booking request for facility "${facilityName}" by ${bookerName}`;

        return supabase.from("facility_logs").insert([
          {
            log_message: logMessage,
            created_at: new Date().toISOString(),
          },
        ]);
      });

      if (logPromises) {
        await Promise.all(logPromises);
      }
    } catch (error) {
      console.error("Error logging facility booking action:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          <span className="ml-3 text-gray-600">
            Loading booking requests...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading booking requests
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchRequests}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {requests.length} booking request{requests.length !== 1 ? "s" : ""}{" "}
            found
          </span>
          {selectedRequests.length > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              {selectedRequests.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowActionDropdown(!showActionDropdown)}
              disabled={selectedRequests.length === 0}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Actions ({selectedRequests.length})
              <ChevronDown className="w-4 h-4" />
            </button>

            {showActionDropdown && selectedRequests.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleAction("Approve")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                    Approve Selected
                  </button>
                  <button
                    onClick={() => handleAction("Reject")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4 text-red-600" />
                    Reject Selected
                  </button>
                  <div className="border-t mt-1">
                    <button
                      onClick={() => handleAction("Delete")}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={fetchRequests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex font-medium transition-colors gap-2 items-center"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative"
            >
              <Bell className="w-4 h-4" />
              Notifications
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">
                    Completion Notifications
                  </h3>
                </div>
                {doneNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No pending notifications
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {doneNotifications.map((notification) => (
                      <div key={notification.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.booking?.facilities?.name ||
                                "Unknown Facility"}
                            </p>
                            <p className="text-xs text-gray-600">
                              By:{" "}
                              {
                                notification.booking?.account_requests
                                  ?.first_name
                              }{" "}
                              {
                                notification.booking?.account_requests
                                  ?.last_name
                              }
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.message}
                        </p>
                        {notification.completion_notes && (
                          <p className="text-xs text-gray-600 italic mb-3">
                            Notes: {notification.completion_notes}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleNotificationAction(
                                notification.id,
                                "confirm"
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              handleNotificationAction(
                                notification.id,
                                "dismiss"
                              )
                            }
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4m0 0V7a2 2 0 01-2 2H10a2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h8a2 2 0 012 2v2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No booking requests found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No facility booking requests have been submitted yet.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id || "")}
                        onChange={(e) =>
                          handleSelectRequest(
                            request.id || "",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.facilities?.name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {request.account_requests
                        ? `${
                            request.account_requests.first_name || "Unknown"
                          } ${request.account_requests.last_name || ""}`.trim()
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {formatDate(request.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {formatDate(request.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>
                          {formatTime(request.start_date)} -{" "}
                          {formatTime(request.end_date)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
