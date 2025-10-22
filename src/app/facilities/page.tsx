"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore, useUIStore } from "@/store";
import FacilityDetailsModal from "./components/FacilityDetailsModal";
import BookFacilityModal from "./components/BookFacilityModal";
import {
  Facility,
  FacilityStatus,
  BookingFormData,
  FACILITY_TYPES,
  FLOOR_LEVELS,
  ITEMS_PER_PAGE,
  getStatusColor,
  filterFacilities,
  paginateFacilities,
  calculateTotalPages,
  fetchFacilitiesList,
  createBookingRequest,
} from "./utils/helpers";

export default function FacilitiesPage() {
  // Use stores for auth and UI state
  const { isAuthenticated, isLoading: userLoading } = useAuthStore();
  const searchTerm = useUIStore((state) => state.searchTerms.facilities || "");
  const setSearchTerm = useUIStore((state) => state.setSearchTerm);
  const currentPage = useUIStore(
    (state) => state.pagination.facilities?.currentPage || 1
  );
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);

  // Local state for facilities data (due to type conflicts)
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Local UI state
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );

  // booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    purpose: "",
    start_date: "",
    end_date: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const [selectedFacilityType, setSelectedFacilityType] =
    useState("All Facility Types");
  const [selectedFloorLevel, setSelectedFloorLevel] =
    useState("All Floor Levels");
  const [selectedStatus, setSelectedStatus] = useState<
    FacilityStatus | "All Statuses"
  >("All Statuses");

  // Fetch data from FastAPI
  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    const data = await fetchFacilitiesList();
    // Ensure we always set an array
    setFacilities(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // Filter logic
  const filteredFacilities = useMemo(() => {
    return filterFacilities(
      facilities,
      searchTerm,
      selectedFacilityType,
      selectedFloorLevel,
      selectedStatus
    );
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

    const success = await createBookingRequest(
      selectedFacility.facility_id,
      bookingData
    );

    if (success) {
      alert("Booking request submitted successfully!");
      setBookingData({ purpose: "", start_date: "", end_date: "" });
      setShowBookingModal(false);
      setSelectedFacility(null);
      fetchFacilities();
    }

    setBookingLoading(false);
  };

  const resetBookingModal = () => {
    setShowBookingModal(false);
    setBookingData({ purpose: "", start_date: "", end_date: "" });
  };

  // Pagination logic
  const paginatedFacilities = useMemo(() => {
    return paginateFacilities(filteredFacilities, currentPage, ITEMS_PER_PAGE);
  }, [filteredFacilities, currentPage]);

  useEffect(() => {
    setCurrentPage("facilities", 1);
  }, [
    searchTerm,
    selectedFacilityType,
    selectedFloorLevel,
    selectedStatus,
    setCurrentPage,
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-2 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-1 sm:mb-2">
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
                  onChange={(e) => setSearchTerm("facilities", e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Facility Type Filter */}
              <select
                value={selectedFacilityType}
                onChange={(e) => setSelectedFacilityType(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                {FACILITY_TYPES.map((type) => (
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
                {FLOOR_LEVELS.map((level) => (
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
                      key={facility.facility_id}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 sm:p-6">
                        <div className="flex justify-between items-start mb-2 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 pr-1 sm:pr-2">
                            {facility.facility_name}
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
                            <span className="font-medium">Type:</span>{" "}
                            {facility.facility_type}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Floor:</span>{" "}
                            {facility.floor_level}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Capacity:</span>{" "}
                            {facility.capacity}
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
                                facility.status === "Available" &&
                                isAuthenticated
                                  ? "bg-orange-600 text-white hover:bg-orange-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              onClick={() => {
                                if (
                                  facility.status === "Available" &&
                                  isAuthenticated
                                ) {
                                  setSelectedFacility(facility);
                                  setShowBookingModal(true);
                                }
                              }}
                              disabled={
                                facility.status !== "Available" ||
                                !isAuthenticated
                              }
                              title={
                                !isAuthenticated
                                  ? "Please log in to book facilities"
                                  : ""
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
                    length: calculateTotalPages(
                      filteredFacilities.length,
                      ITEMS_PER_PAGE
                    ),
                  }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage("facilities", i + 1)}
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

      {/* Facility Details Modal */}
      <FacilityDetailsModal
        isOpen={showModal}
        facility={selectedFacility}
        onClose={() => setShowModal(false)}
      />

      {/* Booking Modal */}
      <BookFacilityModal
        isOpen={showBookingModal}
        facility={selectedFacility}
        bookingData={bookingData}
        bookingLoading={bookingLoading}
        onClose={resetBookingModal}
        onBookingDataChange={setBookingData}
        onSubmit={handleBookingSubmit}
      />

      {/* Footer always at the bottom */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
