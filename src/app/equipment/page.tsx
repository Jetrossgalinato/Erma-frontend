"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";
import { Search, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type EquipmentStatus = "Available" | "In Use" | "Maintenance";

interface Equipment {
  id: number;
  created_at: string;
  name: string;
  po_number: string | null;
  unit_number: string | null;
  brand_name: string | null;
  description: string | null;
  facility: string | null;
  category: string | null;
  status: EquipmentStatus;
  date_acquire: string | null;
  supplier: string | null;
  amount: string | null;
  estimated_life: string | null;
  item_number: string | null;
  property_num: string | null;
  control_numb: string | null;
  serial_number: string | null;
  person_liable: string | null;
  remarks: string | null;
  updated_at?: string;
}

export default function EquipmentPage() {
  const supabase = createClientComponentClient<Database>();
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFacility, setSelectedFacility] = useState("All Facilities");
  const [loading, setLoading] = useState(false);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("equipments").select("*");
    if (error) {
      console.error("Failed to fetch equipment:", error);
    } else {
      setEquipmentData(data as Equipment[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Generate unique categories and facilities dynamically
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        equipmentData
          .map((e) => e.category)
          .filter((cat): cat is string => cat !== null)
      )
    );
    return ["All Categories", ...unique];
  }, [equipmentData]);

  const facilities = useMemo(() => {
    const unique = Array.from(
      new Set(
        equipmentData
          .map((e) => e.facility)
          .filter((fac): fac is string => fac !== null)
      )
    );
    return ["All Facilities", ...unique];
  }, [equipmentData]);

  // Filtering logic
  const filteredEquipment = useMemo(() => {
    return equipmentData.filter((equipment) => {
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
  }, [equipmentData, searchTerm, selectedCategory, selectedFacility]);

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Equipment Management
            </h1>
            <p className="text-gray-600">
              Track and manage your equipment inventory
            </p>
          </div>
          <div className="flex gap-3 mb-6">
            <button
              onClick={fetchEquipment}
              disabled={loading}
              className="px-4 py-2 cursor-pointer text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
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

              <div className="md:col-span-3">
                <select
                  value={selectedCategory ?? ""}
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

              <div className="md:col-span-3">
                <select
                  value={selectedFacility ?? ""}
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
                    <button
                      className="flex-1 px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                      onClick={() => {
                        setSelectedEquipment(equipment);
                        setShowModal(true);
                      }}
                    >
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
      {showModal && selectedEquipment && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
          onClick={() => setShowModal(false)} // Clicking outside closes modal
        >
          <div
            className="bg-white rounded-lg w-full max-w-xl p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl text-gray-800 font-bold mb-4">
              {selectedEquipment.name}
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>PO Number:</strong>{" "}
                {selectedEquipment.po_number || "N/A"}
              </p>
              <p>
                <strong>Unit Number:</strong>{" "}
                {selectedEquipment.unit_number || "N/A"}
              </p>
              <p>
                <strong>Brand Name:</strong>{" "}
                {selectedEquipment.brand_name || "N/A"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedEquipment.description || "N/A"}
              </p>
              <p>
                <strong>Supplier:</strong> {selectedEquipment.supplier || "N/A"}
              </p>
              <p>
                <strong>Amount:</strong> {selectedEquipment.amount || "N/A"}
              </p>
              <p>
                <strong>Estimated Life:</strong>{" "}
                {selectedEquipment.estimated_life || "N/A"}
              </p>
              <p>
                <strong>Item Number:</strong>{" "}
                {selectedEquipment.item_number || "N/A"}
              </p>
              <p>
                <strong>Property Number:</strong>{" "}
                {selectedEquipment.property_num || "N/A"}
              </p>
              <p>
                <strong>Control Number:</strong>{" "}
                {selectedEquipment.control_numb || "N/A"}
              </p>
              <p>
                <strong>Person Liable:</strong>{" "}
                {selectedEquipment.person_liable || "N/A"}
              </p>
              <p>
                <strong>Remarks:</strong> {selectedEquipment.remarks || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
