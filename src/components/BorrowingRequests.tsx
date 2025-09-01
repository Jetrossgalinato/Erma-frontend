"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  Trash2,
  RefreshCw,
  FileText,
  AlertTriangle,
  Bell,
} from "lucide-react";

// Define the Request type
interface BorrowingRequest {
  id: string;
  item_name?: string;
  user_name?: string;
  user_id?: string;
  availability?: string;
  request_status?: string;
  return_status?: string;
  purpose?: string;
  start_date?: string;
  end_date?: string;
  date_returned?: string;
  created_at?: string;
  borrowers_id?: string;
  equipments?: {
    name: string;
  };
  account_requests?: {
    first_name: string;
    last_name: string;
  };
}

interface ReturnNotification {
  id: number;
  borrowing_id: number;
  receiver_name: string;
  status: string;
  message: string;
  created_at: string;
  confirmed_at?: string;
  confirmed_by?: string;
  borrowing?: {
    id: number;
    equipments?: {
      name: string;
    };
    account_requests?: {
      first_name: string;
      last_name: string;
    };
  };
}

interface EquipmentData {
  name: string;
}

interface AccountData {
  first_name: string;
  last_name: string;
}

interface BorrowingDataWithRelations {
  id: string;
  borrowed_item: string;
  equipments: EquipmentData | EquipmentData[] | null;
  account_requests: AccountData | AccountData[] | null;
  borrowers_id?: string;
}

const supabase = createClientComponentClient();

export default function BorrowingRequests() {
  const [requests, setRequests] = useState<BorrowingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const [returnNotifications, setReturnNotifications] = useState<
    ReturnNotification[]
  >([]);
  const [showReturnNotifications, setShowReturnNotifications] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 2. Add pagination calculations before the loading check
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  useEffect(() => {
    fetchRequests();
    fetchReturnNotifications();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("borrowing")
        .select(
          `
        *,
        equipments!borrowed_item (
          name
        ),
        account_requests!borrowers_id (
          first_name,
          last_name
        )
      `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to flatten the equipment and user names
      const transformedData =
        data?.map((request) => ({
          ...request,
          item_name: request.equipments?.name,
          user_name: request.account_requests
            ? `${request.account_requests.first_name || ""} ${
                request.account_requests.last_name || ""
              }`.trim()
            : undefined,
        })) || [];

      setRequests(transformedData);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const createEquipmentLog = async (logMessage: string) => {
    try {
      const logEntry = {
        log_message: logMessage,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("equipment_logs").insert(logEntry);

      if (error) throw error;
    } catch (err) {
      console.error("Error creating equipment log:", err);
    }
  };

  const getCurrentAdminUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return "Unknown Admin";

      const { data: adminData, error } = await supabase
        .from("account_requests")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (error || !adminData) return "Unknown Admin";

      return (
        `${adminData.first_name || ""} ${adminData.last_name || ""}`.trim() ||
        "Unknown Admin"
      );
    } catch (err) {
      console.error("Error getting admin user:", err);
      return "Unknown Admin";
    }
  };

  const createNotificationForBorrowers = async (
    title: string,
    message: string,
    borrowingIds: string[]
  ) => {
    try {
      // Get the borrower IDs for the selected requests
      const { data: borrowingData, error: borrowingError } = await supabase
        .from("borrowing")
        .select("borrowers_id")
        .in("id", borrowingIds);

      if (borrowingError) throw borrowingError;

      // Create unique borrower IDs (in case same user has multiple requests)
      const uniqueBorrowerIds = [
        ...new Set(borrowingData?.map((b) => b.borrowers_id) || []),
      ];

      if (uniqueBorrowerIds.length > 0) {
        const notifications = uniqueBorrowerIds.map((borrowerId) => ({
          title,
          message,
          user_id: borrowerId,
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

  const getReturnStatusBadge = (
    requestStatus: string | undefined,
    dateReturned?: string | null
  ) => {
    const status = requestStatus?.toLowerCase();

    // If there's a date_returned value, show as returned
    if (dateReturned) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Returned
        </span>
      );
    }

    if (status === "pending" || status === "rejected") {
      return "-";
    } else if (status === "approved") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not Returned
        </span>
      );
    }
    return "-";
  };

  const fetchReturnNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("return_notifications")
        .select(
          `
        *,
        borrowing!borrowing_id (
          id,
          equipments!borrowed_item (
            name
          ),
          account_requests!borrowers_id (
            first_name,
            last_name
          )
        )
      `
        )
        .eq("status", "pending_confirmation")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReturnNotifications((data as ReturnNotification[]) || []);
    } catch (err) {
      console.error("Error fetching return notifications:", err);
    }
  };

  // In handleConfirmReturn
  const handleConfirmReturn = async (
    notificationId: number,
    borrowingId: number
  ) => {
    try {
      // Get borrower ID first
      const { data: borrowingData, error: fetchError } = await supabase
        .from("borrowing")
        .select("borrowers_id")
        .eq("id", borrowingId)
        .single();

      if (fetchError) throw fetchError;

      // Update borrowing record
      const { error: borrowingError } = await supabase
        .from("borrowing")
        .update({
          date_returned: new Date().toISOString(),
          availability: "Available",
          return_status: "Returned",
        })
        .eq("id", borrowingId);

      if (borrowingError) throw borrowingError;

      // Update notification status
      const { error: notificationError } = await supabase
        .from("return_notifications")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (notificationError) throw notificationError;

      // Create notification for specific borrower
      if (borrowingData?.borrowers_id) {
        await supabase.from("notifications").insert({
          title: "Item Return Confirmed",
          message: "Your item return has been confirmed by admin.",
          user_id: borrowingData.borrowers_id,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }

      // Refresh data
      fetchRequests();
      fetchReturnNotifications();
    } catch (err) {
      console.error("Error confirming return:", err);
      setError("Failed to confirm return");
    }
  };

  const handleRejectReturn = async (notificationId: number) => {
    try {
      // Get borrowing info first
      const { data: returnNotifData, error: fetchError } = await supabase
        .from("return_notifications")
        .select(
          `
        borrowing_id,
        borrowing!borrowing_id (
          borrowers_id
        )
      `
        )
        .eq("id", notificationId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("return_notifications")
        .update({
          status: "rejected",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;

      // Create notification for specific borrower
      if (
        returnNotifData?.borrowing &&
        Array.isArray(returnNotifData.borrowing) &&
        returnNotifData.borrowing[0]?.borrowers_id
      ) {
        await supabase.from("notifications").insert({
          title: "Item Return Rejected",
          message: "Your item return request has been rejected by admin.",
          user_id: returnNotifData.borrowing[0].borrowers_id,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }

      fetchReturnNotifications();
    } catch (err) {
      console.error("Error rejecting return:", err);
      setError("Failed to reject return");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;

    try {
      setLoading(true);

      // Get current admin user
      const adminName = await getCurrentAdminUser();

      // Get equipment details for selected requests
      const { data: borrowingData, error: fetchError } = await supabase
        .from("borrowing")
        .select(
          `
        id, 
        borrowed_item, 
        equipments!borrowed_item(name),
        account_requests!borrowers_id(first_name, last_name)
      `
        )
        .in("id", selectedItems);

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("borrowing")
        .update({
          request_status: "Approved",
          availability: "Borrowed",
        })
        .in("id", selectedItems);

      if (error) throw error;

      // Create equipment logs for each approved request
      if (borrowingData) {
        for (const request of borrowingData as BorrowingDataWithRelations[]) {
          // Handle equipment name with proper type checking
          let equipmentName = "Unknown Item";
          if (request.equipments) {
            if (Array.isArray(request.equipments)) {
              equipmentName = request.equipments[0]?.name || "Unknown Item";
            } else {
              equipmentName = request.equipments.name || "Unknown Item";
            }
          }

          // Handle borrower name with proper type checking
          let borrowerName = "Unknown Borrower";
          if (request.account_requests) {
            if (Array.isArray(request.account_requests)) {
              const borrower = request.account_requests[0];
              borrowerName =
                `${borrower?.first_name || ""} ${
                  borrower?.last_name || ""
                }`.trim() || "Unknown Borrower";
            } else {
              borrowerName =
                `${request.account_requests.first_name || ""} ${
                  request.account_requests.last_name || ""
                }`.trim() || "Unknown Borrower";
            }
          }

          await createEquipmentLog(
            `BORROWING APPROVED: Equipment "${equipmentName}" borrowing request approved by admin ${adminName} for borrower ${borrowerName}.`
          );
        }
      }

      await createNotificationForBorrowers(
        "Borrowing Request Approved",
        `Your borrowing request has been approved by admin.`,
        selectedItems
      );

      // Refresh the data and clear selection
      await fetchRequests();
      setSelectedItems([]);
      setShowActionDropdown(false);
    } catch (err) {
      console.error("Error approving requests:", err);
      setError(
        err instanceof Error ? err.message : "Failed to approve requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.length === 0) return;

    try {
      setLoading(true);

      // Get current admin user
      const adminName = await getCurrentAdminUser();

      // Get equipment details for selected requests
      const { data: borrowingData, error: fetchError } = await supabase
        .from("borrowing")
        .select(
          `
        id, 
        borrowed_item, 
        equipments!borrowed_item(name),
        account_requests!borrowers_id(first_name, last_name)
      `
        )
        .in("id", selectedItems);

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("borrowing")
        .update({ request_status: "Rejected", availability: "Available" })
        .in("id", selectedItems);

      if (error) throw error;

      // Create equipment logs for each rejected request
      if (borrowingData) {
        for (const request of borrowingData as BorrowingDataWithRelations[]) {
          // Handle equipment name with proper type checking
          let equipmentName = "Unknown Item";
          if (request.equipments) {
            if (Array.isArray(request.equipments)) {
              equipmentName = request.equipments[0]?.name || "Unknown Item";
            } else {
              equipmentName = request.equipments.name || "Unknown Item";
            }
          }

          // Handle borrower name with proper type checking
          let borrowerName = "Unknown Borrower";
          if (request.account_requests) {
            if (Array.isArray(request.account_requests)) {
              const borrower = request.account_requests[0];
              borrowerName =
                `${borrower?.first_name || ""} ${
                  borrower?.last_name || ""
                }`.trim() || "Unknown Borrower";
            } else {
              borrowerName =
                `${request.account_requests.first_name || ""} ${
                  request.account_requests.last_name || ""
                }`.trim() || "Unknown Borrower";
            }
          }

          await createEquipmentLog(
            `BORROWING REJECTED: Equipment "${equipmentName}" borrowing request rejected by admin ${adminName} for borrower ${borrowerName}. `
          );
        }
      }

      await createNotificationForBorrowers(
        "Borrowing Request Rejected",
        `Your borrowing request has been rejected by admin.`,
        selectedItems
      );

      // Refresh the data and clear selection
      await fetchRequests();
      setSelectedItems([]);
      setShowActionDropdown(false);
    } catch (err) {
      console.error("Error rejecting requests:", err);
      setError(
        err instanceof Error ? err.message : "Failed to reject requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    setShowDeleteModal(true);
    setShowActionDropdown(false);
  };

  const handleDeleteSelectedRows = async () => {
    if (selectedItems.length === 0) return;

    try {
      setLoading(true);

      // CREATE NOTIFICATIONS BEFORE DELETING THE RECORDS
      await createNotificationForBorrowers(
        "Borrowing Request Deleted",
        `Your borrowing request has been deleted by admin.`,
        selectedItems
      );

      // First, delete related return_notifications to avoid foreign key constraint
      const { error: returnNotifError } = await supabase
        .from("return_notifications")
        .delete()
        .in("borrowing_id", selectedItems);

      if (returnNotifError) throw returnNotifError;

      // Then delete the borrowing requests
      const { error: borrowingError } = await supabase
        .from("borrowing")
        .delete()
        .in("id", selectedItems);

      if (borrowingError) throw borrowingError;

      // Refresh the data and clear selection
      await fetchRequests();
      fetchReturnNotifications(); // Also refresh return notifications
      setSelectedItems([]);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting requests:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Add toggle functions for checkboxes
  const toggleSelectAll = () => {
    const currentPageIds = currentRequests.map((request) => request.id);
    const allCurrentPageSelected = currentPageIds.every((id) =>
      selectedItems.includes(id)
    );

    if (allCurrentPageSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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

  const getStatusBadge = (status: string | undefined) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      available: "bg-green-100 text-green-800",
      borrowed: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };

    const normalizedStatus = status?.toLowerCase();
    const colorClass =
      normalizedStatus &&
      statusColors[normalizedStatus as keyof typeof statusColors]
        ? statusColors[normalizedStatus as keyof typeof statusColors]
        : statusColors.default;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading requests...</span>
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
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading requests
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
            Showing {currentRequests.length} of {requests.length} request
            {requests.length !== 1 ? "s" : ""}
            {totalPages > 1 && (
              <span className="text-gray-500">
                {" "}
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </span>
          {selectedItems.length > 0 && (
            <span className="text-sm text-blue-600">
              {selectedItems.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowActionDropdown(!showActionDropdown)}
              disabled={selectedItems.length === 0}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Actions ({selectedItems.length})
              <ChevronDown className="w-4 h-4" />
            </button>

            {showActionDropdown && selectedItems.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {showActionDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={handleBulkApprove}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                        Approve Selected
                      </button>
                      <button
                        onClick={handleBulkReject}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2"
                      >
                        <X className="w-4 h-4 text-red-600" />
                        Reject Selected
                      </button>

                      <div className="border-t mt-1">
                        <button
                          onClick={handleBulkDelete}
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
            )}
          </div>
          <button
            onClick={fetchRequests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowReturnNotifications(!showReturnNotifications)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative"
          >
            <Bell className="w-4 h-4" />
            Return Notifications
            {returnNotifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {returnNotifications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No requests found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No borrowing requests have been submitted yet.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 w-12 px-6 py-3 text-left border-r border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        currentRequests.length > 0 &&
                        currentRequests.every((request) =>
                          selectedItems.includes(request.id)
                        )
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Item
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Borrower
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Purpose
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Availability
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Return Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Start Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    End Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.map((request, index) => (
                  <tr key={request.id || index} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 w-12 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(request.id)}
                        onChange={() => toggleSelectItem(request.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.item_name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100 text-sm text-gray-900">
                      {request.user_name || request.user_id || "Unknown"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100">
                      <div
                        className="text-sm text-gray-500 truncate max-w-xs"
                        title={request.purpose || "N/A"}
                      >
                        {request.purpose || "N/A"}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100">
                      {getStatusBadge(request.request_status)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100">
                      {getStatusBadge(request.availability)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100 text-sm text-gray-900">
                      {getReturnStatusBadge(
                        request.request_status,
                        request.date_returned
                      )}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100 text-sm text-gray-900">
                      {formatDate(request.start_date)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap border-r border-gray-100 text-sm text-gray-900">
                      {formatDate(request.end_date)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, requests.length)}
                    </span>{" "}
                    of <span className="font-medium">{requests.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full z-50">
            <div className="p-6">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Selected Requests
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete{" "}
                    <strong>{selectedItems.length}</strong> borrowing request
                    {selectedItems.length !== 1 ? "s" : ""}? This action cannot
                    be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                onClick={handleDeleteSelectedRows}
              >
                Delete
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Notifications Modal */}
      {showReturnNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50"
            onClick={() => setShowReturnNotifications(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[80vh] overflow-y-auto z-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Return Notifications ({returnNotifications.length})
                </h3>
                <button
                  onClick={() => setShowReturnNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {returnNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No return notifications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All return requests have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returnNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.borrowing?.equipments?.name ||
                                "Unknown Item"}
                            </h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              Return Request
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Borrower:</strong>{" "}
                            {notification.borrowing?.account_requests
                              ? `${notification.borrowing.account_requests.first_name} ${notification.borrowing.account_requests.last_name}`
                              : "Unknown"}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Receiver:</strong>{" "}
                            {notification.receiver_name}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Message:</strong> {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            <strong>Requested:</strong>{" "}
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() =>
                              handleConfirmReturn(
                                notification.id,
                                notification.borrowing_id
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Confirm
                          </button>
                          <button
                            onClick={() => handleRejectReturn(notification.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
