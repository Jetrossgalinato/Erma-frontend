"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  User,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Define types for better TypeScript support
type RequestStatus = "Pending" | "Approved" | "Rejected";
type AccountType = "Student" | "Faculty" | "Staff" | "Admin" | "Guest";

interface AccountRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
  status: RequestStatus;
  requestedAt: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  phoneNumber?: string;
}

const accountTypes = [
  "All Account Types",
  "Student",
  "Faculty",
  "Staff",
  "Admin",
  "Guest",
];

const requestStatuses = ["All Statuses", "Pending", "Approved", "Rejected"];

const departments = [
  "All Departments",
  "Computer Science",
  "Mathematics",
  "Biology",
  "Physics",
  "Chemistry",
  "IT Services",
  "Administration",
  "External",
];

export default function AccountRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountType, setSelectedAccountType] =
    useState("All Account Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<AccountRequest>>({
    firstName: "",
    lastName: "",
    email: "",
    accountType: "Student",
    department: "",
    phoneNumber: "",
  });

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

  // Simulated API functions - replace these with actual API calls
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would be an API call
      // const response = await fetch('/api/account-requests');
      // const data = await response.json();
      // setRequests(data);

      // For now, start with empty array
      setRequests([]);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const addRequest = async (request: Partial<AccountRequest>) => {
    try {
      const newId = Math.max(0, ...requests.map((r) => r.id)) + 1;
      const today = new Date().toISOString().split("T")[0];

      const fullRequest: AccountRequest = {
        id: newId,
        firstName: request.firstName || "",
        lastName: request.lastName || "",
        email: request.email || "",
        accountType: (request.accountType as AccountType) || "Student",
        status: "Pending",
        requestedAt: today,
        department: request.department,
        phoneNumber: request.phoneNumber,
        ...(request.accountType === "Student" && {
          studentId: `STU${newId.toString().padStart(4, "0")}`,
        }),
        ...(["Faculty", "Staff", "Admin"].includes(
          request.accountType || ""
        ) && {
          employeeId: `EMP${newId.toString().padStart(4, "0")}`,
        }),
      };

      // In a real app, this would be an API call
      // await fetch('/api/account-requests', {
      //   method: 'POST',
      //   body: JSON.stringify(fullRequest)
      // });

      setRequests((prev) => [...prev, fullRequest]);
      setShowAddForm(false);
      setNewRequest({
        firstName: "",
        lastName: "",
        email: "",
        accountType: "Student",
        department: "",
        phoneNumber: "",
      });
    } catch (error) {
      console.error("Failed to add request:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const fullName = `${request.firstName} ${request.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.studentId &&
          request.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.employeeId &&
          request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesAccountType =
        selectedAccountType === "All Account Types" ||
        request.accountType === selectedAccountType;

      const matchesStatus =
        selectedStatus === "All Statuses" || request.status === selectedStatus;

      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        request.department === selectedDepartment;

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
        matchesAccountType &&
        matchesStatus &&
        matchesDepartment &&
        matchesRequestedAt
      );
    });
  }, [
    searchTerm,
    selectedAccountType,
    selectedStatus,
    selectedDepartment,
    selectedRequestedAt,
    requests,
  ]);

  const handleApprove = async (requestId: number) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/account-requests/${requestId}/approve`, { method: 'PUT' });

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "Approved" as RequestStatus }
            : request
        )
      );
    } catch (error) {
      console.error("Failed to approve request:", error);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/account-requests/${requestId}/reject`, { method: 'PUT' });

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "Rejected" as RequestStatus }
            : request
        )
      );
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const handleRemove = async (requestId: number) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/account-requests/${requestId}`, { method: 'DELETE' });

      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Failed to remove request:", error);
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

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case "Student":
        return <User className="w-5 h-5 text-blue-600" />;
      case "Faculty":
        return <Shield className="w-5 h-5 text-purple-600" />;
      case "Staff":
        return <UserCheck className="w-5 h-5 text-green-600" />;
      case "Admin":
        return <Shield className="w-5 h-5 text-red-600" />;
      case "Guest":
        return <User className="w-5 h-5 text-gray-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAccountTypeColor = (type: AccountType): string => {
    switch (type) {
      case "Student":
        return "bg-blue-100 text-blue-800";
      case "Faculty":
        return "bg-purple-100 text-purple-800";
      case "Staff":
        return "bg-green-100 text-green-800";
      case "Admin":
        return "bg-red-100 text-red-800";
      case "Guest":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  const handleAddFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequest.firstName && newRequest.lastName && newRequest.email) {
      addRequest(newRequest);
    }
  };

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
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 cursor-pointer text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Request
              </button>
            </div>
          </div>

          {/* Add Request Modal */}
          {showAddForm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
              onClick={() => setShowAddForm(false)}
            >
              <div
                className="bg-white text-gray-800 rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
              >
                <h2 className="text-xl font-bold mb-4">Add New Request</h2>
                <form onSubmit={handleAddFormSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={newRequest.firstName}
                        onChange={(e) =>
                          setNewRequest({
                            ...newRequest,
                            firstName: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={newRequest.lastName}
                        onChange={(e) =>
                          setNewRequest({
                            ...newRequest,
                            lastName: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newRequest.email}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <select
                      value={newRequest.accountType}
                      onChange={(e) =>
                        setNewRequest({
                          ...newRequest,
                          accountType: e.target.value as AccountType,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {accountTypes.slice(1).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Department"
                      value={newRequest.department}
                      onChange={(e) =>
                        setNewRequest({
                          ...newRequest,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newRequest.phoneNumber}
                      onChange={(e) =>
                        setNewRequest({
                          ...newRequest,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Account Type Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedAccountType}
                  onChange={(e) => setSelectedAccountType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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

          {/* Account Requests Grid */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {getAccountTypeIcon(request.accountType)}
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          Account Type:
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getAccountTypeColor(
                            request.accountType
                          )}`}
                        >
                          {request.accountType}
                        </span>
                      </div>

                      {request.department && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Department:</span>{" "}
                          {request.department}
                        </p>
                      )}

                      {request.studentId && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Student ID:</span>{" "}
                          {request.studentId}
                        </p>
                      )}

                      {request.employeeId && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Employee ID:</span>{" "}
                          {request.employeeId}
                        </p>
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
                            onClick={() => handleApprove(request.id)}
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
