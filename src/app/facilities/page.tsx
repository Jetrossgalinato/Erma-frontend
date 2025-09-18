"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";

type FacilityStatus =
  | "Available"
  | "Unavailable"
  | "Maintenance"
  | "Renovation";

interface Facility {
  id: number;
  name: string;
  connection_type: string;
  facility_type: string;
  floor_level: string;
  cooling_tools: string;
  building: string;
  remarks: string;
  status: FacilityStatus;
}

const facilityTypes = [
  "All Facility Types",
  "Room",
  "Office",
  "Computer Lab",
  "Incubation Hub",
  "Robotic Hub",
  "Hall",
];

const floorLevels = ["All Floor Levels", "1st Floor", "2nd Floor", "3rd Floor"];

export default function FacilitiesPage() {
  const supabase = createClientComponentClient<Database>();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    purpose: "",
    start_date: "",
    end_date: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacilityType, setSelectedFacilityType] =
    useState("All Facility Types");
  const [selectedFloorLevel, setSelectedFloorLevel] =
    useState("All Floor Levels");
  const [selectedStatus, setSelectedStatus] = useState<
    FacilityStatus | "All Statuses"
  >("All Statuses");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setUserLoading(false);
    };

    getUser();
  }, [supabase]);

  // Fetch data from Supabase
  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("facilities").select("*");

    if (error) {
      console.error("Error fetching facilities:", error);
    } else {
      setFacilities(data as Facility[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // Filter logic
  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesSearch = facility.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFacilityType =
        selectedFacilityType === "All Facility Types" ||
        facility.facility_type === selectedFacilityType;

      const matchesFloorLevel =
        selectedFloorLevel === "All Floor Levels" ||
        facility.floor_level === selectedFloorLevel;

      const matchesStatus =
        selectedStatus === "All Statuses" || facility.status === selectedStatus;

      return (
        matchesSearch &&
        matchesFacilityType &&
        matchesFloorLevel &&
        matchesStatus
      );
    });
  }, [
    facilities,
    searchTerm,
    selectedFacilityType,
    selectedFloorLevel,
    selectedStatus,
  ]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;

    setBookingLoading(true);

    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Failed to get current user:", userError);
        setBookingLoading(false);
        return;
      }

      // Get the user's account_requests ID
      const { data: accountRequest, error: accountError } = await supabase
        .from("account_requests")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (accountError || !accountRequest) {
        console.error("Failed to get account request:", accountError);
        setBookingLoading(false);
        return;
      }

      // Insert booking request
      const { error } = await supabase.from("booking").insert({
        bookers_id: accountRequest.id,
        facility_id: selectedFacility.id,
        purpose: bookingData.purpose,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        status: "Pending",
      });

      if (error) {
        console.error("Failed to create booking:", error);
      } else {
        // Reset form and close modal
        setBookingData({ purpose: "", start_date: "", end_date: "" });
        setShowBookingModal(false);
        setSelectedFacility(null);
        console.log("Booking request created successfully!");
        // You might want to show a success message here
      }
    } catch (error) {
      console.error("Error creating booking:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookingModal = () => {
    setShowBookingModal(false);
    setBookingData({ purpose: "", start_date: "", end_date: "" });
  };

  // Pagination logic
  const paginatedFacilities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredFacilities.slice(start, end);
  }, [filteredFacilities, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFacilityType, selectedFloorLevel, selectedStatus]);

  const getStatusColor = (status: FacilityStatus): string => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Unavailable":
        return "bg-red-100 text-red-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-2 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Facilities
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                View all facility records, filter by type, floor level, or
                building, and search for specific facilities.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-0">
              <button
                onClick={fetchFacilities}
                disabled={loading}
                className="px-2 py-1 sm:px-3 sm:py-2 cursor-pointer text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1 sm:gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4">
              {/* Search Bar */}
              <div className="md:col-span-1 relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Facility Type Filter */}
              <select
                value={selectedFacilityType}
                onChange={(e) => setSelectedFacilityType(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                {facilityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Floor Level Filter */}
              <select
                value={selectedFloorLevel}
                onChange={(e) => setSelectedFloorLevel(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                {floorLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value as FacilityStatus | "All Statuses"
                  )
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          </div>

          {/* Facilities Content */}
          {loading ? (
            // Loading State
            <div className="text-center py-8 sm:py-12">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-orange-500 mb-2 sm:mb-4 animate-spin" />
              <p className="text-xs sm:text-base text-gray-600">
                Loading facilities...
              </p>
            </div>
          ) : (
            <>
              {/* Facilities Grid */}
              {filteredFacilities.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                    No facilities found
                  </h3>
                  <p className="text-xs sm:text-base text-gray-600">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
                  {paginatedFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 sm:p-6">
                        <div className="flex justify-between items-start mb-2 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 pr-1 sm:pr-2">
                            {facility.name}
                          </h3>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(
                              facility.status
                            )}`}
                          >
                            {facility.status}
                          </span>
                        </div>

                        <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Floor:</span>{" "}
                            {facility.floor_level}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Building:</span>{" "}
                            {facility.building}
                          </p>
                        </div>

                        <div className="flex gap-1 sm:gap-2">
                          <button
                            className="flex-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                            onClick={() => {
                              setSelectedFacility(facility);
                              setShowModal(true);
                            }}
                          >
                            View
                          </button>
                          {userLoading ? (
                            <div className="flex-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-200 rounded-lg animate-pulse">
                              <div className="h-3 sm:h-4 bg-gray-300 rounded"></div>
                            </div>
                          ) : (
                            <button
                              className={`flex-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                                facility.status === "Available" && user
                                  ? "bg-orange-600 text-white hover:bg-orange-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              onClick={() => {
                                if (facility.status === "Available" && user) {
                                  setSelectedFacility(facility);
                                  setShowBookingModal(true);
                                }
                              }}
                              disabled={
                                facility.status !== "Available" || !user
                              }
                              title={
                                !user ? "Please log in to book facilities" : ""
                              }
                            >
                              {facility.status === "Available"
                                ? "Book"
                                : "Edit"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination - Only show if there are items to paginate */}
              {filteredFacilities.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center mt-1 sm:mt-2 mb-8 sm:mb-12 space-x-1 sm:space-x-2">
                  {Array.from({
                    length: Math.ceil(
                      filteredFacilities.length / ITEMS_PER_PAGE
                    ),
                  }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-base ${
                        currentPage === i + 1
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Modal for viewing facility */}
      {showModal && selectedFacility && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
          onClick={() => setShowModal(false)} // Clicking outside closes modal
        >
          <div
            className="bg-white rounded-lg w-full max-w-xs sm:max-w-xl p-3 sm:p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
            <h2 className="text-lg sm:text-2xl text-gray-800 font-bold mb-2 sm:mb-4">
              {selectedFacility.name}
            </h2>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p>
                <strong>Connection Type:</strong>{" "}
                {selectedFacility.connection_type || "N/A"}
              </p>
              <p>
                <strong>Facility Type:</strong>{" "}
                {selectedFacility.facility_type || "N/A"}
              </p>
              <p>
                <strong>Floor Level:</strong>{" "}
                {selectedFacility.floor_level || "N/A"}
              </p>
              <p>
                <strong>Cooling Tools:</strong>{" "}
                {selectedFacility.cooling_tools || "N/A"}
              </p>
              <p>
                <strong>Building:</strong> {selectedFacility.building || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {selectedFacility.status || "N/A"}
              </p>
              <p>
                <strong>Remarks:</strong> {selectedFacility.remarks || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Modal for booking */}
      {showBookingModal && selectedFacility && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
          onClick={resetBookingModal}
        >
          <div
            className="bg-white rounded-lg w-full max-w-xs sm:max-w-md p-3 sm:p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={resetBookingModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
            <h2 className="text-lg sm:text-2xl text-gray-800 font-bold mb-2 sm:mb-4">
              Book {selectedFacility.name}
            </h2>

            <form
              onSubmit={handleBookingSubmit}
              className="space-y-2 sm:space-y-4"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bookingData.purpose}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, purpose: e.target.value })
                  }
                  placeholder="Describe the purpose of your booking..."
                  required
                  rows={2}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.start_date}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      start_date: e.target.value,
                    })
                  }
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.end_date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, end_date: e.target.value })
                  }
                  required
                  min={
                    bookingData.start_date ||
                    new Date().toISOString().slice(0, 16)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={resetBookingModal}
                  className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-xs sm:text-base"
                >
                  {bookingLoading ? "Booking..." : "Submit Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Footer always at the bottom */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
