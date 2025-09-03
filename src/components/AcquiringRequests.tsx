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
} from "lucide-react";

// Define the AcquiringRequest type
interface AcquiringRequest {
  id: string;
  user_id?: string;
  acquirers_id?: string; // Added this field that's used in notifications
  status?: string;
  quantity?: number;
  purpose?: string;
  created_at?: string;
  account_requests?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  supplies?: {
    id: string;
    name: string;
    quantity: number;
    facilities?: {
      id: string;
      name: string;
    };
  };
}

// Initialize Supabase client
const supabase = createClientComponentClient();

export default function AcquiringRequests() {
  const [requests, setRequests] = useState<AcquiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    first_name?: string;
    last_name?: string;
  } | null>(null);

  // Add logging function
  const logSupplyAction = async (action: string, details: string) => {
    try {
      const adminName =
        currentUser?.first_name && currentUser?.last_name
          ? `${currentUser.first_name} ${currentUser.last_name}`
          : "Unknown Admin";

      const logMessage = `${action} by ${adminName} ${details}`;

      const {
        data: {},
      } = await supabase.auth.getUser();

      await supabase.from("supply_logs").insert([
        {
          log_message: logMessage,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error logging supply action:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("account_requests")
            .select("first_name, last_name")
            .eq("user_id", user.id)
            .single();

          if (profile) {
            setCurrentUser(profile);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("acquiring")
        .select(
          `
          *,
          supplies(
            id,
            name,
            quantity,
            facilities(id, name)
          ),
          account_requests:account_requests!acquiring_acquirers_id_fkey (
            user_id,
            first_name,
            last_name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching acquiring requests:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const createNotificationForAcquirers = async (
    title: string,
    message: string,
    acquiringIds: string[]
  ) => {
    try {
      // Get the user IDs for the selected requests
      const { data: acquiringData, error: acquiringError } = await supabase
        .from("acquiring")
        .select("acquirers_id") // Include both possible user ID fields
        .in("id", acquiringIds);

      if (acquiringError) throw acquiringError;

      // Create unique user IDs (use acquirers_id if available, fallback to user_id)
      const uniqueUserIds = [
        ...new Set(
          acquiringData
            ?.map((a) => a.acquirers_id || a.acquirers_id)
            .filter(Boolean) || []
        ),
      ];

      if (uniqueUserIds.length > 0) {
        const notifications = uniqueUserIds.map((userId) => ({
          title,
          message,
          user_id: userId,
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

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      ordered: "bg-blue-100 text-blue-800",
      received: "bg-purple-100 text-purple-800",
    };

    const normalizedStatus = status?.toLowerCase();
    const colorClass =
      statusColors[normalizedStatus as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800";

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(
        requests.map((request) => request.id).filter(Boolean)
      );
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests((prev) => [...prev, requestId]);
    } else {
      setSelectedRequests((prev) => prev.filter((id) => id !== requestId));
    }
  };

  const handleAction = async (action: "Approve" | "Reject" | "Delete") => {
    if (selectedRequests.length === 0) return;

    try {
      setLoading(true);

      if (action === "Delete") {
        // CREATE NOTIFICATIONS BEFORE DELETING
        await createNotificationForAcquirers(
          "Acquiring Request Deleted",
          `Your supply acquiring request has been deleted by admin.`,
          selectedRequests
        );

        const requestsToDelete = requests.filter((req) =>
          selectedRequests.includes(req.id)
        );

        const deletedRequestsInfo = requestsToDelete
          .map(
            (req) =>
              `${req.supplies?.name || "Unknown Supply"} (requested by ${
                req.account_requests
                  ? `${req.account_requests.first_name} ${req.account_requests.last_name}`
                  : "Unknown User"
              })`
          )
          .join(", ");

        await logSupplyAction(
          `${selectedRequests.length} acquiring request(s) were deleted:`,
          `${deletedRequestsInfo}`
        );

        const { error } = await supabase
          .from("acquiring")
          .delete()
          .in("id", selectedRequests);

        if (error) throw error;
      } else if (action === "Approve") {
        // First, get the requests to approve with their supply info
        const { data: requestsToApprove, error: fetchError } = await supabase
          .from("acquiring")
          .select(
            `
          id,
          quantity,
          acquirers_id,
          supplies!inner (
            id,
            quantity
          )
        `
          )
          .in("id", selectedRequests);

        if (fetchError) throw fetchError;

        // Update acquiring requests status
        const { error: updateError } = await supabase
          .from("acquiring")
          .update({ status: "Approved" })
          .in("id", selectedRequests);

        if (updateError) throw updateError;

        // Update supplies quantities
        for (const request of requestsToApprove || []) {
          if (!request.supplies) continue;

          const supply = Array.isArray(request.supplies)
            ? request.supplies[0]
            : request.supplies;
          const newQuantity = (supply?.quantity || 0) - (request.quantity || 0);

          if (newQuantity < 0) {
            throw new Error(
              `Insufficient quantity for supply. Available: ${supply?.quantity}, Requested: ${request.quantity}`
            );
          }

          const { error: supplyError } = await supabase
            .from("supplies")
            .update({ quantity: newQuantity })
            .eq("id", supply.id);

          if (supplyError) throw supplyError;
        }

        const requestsForApproval = requests.filter((req) =>
          selectedRequests.includes(req.id)
        );

        const approvedRequestsInfo = requestsForApproval
          .map(
            (req) =>
              `${req.supplies?.name || "Unknown Supply"} (quantity: ${
                req.quantity
              }, requested by ${
                req.account_requests
                  ? `${req.account_requests.first_name} ${req.account_requests.last_name}`
                  : "Unknown User"
              })`
          )
          .join(", ");

        await logSupplyAction(
          `${selectedRequests.length} acquiring request(s) were approved:`,
          `${approvedRequestsInfo}`
        );

        // CREATE NOTIFICATIONS AFTER APPROVAL
        await createNotificationForAcquirers(
          "Acquiring Request Approved",
          `Your supply acquiring request has been approved by admin.`,
          selectedRequests
        );
      } else {
        // Reject case
        const status = "Rejected";
        const { error } = await supabase
          .from("acquiring")
          .update({ status })
          .in("id", selectedRequests);

        if (error) throw error;

        // CREATE NOTIFICATIONS AFTER REJECTION
        await createNotificationForAcquirers(
          "Acquiring Request Rejected",
          `Your supply acquiring request has been rejected by admin.`,
          selectedRequests
        );

        const requestsToReject = requests.filter((req) =>
          selectedRequests.includes(req.id)
        );

        const rejectedRequestsInfo = requestsToReject
          .map(
            (req) =>
              `${req.supplies?.name || "Unknown Supply"} (requested by ${
                req.account_requests
                  ? `${req.account_requests.first_name} ${req.account_requests.last_name}`
                  : "Unknown User"
              })`
          )
          .join(", ");

        await logSupplyAction(
          `${selectedRequests.length} acquiring request(s) were rejected:`,
          `${rejectedRequestsInfo}`
        );
      }

      // Refresh the data and clear selections
      await fetchRequests();
      setSelectedRequests([]);
      setShowActionDropdown(false);
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect for handling click outside:
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showActionDropdown &&
        !(event.target as Element).closest(".relative")
      ) {
        setShowActionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActionDropdown]);

  // Add these helper variables:
  const isAllSelected =
    requests.length > 0 && selectedRequests.length === requests.length;
  const isSomeSelected =
    selectedRequests.length > 0 && selectedRequests.length < requests.length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <span className="ml-3 text-gray-600">
            Loading acquiring requests...
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
                Error loading acquiring requests
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
            {requests.length} acquiring request
            {requests.length !== 1 ? "s" : ""} found
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
              d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2H10a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No acquiring requests found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No supply acquisition requests have been submitted yet.
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
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
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
                          {request.supplies?.name || "N/A"}
                        </div>
                        {request.purpose && (
                          <div
                            className="text-sm text-gray-500 truncate max-w-xs"
                            title={request.purpose}
                          >
                            {request.purpose}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {request.account_requests
                        ? `${request.account_requests.first_name} ${request.account_requests.last_name}`
                        : request.acquirers_id || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {request.quantity || "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {request.purpose || "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {request.supplies?.facilities?.name || "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.created_at)}
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
