"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EquipmentDetailsModal from "./components/EquipmentDetailsModal";
import BorrowEquipmentModal from "./components/BorrowEquipmentModal";
import ImageModal from "./components/ImageModal";
import {
  Equipment,
  BorrowingFormData,
  FACILITIES,
  ITEMS_PER_PAGE,
  getStatusColor,
  getUniqueCategories,
  filterEquipment as filterEquipmentHelper,
  paginateEquipment as paginateEquipmentHelper,
  calculateTotalPages,
  fetchEquipmentList,
  checkUserAuthorization,
  createBorrowingRequest,
} from "./utils/helpers";

export default function EquipmentPage() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFacility, setSelectedFacility] = useState("All Facilities");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAuthorized, setIsAuthorized] = useState(false);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowFormData, setBorrowFormData] = useState<BorrowingFormData>({
    purpose: "",
    start_date: "",
    end_date: "",
    return_date: "",
  });
  const [borrowing, setBorrowing] = useState(false);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    const data = await fetchEquipmentList();
    setEquipmentData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const authorized = await checkUserAuthorization();
        setIsAuthorized(authorized);
      } catch (error) {
        console.error("Failed to check authorization:", error);
        setIsAuthorized(false);
      }
    };

    checkUser();
  }, []);

  const categories = useMemo(() => {
    return getUniqueCategories(equipmentData);
  }, [equipmentData]);

  const filteredEquipment = useMemo(() => {
    return filterEquipmentHelper(
      equipmentData,
      searchTerm,
      selectedCategory,
      selectedFacility
    );
  }, [equipmentData, searchTerm, selectedCategory, selectedFacility]);

  const paginatedEquipment = useMemo(() => {
    return paginateEquipmentHelper(
      filteredEquipment,
      currentPage,
      ITEMS_PER_PAGE
    );
  }, [filteredEquipment, currentPage]);

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
    const success = await createBorrowingRequest(
      selectedEquipment.id,
      borrowFormData
    );

    if (success) {
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
    setBorrowing(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedFacility]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <div className="p-3 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Equipments
                </h1>
                <p className="text-xs sm:text-base text-gray-600">
                  View all equipment records, filter by category or facility,
                  and search for specific items.
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-6">
                <button
                  onClick={fetchEquipment}
                  disabled={loading}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1 sm:gap-2 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4">
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-base text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    value={selectedCategory ?? ""}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-base text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-base text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    {FACILITIES.map((facilityName) => (
                      <option key={facilityName} value={facilityName}>
                        {facilityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-orange-500 mb-3 sm:mb-4 animate-spin" />
                <p className="text-xs sm:text-base text-gray-600">
                  Loading equipment...
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
                  {paginatedEquipment.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Image section */}
                      <div className="h-32 sm:h-48 bg-gray-200 relative">
                        {equipment.image ? (
                          <img
                            src={equipment.image}
                            alt={equipment.name}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setSelectedImage(equipment.image!);
                              setSelectedEquipment(equipment);
                              setShowImageModal(true);
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                        ) : null}
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${
                            equipment.image ? "hidden" : ""
                          }`}
                        >
                          <div className="text-center text-gray-400">
                            <svg
                              className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2"
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
                            <p className="text-xs sm:text-sm">No Image</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 sm:p-6">
                        <div className="flex justify-between items-start mb-2 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 pr-2">
                            {equipment.name}
                          </h3>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(
                              equipment.status,
                              equipment.availability
                            )}`}
                          >
                            {equipment.status === "Working"
                              ? equipment.availability || "Available"
                              : equipment.status}
                          </span>
                        </div>

                        <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Category:</span>{" "}
                            {equipment.category}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Facility:</span>{" "}
                            {equipment.facility_name ||
                              equipment.facility ||
                              "N/A"}
                          </p>
                        </div>

                        <div className="flex gap-1 sm:gap-2">
                          <button
                            className="flex-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                            onClick={() => {
                              setSelectedEquipment(equipment);
                              setShowModal(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className={`flex-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                              isAuthorized &&
                              equipment.availability !== "Borrowed"
                                ? "bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            onClick={
                              isAuthorized &&
                              equipment.availability !== "Borrowed"
                                ? () => {
                                    setSelectedEquipment(equipment);
                                    setShowBorrowModal(true);
                                  }
                                : undefined
                            }
                            disabled={
                              !isAuthorized ||
                              equipment.availability === "Borrowed"
                            }
                            title={
                              equipment.availability === "Borrowed"
                                ? "This equipment is currently borrowed"
                                : !isAuthorized
                                ? "You are not authorized to borrow equipment"
                                : "Borrow this equipment"
                            }
                          >
                            {equipment.availability === "Borrowed"
                              ? "Borrowed"
                              : "Borrow"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-1 sm:mt-2 mb-8 sm:mb-12 space-x-1 sm:space-x-2">
                  {Array.from({
                    length: calculateTotalPages(
                      filteredEquipment.length,
                      ITEMS_PER_PAGE
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

                {filteredEquipment.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                      No equipment found
                    </h3>
                    <p className="text-xs sm:text-base text-gray-600">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <EquipmentDetailsModal
        isOpen={showModal}
        equipment={selectedEquipment}
        onClose={() => setShowModal(false)}
      />

      <BorrowEquipmentModal
        isOpen={showBorrowModal}
        equipment={selectedEquipment}
        formData={borrowFormData}
        borrowing={borrowing}
        onClose={() => setShowBorrowModal(false)}
        onFormChange={setBorrowFormData}
        onSubmit={handleBorrow}
      />

      <Footer />

      <ImageModal
        isOpen={showImageModal}
        imageUrl={selectedImage}
        equipmentName={selectedEquipment?.name || null}
        onClose={() => setShowImageModal(false)}
      />
    </div>
  );
}
