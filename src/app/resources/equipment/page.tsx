"use client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";

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
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h3 className="text-xl font-semibold mb-3">
            College of Computing and Information Sciences (CCIS)
          </h3>
          <p className="text-slate-300 mb-6 text-base">
            Caraga State University - Ampayon, Butuan City, Caraga Region, 8600
            Philippines
          </p>
          <p className="text-slate-400 text-base mb-6">
            © 2025 CCIS ERMA. All rights reserved.
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center items-center gap-6">
            {/* Facebook Icon */}
            <a
              href="#"
              className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* GitHub Icon */}
            <a
              href="#"
              className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
