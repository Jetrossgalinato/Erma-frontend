"use client";
import { useState, useMemo } from "react";
import { Search, Calendar, User, FileText, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Define types for better TypeScript support
type RequestStatus = "Pending" | "Approved" | "Rejected" | "In Review";
type RequestType =
  | "Equipment"
  | "Room Booking"
  | "Maintenance"
  | "Access"
  | "Other";

interface Request {
  id: number;
  title: string;
  requestType: RequestType;
  status: RequestStatus;
  createdBy: string;
  requestedAt: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  department?: string;
}

// Mock data for demonstration
const mockRequests: Request[] = [
  {
    id: 1,
    title: "Computer Laboratory 1 Booking",
    requestType: "Room Booking",
    status: "Pending",
    createdBy: "John Smith",
    requestedAt: "2024-08-04",
    description: "Need to book Computer Lab 1 for programming class",
    priority: "Medium",
    department: "Computer Science",
  },
  {
    id: 2,
    title: "Projector Repair Request",
    requestType: "Maintenance",
    status: "In Review",
    createdBy: "Sarah Johnson",
    requestedAt: "2024-08-03",
    description: "Projector in Conference Room A is not working properly",
    priority: "High",
    department: "IT Services",
  },
  {
    id: 3,
    title: "New Laptop Equipment",
    requestType: "Equipment",
    status: "Approved",
    createdBy: "Mike Davis",
    requestedAt: "2024-08-02",
    description: "Request for 5 new laptops for research team",
    priority: "Medium",
    department: "Research",
  },
  {
    id: 4,
    title: "Library Access Card",
    requestType: "Access",
    status: "Approved",
    createdBy: "Emily Chen",
    requestedAt: "2024-08-01",
    description: "Need access card for extended library hours",
    priority: "Low",
    department: "Graduate Studies",
  },
  {
    id: 5,
    title: "AC Repair in Office 204",
    requestType: "Maintenance",
    status: "Rejected",
    createdBy: "Robert Wilson",
    requestedAt: "2024-07-31",
    description: "Air conditioning unit not cooling properly",
    priority: "High",
    department: "Facilities",
  },
  {
    id: 6,
    title: "Seminar Room B Booking",
    requestType: "Room Booking",
    status: "Pending",
    createdBy: "Lisa Anderson",
    requestedAt: "2024-08-04",
    description: "Book seminar room for department meeting",
    priority: "Medium",
    department: "Administration",
  },
  {
    id: 7,
    title: "Software License Request",
    requestType: "Other",
    status: "In Review",
    createdBy: "David Brown",
    requestedAt: "2024-08-03",
    description: "Need Adobe Creative Suite license for design work",
    priority: "Low",
    department: "Marketing",
  },
  {
    id: 8,
    title: "Laboratory Equipment Setup",
    requestType: "Equipment",
    status: "Approved",
    createdBy: "Jennifer Lee",
    requestedAt: "2024-08-02",
    description: "Setup new microscopes in Biology Lab",
    priority: "High",
    department: "Biology",
  },
];

const requestTypes = [
  "All Request Types",
  "Equipment",
  "Room Booking",
  "Maintenance",
  "Access",
  "Other",
];

const requestStatuses = [
  "All Statuses",
  "Pending",
  "Approved",
  "Rejected",
  "In Review",
];

const createdByOptions = [
  "All Users",
  "John Smith",
  "Sarah Johnson",
  "Mike Davis",
  "Emily Chen",
  "Robert Wilson",
  "Lisa Anderson",
  "David Brown",
  "Jennifer Lee",
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

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequestType, setSelectedRequestType] =
    useState("All Request Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedCreatedBy, setSelectedCreatedBy] = useState("All Users");
  const [selectedRequestedAt, setSelectedRequestedAt] = useState("All Dates");

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return mockRequests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRequestType =
        selectedRequestType === "All Request Types" ||
        request.requestType === selectedRequestType;

      const matchesStatus =
        selectedStatus === "All Statuses" || request.status === selectedStatus;

      const matchesCreatedBy =
        selectedCreatedBy === "All Users" ||
        request.createdBy === selectedCreatedBy;

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
        matchesRequestType &&
        matchesStatus &&
        matchesCreatedBy &&
        matchesRequestedAt
      );
    });
  }, [
    searchTerm,
    selectedRequestType,
    selectedStatus,
    selectedCreatedBy,
    selectedRequestedAt,
  ]);

  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "In Review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRequestTypeIcon = (type: RequestType) => {
    switch (type) {
      case "Equipment":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "Room Booking":
        return <Calendar className="w-5 h-5 text-green-600" />;
      case "Maintenance":
        return <Clock className="w-5 h-5 text-orange-600" />;
      case "Access":
        return <User className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Requests Management
            </h1>
            <p className="text-gray-600">
              Track and manage all your facility and equipment requests
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Request Type Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedRequestType}
                  onChange={(e) => setSelectedRequestType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {requestTypes.map((type) => (
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
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {requestStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Created By Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedCreatedBy}
                  onChange={(e) => setSelectedCreatedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {createdByOptions.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requested At Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedRequestedAt}
                  onChange={(e) => setSelectedRequestedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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

          {/* Add New Request Button */}
          <div className="mb-6">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              + New Request
            </button>
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 flex-1 pr-2">
                      {getRequestTypeIcon(request.requestType)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.title}
                      </h3>
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
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span>{" "}
                      {request.requestType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Created By:</span>{" "}
                      {request.createdBy}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requested At:</span>{" "}
                      {request.requestedAt}
                    </p>
                    {request.department && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Department:</span>{" "}
                        {request.department}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        Priority:
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                          request.priority
                        )}`}
                      >
                        {request.priority}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {request.description}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      {request.status === "Pending" ? "Process" : "Update"}
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
                No requests found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}
