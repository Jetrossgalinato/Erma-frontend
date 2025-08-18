"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";
import { Search, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type EquipmentStatus = "Working" | "In Use" | "For Repair";

interface Equipment {
  id: number;
  created_at: string;
  name: string;
  po_number: string | null;
  unit_number: string | null;
  brand_name: string | null;
  description: string | null;
  facility: string | null;
  facility_id: number | null;
  facility_name?: string;
  category: string | null;
  status: EquipmentStatus;
  date_acquire: string | null;
  supplier: string | null;
  amount: string | null;
  estimated_life: string | null;
  item_number: string | null;
  property_number: string | null;
  control_number: string | null;
  serial_number: string | null;
  person_liable: string | null;
  remarks: string | null;
  updated_at?: string;
  image?: string | null;
}

const facility = [
  "All Facilities",
  "CL1",
  "CL2",
  "CL3",
  "CL4",
  "CL5",
  "CL6",
  "CL10",
  "CL11",
  "MULTIMEDIA LAB",
  "MSIT LAB",
  "NET LAB",
  "DEANS OFFICE",
  "FACULTY OFFICE",
  "REPAIR ROOM",
  "AIR LAB",
  "CHCI",
  "VLRC",
  "ICTC",
  "NAVIGATU",
];

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
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const [isAuthorized, setIsAuthorized] = useState(false);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowFormData, setBorrowFormData] = useState({
    purpose: "",
    start_date: "",
    end_date: "",
    return_date: "",
  });
  const [borrowing, setBorrowing] = useState(false);

  type EquipmentWithFacility = Equipment & {
    facilities?: {
      name: string;
    } | null;
  };

  // 3. Update the fetchEquipment function to include facility join
  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("equipments").select(`
      *,
      facilities!facility_id (
        name
      )
    `);

    if (error) {
      console.error("Failed to fetch equipment:", error);
    } else {
      // Transform the data to include facility_name
      const transformedData = (data as EquipmentWithFacility[])?.map(
        (item) => ({
          ...item,
          facility_name: item.facilities?.name || null,
        })
      ) as Equipment[];
      setEquipmentData(transformedData);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("User found:", user.id); // Debug line

        const { data: accountData, error } = await supabase
          .from("account_requests")
          .select("is_employee")
          .eq("user_id", user.id)
          .single();

        console.log("Account data:", accountData, "Error:", error); // Debug line

        const authorized = accountData?.is_employee === true;
        console.log("Is authorized:", authorized); // Debug line

        setIsAuthorized(authorized);
      } else {
        console.log("No user found"); // Debug line
        setIsAuthorized(false);
      }
    };

    checkUser();
  }, [supabase]);

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

  const paginatedEquipment = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredEquipment.slice(start, end);
  }, [filteredEquipment, currentPage]);

  // Modify the handleBorrow function to get the bigint user ID:
  const handleBorrow = async () => {
    if (!isAuthorized) {
      alert("You are not authorized to borrow equipment");
      return;
    }
    if (
      !selectedEquipment ||
      !borrowFormData.purpose ||
      !borrowFormData.start_date ||
      !borrowFormData.end_date ||
      !borrowFormData.return_date
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setBorrowing(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to borrow equipment");
        setBorrowing(false);
        return;
      }

      // Get the user's bigint ID from accounts table
      const { data: accountData, error: accountError } = await supabase
        .from("account_requests")
        .select("id")
        .eq("user_id", user.id) // or whatever column links to auth
        .single();

      if (accountError || !accountData) {
        alert("User account not found");
        setBorrowing(false);
        return;
      }

      const { error } = await supabase.from("borrowing").insert({
        borrowed_item: selectedEquipment.id,
        purpose: borrowFormData.purpose,
        start_date: borrowFormData.start_date,
        end_date: borrowFormData.end_date,
        return_date: borrowFormData.return_date,
        request_status: "Pending",
        availability: "Unavailable",
        borrowers_id: accountData.id,
      });

      if (error) {
        console.error("Failed to create borrowing request:", error);
        alert("Failed to create borrowing request");
      } else {
        alert("Borrowing request submitted successfully!");
        setShowBorrowModal(false);
        setBorrowFormData({
          purpose: "",
          start_date: "",
          end_date: "",
          return_date: "",
        });
        setSelectedEquipment(null);
        fetchEquipment();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
    setBorrowing(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedFacility]);

  const getStatusColor = (status: EquipmentStatus): string => {
    switch (status) {
      case "Working":
        return "bg-green-100 text-green-800";
      case "In Use":
        return "bg-orange-100 text-orange-800";
      case "For Repair":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className=" p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Equipments
              </h1>
              <p className="text-gray-600">
                View all equipment records, filter by category or facility, and
                search for specific items.
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
                  {facility.map((facility) => (
                    <option key={facility} value={facility}>
                      {facility}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            // Loading State
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-600">Loading equipment...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {paginatedEquipment.map((equipment) => (
                  <div
                    key={equipment.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Image section */}
                    <div className="h-48 bg-gray-200 relative">
                      {equipment.image ? (
                        <img
                          src={equipment.image}
                          alt={equipment.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      {/* Placeholder when no image or image fails to load */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${
                          equipment.image ? "hidden" : ""
                        }`}
                      >
                        <div className="text-center text-gray-400">
                          <svg
                            className="w-12 h-12 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    </div>

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
                          {equipment.facility_name ||
                            equipment.facility ||
                            "N/A"}
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

                        <button
                          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                            isAuthorized
                              ? "bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          onClick={
                            isAuthorized
                              ? () => {
                                  setSelectedEquipment(equipment);
                                  setShowBorrowModal(true);
                                }
                              : undefined
                          }
                          disabled={!isAuthorized}
                        >
                          Borrow
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-2 mb-12 space-x-2">
                {Array.from({
                  length: Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE),
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
            </>
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
                {selectedEquipment.property_number || "N/A"}
              </p>
              <p>
                <strong>Control Number:</strong>{" "}
                {selectedEquipment.control_number || "N/A"}
              </p>
              <p>
                <strong>Facility:</strong>{" "}
                {selectedEquipment.facility_name ||
                  selectedEquipment.facility ||
                  "N/A"}
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

      {showBorrowModal && selectedEquipment && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
          onClick={() => setShowBorrowModal(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBorrowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl text-gray-800 font-bold mb-4">
              Borrow Equipment: {selectedEquipment.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose *
                </label>
                <textarea
                  value={borrowFormData.purpose}
                  onChange={(e) =>
                    setBorrowFormData({
                      ...borrowFormData,
                      purpose: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  rows={3}
                  placeholder="Enter purpose for borrowing..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={borrowFormData.start_date}
                  onChange={(e) =>
                    setBorrowFormData({
                      ...borrowFormData,
                      start_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={borrowFormData.end_date}
                  onChange={(e) =>
                    setBorrowFormData({
                      ...borrowFormData,
                      end_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Return Date *
                </label>
                <input
                  type="date"
                  value={borrowFormData.return_date}
                  onChange={(e) =>
                    setBorrowFormData({
                      ...borrowFormData,
                      return_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBorrowModal(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBorrow}
                disabled={borrowing}
                className="flex-1 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {borrowing ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
