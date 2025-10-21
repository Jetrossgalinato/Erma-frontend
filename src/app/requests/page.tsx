"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, User, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import { useRouter } from "next/navigation";
import StatisticsCards from "./components/StatisticsCards";
import FilterControls from "./components/FilterControls";
import RequestCard from "./components/RequestCard";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import {
  type AccountRequest,
  type RequestStatus,
  requestStatuses,
  departments,
  roleOptions,
  getDateOptions,
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
          <StatisticsCards
            pendingCount={pendingCount}
            approvedCount={approvedCount}
            rejectedCount={rejectedCount}
          />

          {/* Search and Filters */}
          <FilterControls
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            selectedDepartment={selectedDepartment}
            selectedRole={selectedRole}
            selectedRequestedAt={selectedRequestedAt}
            onSearchChange={setSearchTerm}
            onStatusChange={setSelectedStatus}
            onDepartmentChange={setSelectedDepartment}
            onRoleChange={setSelectedRole}
            onRequestedAtChange={setSelectedRequestedAt}
            requestStatuses={requestStatuses}
            departments={departments}
            roleOptions={roleOptions}
            requestedAtOptions={requestedAtOptions}
          />

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

          {/* Account Requests Grid */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {paginatedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={openDeleteModal}
                />
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
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
