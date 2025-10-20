"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  User,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import { useRouter } from "next/navigation";
import {
  type AccountRequest,
  type RequestStatus,
  requestStatuses,
  departments,
  roleOptions,
  getDateOptions,
  getStatusColor,
  handleError,
  filterRequests,
  paginateItems,
  fetchAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
  deleteAccountRequest,
  verifyAuth,
} from "./utils/helpers";

export default function AccountRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const [requestedAtOptions] = useState(getDateOptions());
  const [selectedRequestedAt, setSelectedRequestedAt] = useState("All Dates");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = await verifyAuth();

        if (!authData) {
          router.push("/login");
          return;
        }

        console.log("User role:", authData.role);

        // Allow all authenticated users for now
        // TODO: Re-enable role check once we confirm the role structure
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch requests function with FastAPI
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAccountRequests();
      setRequests(data);
    } catch (error) {
      const errorMessage = handleError(error, "fetch requests");
      alert(`Failed to fetch requests: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDeleteModal = (requestId: number) => {
    setRequestToDelete(requestId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setRequestToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (requestToDelete) {
      await handleRemove(requestToDelete);
      closeDeleteModal();
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter and search logic using helper function
  const filteredRequests = useMemo(() => {
    return filterRequests(
      requests,
      searchTerm,
      selectedStatus,
      selectedDepartment,
      selectedRole,
      selectedRequestedAt
    );
  }, [
    searchTerm,
    selectedStatus,
    selectedDepartment,
    selectedRole,
    selectedRequestedAt,
    requests,
  ]);

  const paginatedRequests = useMemo(() => {
    return paginateItems(filteredRequests, currentPage, ITEMS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedStatus,
    selectedDepartment,
    selectedRole,
    selectedRequestedAt,
  ]);

  const handleApprove = async (requestId: number, originalRole: string) => {
    try {
      // Find the request in local state to check is_supervisor and is_intern
      const request = requests.find((r) => r.id === requestId);
      if (!request) {
        throw new Error("Request not found");
      }

      const { is_supervisor, is_intern } = request;

      // Conditionally map or copy role
      const approvedRole =
        !is_supervisor && !is_intern
          ? mapRoleToSystemRole(originalRole)
          : originalRole;

      // Call FastAPI to approve the request
      await approveAccountRequest(requestId, approvedRole);

      // Update local UI
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "Approved" as RequestStatus,
                approved_acc_role: approvedRole,
              }
            : r
        )
      );

      alert(
        `Account approved! Role ${
          is_supervisor || is_intern
            ? "copied as-is"
            : `mapped from "${originalRole}" to "${approvedRole}"`
        }`
      );
    } catch (error) {
      const errorMessage = handleError(error, "approve request");
      alert(`Failed to approve request: ${errorMessage}`);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectAccountRequest(requestId);

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "Rejected" as RequestStatus }
            : request
        )
      );

      alert("Request rejected successfully!");
    } catch (error) {
      const errorMessage = handleError(error, "reject request");
      alert(`Failed to reject request: ${errorMessage}`);
    }
  };

  const handleRemove = async (requestId: number) => {
    try {
      await deleteAccountRequest(requestId);

      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );

      alert("Request removed successfully!");
    } catch (error) {
      const errorMessage = handleError(error, "remove request");
      alert(`Failed to remove request: ${errorMessage}`);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Account Requests Management
              </h1>
              <p className="text-gray-600">
                Review and manage user registration requests for the system
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchRequests}
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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {approvedCount}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {rejectedCount}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters - Updated to include Role filter */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {requestStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter - New */}
              <div className="md:col-span-1">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requested At Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedRequestedAt}
                  onChange={(e) => setSelectedRequestedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {requestedAtOptions.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {(loading || authLoading) && (
            <div className="text-center py-12">
              <RefreshCw
                className={`w-8 h-8 mx-auto text-orange-500 mb-4 animate-spin`}
              />
              <p className="text-gray-600">
                {authLoading
                  ? "Checking authentication..."
                  : "Loading requests..."}
              </p>
            </div>
          )}

          {/* Account Requests Grid - Updated to show role mapping */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {paginatedRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.firstName} {request.lastName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              {request.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {request.department && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Department:</span>{" "}
                          {request.department}
                        </p>
                      )}

                      {request.acc_role && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Requested Role:</span>{" "}
                          {request.acc_role}
                          {request.status === "Pending" &&
                            !(request.is_supervisor || request.is_intern) && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-blue-600">
                                <ArrowRight className="w-3 h-3" />
                                <span>
                                  Will map to:{" "}
                                  {mapRoleToSystemRole(request.acc_role)}
                                </span>
                              </div>
                            )}
                          {request.approved_acc_role &&
                            request.status === "Approved" && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-green-600">
                                <ArrowRight className="w-3 h-3" />
                                <span>
                                  Approved as: {request.approved_acc_role}
                                </span>
                              </div>
                            )}
                        </div>
                      )}

                      {request.phoneNumber && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span>{" "}
                          {request.phoneNumber}
                        </p>
                      )}

                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Requested:</span>{" "}
                        {request.requestedAt}
                      </p>
                    </div>

                    <div className="space-y-2 mt-auto">
                      {request.status === "Pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApprove(request.id, request.acc_role || "")
                            }
                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <UserCheck className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <UserX className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => openDeleteModal(request.id)}
                        className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center justify-center gap-2 group"
                        title="Remove request"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Remove Request</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-2 mb-12 space-x-2">
            {Array.from({
              length: Math.ceil(filteredRequests.length / ITEMS_PER_PAGE),
            }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* No Results */}
          {!loading &&
            filteredRequests.length === 0 &&
            requests.length === 0 && (
              <div className="text-center py-12">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No account requests yet
                </h3>
              </div>
            )}

          {/* No Search Results */}
          {!loading && filteredRequests.length === 0 && requests.length > 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No account requests found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Remove Account Request
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to remove this account request? This
                  action cannot be undone and will permanently delete the
                  request from the system.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
