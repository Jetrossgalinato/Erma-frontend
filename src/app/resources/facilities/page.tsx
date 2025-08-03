"use client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Define types for better TypeScript support
type FacilityStatus = "Available" | "Occupied" | "Maintenance" | "Reserved";

interface Facility {
  id: number;
  name: string;
  facilityType: string;
  floorLevel: string;
  building: string;
  status: FacilityStatus;
  capacity?: number;
  area?: string;
}

// Mock data for demonstration
const mockFacilities: Facility[] = [
  {
    id: 1,
    name: "Computer Laboratory 1",
    facilityType: "Laboratory",
    floorLevel: "2nd Floor",
    building: "CCIS Building",
    status: "Available",
    capacity: 40,
    area: "120 sqm",
  },
  {
    id: 2,
    name: "Conference Room A",
    facilityType: "Meeting Room",
    floorLevel: "3rd Floor",
    building: "Administration Building",
    status: "Occupied",
    capacity: 20,
    area: "60 sqm",
  },
  {
    id: 3,
    name: "Lecture Hall 101",
    facilityType: "Classroom",
    floorLevel: "1st Floor",
    building: "Academic Building",
    status: "Available",
    capacity: 80,
    area: "200 sqm",
  },
  {
    id: 4,
    name: "Research Laboratory",
    facilityType: "Laboratory",
    floorLevel: "4th Floor",
    building: "CCIS Building",
    status: "Maintenance",
    capacity: 15,
    area: "80 sqm",
  },
  {
    id: 5,
    name: "Student Lounge",
    facilityType: "Common Area",
    floorLevel: "1st Floor",
    building: "Student Center",
    status: "Available",
    capacity: 50,
    area: "150 sqm",
  },
  {
    id: 6,
    name: "Faculty Office 204",
    facilityType: "Office",
    floorLevel: "2nd Floor",
    building: "CCIS Building",
    status: "Occupied",
    capacity: 4,
    area: "25 sqm",
  },
  {
    id: 7,
    name: "Seminar Room B",
    facilityType: "Meeting Room",
    floorLevel: "2nd Floor",
    building: "Administration Building",
    status: "Reserved",
    capacity: 30,
    area: "75 sqm",
  },
  {
    id: 8,
    name: "Library Study Hall",
    facilityType: "Study Area",
    floorLevel: "3rd Floor",
    building: "Library Building",
    status: "Available",
    capacity: 100,
    area: "300 sqm",
  },
];

const facilityTypes = [
  "All Facility Types",
  "Laboratory",
  "Meeting Room",
  "Classroom",
  "Common Area",
  "Office",
  "Study Area",
];

const floorLevels = [
  "All Floor Levels",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
  "5th Floor",
];

const buildings = [
  "All Buildings",
  "CCIS Building",
  "Administration Building",
  "Academic Building",
  "Student Center",
  "Library Building",
];

export default function FacilitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacilityType, setSelectedFacilityType] =
    useState("All Facility Types");
  const [selectedFloorLevel, setSelectedFloorLevel] =
    useState("All Floor Levels");
  const [selectedBuilding, setSelectedBuilding] = useState("All Buildings");

  // Filter and search logic
  const filteredFacilities = useMemo(() => {
    return mockFacilities.filter((facility) => {
      const matchesSearch = facility.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFacilityType =
        selectedFacilityType === "All Facility Types" ||
        facility.facilityType === selectedFacilityType;
      const matchesFloorLevel =
        selectedFloorLevel === "All Floor Levels" ||
        facility.floorLevel === selectedFloorLevel;
      const matchesBuilding =
        selectedBuilding === "All Buildings" ||
        facility.building === selectedBuilding;

      return (
        matchesSearch &&
        matchesFacilityType &&
        matchesFloorLevel &&
        matchesBuilding
      );
    });
  }, [searchTerm, selectedFacilityType, selectedFloorLevel, selectedBuilding]);

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Facilities Management
            </h1>
            <p className="text-gray-600">
              Track and manage your facility inventory and bookings
            </p>
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
              <div className="md:col-span-1">
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
              </div>

              {/* Floor Level Filter */}
              <div className="md:col-span-1">
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
              </div>

              {/* Building Filter */}
              <div className="md:col-span-1">
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {buildings.map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredFacilities.map((facility) => (
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
                      <span className="font-medium">Type:</span>{" "}
                      {facility.facilityType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Building:</span>{" "}
                      {facility.building}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Floor:</span>{" "}
                      {facility.floorLevel}
                    </p>
                    {facility.capacity && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Capacity:</span>{" "}
                        {facility.capacity} people
                      </p>
                    )}
                    {facility.area && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Area:</span>{" "}
                        {facility.area}
                      </p>
                    )}
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

          {/* No Results */}
          {filteredFacilities.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No facilities found
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
