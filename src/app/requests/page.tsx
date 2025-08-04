"use client";
import { useState, useMemo } from "react";
import {
  Search,
  User,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Trash2,
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
  reason?: string;
  phoneNumber?: string;
}

// Mock data for demonstration
const mockAccountRequests: AccountRequest[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@university.edu",
    accountType: "Student",
    status: "Pending",
    requestedAt: "2024-08-04",
    department: "Computer Science",
    studentId: "CS2024001",
    phoneNumber: "+1234567890",
    reason: "New student enrollment for Fall 2024 semester",
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@university.edu",
    accountType: "Faculty",
    status: "Pending",
    requestedAt: "2024-08-03",
    department: "Mathematics",
    employeeId: "FAC2024012",
    phoneNumber: "+1234567891",
    reason: "New faculty member joining Mathematics department",
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Davis",
    email: "mike.davis@university.edu",
    accountType: "Staff",
    status: "Approved",
    requestedAt: "2024-08-02",
    department: "IT Services",
    employeeId: "STA2024045",
    phoneNumber: "+1234567892",
    reason: "IT support staff member",
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Chen",
    email: "emily.chen@university.edu",
    accountType: "Student",
    status: "Approved",
    requestedAt: "2024-08-01",
    department: "Biology",
    studentId: "BIO2024078",
    phoneNumber: "+1234567893",
    reason: "Graduate student research program",
  },
  {
    id: 5,
    firstName: "Robert",
    lastName: "Wilson",
    email: "robert.wilson@external.com",
    accountType: "Guest",
    status: "Rejected",
    requestedAt: "2024-07-31",
    department: "External",
    phoneNumber: "+1234567894",
    reason: "Guest lecturer access - insufficient documentation",
  },
  {
    id: 6,
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@university.edu",
    accountType: "Admin",
    status: "Pending",
    requestedAt: "2024-08-04",
    department: "Administration",
    employeeId: "ADM2024003",
    phoneNumber: "+1234567895",
    reason: "New administrator for student services",
  },
  {
    id: 7,
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@university.edu",
    accountType: "Faculty",
    status: "Pending",
    requestedAt: "2024-08-03",
    department: "Physics",
    employeeId: "FAC2024013",
    phoneNumber: "+1234567896",
    reason: "Visiting professor for research collaboration",
  },
  {
    id: 8,
    firstName: "Jennifer",
    lastName: "Lee",
    email: "jennifer.lee@university.edu",
    accountType: "Student",
    status: "Approved",
    requestedAt: "2024-08-02",
    department: "Chemistry",
    studentId: "CHE2024055",
    phoneNumber: "+1234567897",
    reason: "Transfer student from partner university",
  },
];

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

const requestedAtOptions = [
  "All Dates",
  "Today (2024-08-04)",
  "Yesterday (2024-08-03)",
  "2024-08-02",
  "2024-08-01",
  "2024-07-31",
  "This Week",
  "This Month",
];

export default function AccountRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountType, setSelectedAccountType] =
    useState("All Account Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedRequestedAt, setSelectedRequestedAt] = useState("All Dates");
  const [requests, setRequests] = useState(mockAccountRequests);

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
        if (selectedRequestedAt === "Today (2024-08-04)")
          return request.requestedAt === "2024-08-04";
        if (selectedRequestedAt === "Yesterday (2024-08-03)")
          return request.requestedAt === "2024-08-03";
        if (selectedRequestedAt === "This Week") {
          const weekDates = [
            "2024-08-04",
            "2024-08-03",
            "2024-08-02",
            "2024-08-01",
          ];
          return weekDates.includes(request.requestedAt);
        }
        if (selectedRequestedAt === "This Month") {
          return request.requestedAt.startsWith("2024-08");
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

  const handleApprove = (requestId: number) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId
          ? { ...request, status: "Approved" as RequestStatus }
          : request
      )
    );
  };

  const handleReject = (requestId: number) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId
          ? { ...request, status: "Rejected" as RequestStatus }
          : request
      )
    );
  };

  const handleRemove = (requestId: number) => {
    setRequests((prevRequests) =>
      prevRequests.filter((request) => request.id !== requestId)
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Account Requests Management
            </h1>
            <p className="text-gray-600">
              Review and manage user registration requests for the system
            </p>
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

          {/* Account Requests Grid */}
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

                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span>{" "}
                      {request.phoneNumber}
                    </p>

                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requested:</span>{" "}
                      {request.requestedAt}
                    </p>
                  </div>

                  {request.reason && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Reason:
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {request.reason}
                      </p>
                    </div>
                  )}

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

          {/* No Results */}
          {filteredRequests.length === 0 && (
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
