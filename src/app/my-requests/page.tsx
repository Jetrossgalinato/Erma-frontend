"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCallback, useState, useEffect } from "react";
import {
  RefreshCw,
  Calendar,
  User,
  Package,
  ChevronDown,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";

type BorrowingStatus = "Pending" | "Approved" | "Rejected";

interface Borrowing {
  id: number;
  created_at: string;
  request_status: BorrowingStatus;
  availability: string;
  purpose: string | null;
  start_date: string | null;
  end_date: string | null;
  return_date: string | null;
  date_returned: string | null;
  recievers_name: string | null;
  borrowers_id: number;
  borrowed_item: number;
}

export default function MyRequestsPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const [borrowingData, setBorrowingData] = useState<Borrowing[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const fetchBorrowing = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("borrowing").select("*");
    if (error) {
      console.error("Failed to fetch borrowing data:", error);
    } else {
      setBorrowingData(data as Borrowing[]);
    }
    setLoading(false);
  }, [supabase]);

  const toggleRequestSelection = (requestId: number) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const toggleAllRequests = () => {
    if (selectedRequests.length === borrowingData.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(borrowingData.map((req) => req.id));
    }
  };

  const handleBulkReturn = async () => {
    // Add your return logic here
    console.log("Returning requests:", selectedRequests);
    // Reset selection after action
    setSelectedRequests([]);
    setShowActionsDropdown(false);
  };

  const handleBulkDelete = async () => {
    // Add your delete logic here
    console.log("Deleting requests:", selectedRequests);
    // Reset selection after action
    setSelectedRequests([]);
    setShowActionsDropdown(false);
  };

  useEffect(() => {
    fetchBorrowing();
  }, [fetchBorrowing]);

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
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={fetchBorrowing}
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

          {/* Borrowing Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Borrowing Requests ({borrowingData.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading borrowing requests...</p>
              </div>
            ) : borrowingData.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 text-lg mb-2">
                  No borrowing requests found
                </p>
                <p className="text-gray-400">
                  Your borrowing requests will appear here once you make them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedRequests.length === borrowingData.length &&
                            borrowingData.length > 0
                          }
                          onChange={toggleAllRequests}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Returned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {borrowingData.map((borrowing) => (
                      <tr key={borrowing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(borrowing.id)}
                            onChange={() =>
                              toggleRequestSelection(borrowing.id)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{borrowing.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              borrowing.request_status
                            )}`}
                          >
                            {borrowing.request_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{borrowing.borrowed_item}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div
                            className="truncate"
                            title={borrowing.purpose || "-"}
                          >
                            {borrowing.purpose || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-gray-400" />
                            {borrowing.recievers_name || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(borrowing.start_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(borrowing.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(borrowing.return_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(borrowing.created_at)}
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
    </div>
  );
}
