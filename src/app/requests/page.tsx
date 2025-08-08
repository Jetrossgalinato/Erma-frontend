"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";
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
import { mapRoleToSystemRole } from "@/../lib/roleUtils"; // Import the helper function

// Define types for better TypeScript support
type RequestStatus = "Pending" | "Approved" | "Rejected";

interface AccountRequest {
  id: number;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: RequestStatus;
  requestedAt: string;
  department?: string;
  phoneNumber?: string;
  acc_role?: string;
  approved_acc_role?: string;
  is_supervisor?: boolean;
  is_intern?: boolean;
}

const requestStatuses = ["All Statuses", "Pending", "Approved", "Rejected"];

// Updated departments from register page
const departments = ["All Departments", "BSIT", "BSCS", "BSIS"];

// Role options from register page
const roleOptions = [
  "All Roles",
  "CCIS Dean",
  "Lab Technician",
  "Comlab Adviser",
  "Department Chairperson",
  "Associate Dean",
  "College Clerk",
  "Student Assistant",
  "Lecturer",
  "Instructor",
];

const supabase = createClientComponentClient<Database>();

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

  // Generate date options dynamically
  const getDateOptions = () => {
    const today = new Date();
    const options = ["All Dates"];

    // Add recent dates
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (i === 0) options.push(`Today (${dateStr})`);
      else if (i === 1) options.push(`Yesterday (${dateStr})`);
      else options.push(dateStr);
    }

    options.push("This Week", "This Month");
    return options;
  };

  const [requestedAtOptions] = useState(getDateOptions());
  const [selectedRequestedAt, setSelectedRequestedAt] = useState("All Dates");

  // Helper function for consistent error handling
  const handleError = (error: unknown, operation: string): string => {
    console.error(`Failed to ${operation}:`, error);

    let errorMessage = "Please try again.";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);

      // Check for Supabase error details
      if ("details" in error) {
        console.error("Error details:", error.details);
      }
    }

    return errorMessage;
  };

  // Fetch requests function with TypeScript error handling
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("account_requests")
        .select(`*,  is_supervisor, is_intern `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error; // or handle it however you prefer
      }

      const mappedRequests: AccountRequest[] = (data || []).map((acc, idx) => ({
        id: acc.id || idx,
        user_id: acc.user_id || "",
        firstName: acc.first_name || "",
        lastName: acc.last_name || "",
        email: acc.email || "", // this will now come from auth.users
        status: acc.status as RequestStatus,
        requestedAt: acc.created_at?.split("T")[0] || "",
        department: acc.department || undefined,
        phoneNumber: acc.phone_number || undefined,
        acc_role: acc.acc_role || "",
        approved_acc_role: acc.approved_acc_role || undefined,
        is_supervisor: acc.is_supervisor ?? false,
        is_intern: acc.is_intern ?? false,
      }));

      setRequests(mappedRequests);
    } catch (error) {
      const errorMessage = handleError(error, "fetch requests");
      alert(`Failed to fetch requests: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const fullName = `${request.firstName} ${request.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Statuses" || request.status === selectedStatus;

      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        request.department === selectedDepartment;

      const matchesRole =
        selectedRole === "All Roles" || request.acc_role === selectedRole;

      const matchesRequestedAt = (() => {
        if (selectedRequestedAt === "All Dates") return true;

        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        if (selectedRequestedAt.includes("Today"))
          return request.requestedAt === today;
        if (selectedRequestedAt.includes("Yesterday"))
          return request.requestedAt === yesterday;
        if (selectedRequestedAt === "This Week") {
          const weekAgo = new Date(Date.now() - 7 * 86400000)
            .toISOString()
            .split("T")[0];
          return request.requestedAt >= weekAgo && request.requestedAt <= today;
        }
        if (selectedRequestedAt === "This Month") {
          return request.requestedAt.startsWith(today.substring(0, 7));
        }
        return request.requestedAt === selectedRequestedAt;
      })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment &&
        matchesRole &&
        matchesRequestedAt
      );
    });
  }, [
    searchTerm,
    selectedStatus,
    selectedDepartment,
    selectedRole,
    selectedRequestedAt,
    requests,
  ]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredRequests.slice(start, end);
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

  const handleApprove = async (
    requestId: number,
    originalRole: string,
    userId: string
  ) => {
    try {
      // Step 1: Get account request to check is_supervisor and is_intern
      const { data: accountRequest, error: accountRequestError } =
        await supabase
          .from("account_requests")
          .select("*")
          .eq("id", requestId)
          .single();

      if (accountRequestError) throw accountRequestError;

      const { is_supervisor, is_intern } = accountRequest;

      // ✅ Conditionally map or copy role
      const approvedRole =
        !is_supervisor && !is_intern
          ? mapRoleToSystemRole(originalRole)
          : originalRole;

      // Step 2: Check and insert into accounts if not existing
      if (!is_intern && !is_supervisor) {
        const { data: existingAccount } = await supabase
          .from("accounts")
          .select("*")
          .eq("acc_req_id", requestId)
          .single();

        if (!existingAccount) {
          const { error: insertError } = await supabase
            .from("accounts")
            .insert({
              acc_req_id: requestId,
            });
          if (insertError) throw insertError;
        }
      }

      // Step 3: Insert to supervisor table if applicable
      if (is_supervisor) {
        const { data: existingSupervisor } = await supabase
          .from("supervisor")
          .select("id")
          .eq("account_req_id", requestId)
          .maybeSingle();

        if (!existingSupervisor) {
          const { error: insertSupervisorError } = await supabase
            .from("supervisor")
            .insert([{ account_req_id: requestId }]);

          if (insertSupervisorError) throw insertSupervisorError;
        }
      }
      // If is_intern, insert into interns table
      if (is_intern) {
        const { data: existingIntern } = await supabase
          .from("intern")
          .select("id")
          .eq("account_req_id", requestId)
          .maybeSingle();

        if (!existingIntern) {
          const { error: insertInternError } = await supabase
            .from("intern")
            .insert([{ account_req_id: requestId }]);

          if (insertInternError) throw insertInternError;
        }
      }

      // Step 4: Update request status
      const { error: updateError } = await supabase
        .from("account_requests")
        .update({
          status: "Approved",
          is_approved: true,
          approved_acc_role: approvedRole,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Step 5: Update Auth metadata
      try {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              acc_role: approvedRole,
            },
          }
        );
        if (authError) console.warn("Auth metadata update failed:", authError);
      } catch (authError) {
        console.warn("Supabase auth update exception:", authError);
      }

      // Step 6: Update local UI
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "Approved",
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
      const { error } = await supabase
        .from("account_requests")
        .update({
          status: "Rejected" as string,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      // If the update is successful, update the local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "Rejected" as RequestStatus }
            : request
        )
      );
    } catch (error) {
      const errorMessage = handleError(error, "reject request");
      alert(`Failed to reject request: ${errorMessage}`);
    }
  };

  const handleRemove = async (requestId: number) => {
    // Add confirmation dialog
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this request? This action cannot be undone and will also remove any associated account."
    );

    if (!confirmDelete) return;

    try {
      // First, check if there's an associated account record
      const { data: accountData, error: accountCheckError } = await supabase
        .from("accounts")
        .select("id")
        .eq("acc_req_id", requestId);

      if (accountCheckError) throw accountCheckError;

      // If there's an associated account, delete it first
      if (accountData && accountData.length > 0) {
        const { error: accountDeleteError } = await supabase
          .from("accounts")
          .delete()
          .eq("acc_req_id", requestId);

        if (accountDeleteError) throw accountDeleteError;
      }

      // Now delete the account request
      const { error: requestDeleteError } = await supabase
        .from("account_requests")
        .delete()
        .eq("id", requestId);

      if (requestDeleteError) throw requestDeleteError;

      // Update local state only if the delete was successful
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );

      // Optional: Show success message
      alert("Request removed successfully!");
    } catch (error) {
      const errorMessage = handleError(error, "remove request");
      alert(`Failed to remove request: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: RequestStatus): string => {
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

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
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
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-600">Loading requests...</p>
            </div>
          )}

          {/* Account Requests Grid - Updated to show role mapping */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {paginatedRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
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

                    <div className="flex gap-2">
                      {request.status === "Pending" ? (
                        <>
                          <button
                            onClick={() =>
                              handleApprove(
                                request.id,
                                request.acc_role || "",
                                request.user_id
                              )
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
                        </>
                      ) : (
                        <button className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                          View Details
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(request.id)}
                        className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                        title="Remove request"
                      >
                        <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
