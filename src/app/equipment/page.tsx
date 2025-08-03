"use client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Define types for better TypeScript support
type EquipmentStatus = "Available" | "In Use" | "Maintenance";

interface Equipment {
  id: number;
  name: string;
  category: string;
  facility: string;
  status: EquipmentStatus;
}

// Mock data for demonstration
const mockEquipment: Equipment[] = [
  {
    id: 1,
    name: "Industrial Printer HP LaserJet Pro",
    category: "Office Equipment",
    facility: "Main Office",
    status: "Available",
  },
  {
    id: 2,
    name: "Forklift Toyota 8FBU25",
    category: "Heavy Machinery",
    facility: "Warehouse A",
    status: "In Use",
  },
  {
    id: 3,
    name: "Conference Room Projector",
    category: "Audio/Visual",
    facility: "Main Office",
    status: "Maintenance",
  },
  {
    id: 4,
    name: "Safety Equipment Kit",
    category: "Safety",
    facility: "Warehouse B",
    status: "Available",
  },
  {
    id: 5,
    name: "Desktop Computer Dell OptiPlex",
    category: "IT Equipment",
    facility: "Main Office",
    status: "Available",
  },
  {
    id: 6,
    name: "Hydraulic Lift Scissor Jack",
    category: "Heavy Machinery",
    facility: "Workshop",
    status: "In Use",
  },
];

const categories = [
  "All Categories",
  "Office Equipment",
  "Heavy Machinery",
  "Audio/Visual",
  "Safety",
  "IT Equipment",
];
const facilities = [
  "All Facilities",
  "Main Office",
  "Warehouse A",
  "Warehouse B",
  "Workshop",
];

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFacility, setSelectedFacility] = useState("All Facilities");

  // Filter and search logic
  const filteredEquipment = useMemo(() => {
    return mockEquipment.filter((equipment) => {
      const matchesSearch = equipment.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" ||
        equipment.category === selectedCategory;
      const matchesFacility =
        selectedFacility === "All Facilities" ||
        equipment.facility === selectedFacility;

      return matchesSearch && matchesCategory && matchesFacility;
    });
  }, [searchTerm, selectedCategory, selectedFacility]);

  const getStatusColor = (status: EquipmentStatus): string => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "In Use":
        return "bg-orange-100 text-orange-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
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
              Equipment Management
            </h1>
            <p className="text-gray-600">
              Track and manage your equipment inventory
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Facility Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {facilities.map((facility) => (
                    <option key={facility} value={facility}>
                      {facility}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredEquipment.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                      {equipment.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        equipment.status
                      )}`}
                    >
                      {equipment.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Category:</span>{" "}
                      {equipment.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Facility:</span>{" "}
                      {equipment.facility}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No equipment found
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
