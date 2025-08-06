"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";

type FacilityStatus = "Available" | "Occupied" | "Maintenance" | "Reserved";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacilityType, setSelectedFacilityType] =
    useState("All Facility Types");
  const [selectedFloorLevel, setSelectedFloorLevel] =
    useState("All Floor Levels");
  const [selectedStatus, setSelectedStatus] = useState<
    FacilityStatus | "All Statuses"
  >("All Statuses");

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
      case "Occupied":
        return "bg-red-100 text-red-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "Reserved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Facilities
              </h1>
              <p className="text-gray-600">
                View all facility records, filter by type, floor level, or
                building, and search for specific facilities.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchFacilities}
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

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Facility Type Filter */}
              <select
                value={selectedFacilityType}
                onChange={(e) => setSelectedFacilityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          </div>

          {/* Facilities Grid */}
          {loading ? (
            <div className="text-center text-gray-600 py-12">
              Loading facilities...
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No facilities found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginatedFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {facility.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          facility.status
                        )}`}
                      >
                        {facility.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Floor:</span>{" "}
                        {facility.floor_level}
                      </p>

                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Building:</span>{" "}
                        {facility.building}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                        View
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        {facility.status === "Available" ? "Book" : "Edit"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center mt-2 mb-12 space-x-2">
            {Array.from({
              length: Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE),
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
