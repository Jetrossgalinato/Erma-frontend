"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Supply,
  FACILITIES,
  ITEMS_PER_PAGE,
  getUniqueCategories,
  filterSupplies,
  paginateSupplies,
  calculateTotalPages,
  isLowStock,
  fetchSuppliesList,
  checkUserAuthentication,
  createAcquireRequest,
} from "./utils/helpers";

export default function SuppliesPage() {
  const [loading, setLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFacility, setSelectedFacility] = useState("All Facilities");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  const [showAcquireModal, setShowAcquireModal] = useState(false);
  const [acquireQuantity, setAcquireQuantity] = useState(1);
  const [acquireReason, setAcquireReason] = useState("");
  const [isSubmittingAcquire, setIsSubmittingAcquire] = useState(false);

  // Add these states after your existing useState declarations
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await checkUserAuthentication();
      setIsAuthenticated(authenticated);
      setUserLoading(false);
    };

    checkAuth();
  }, []);

  // Fetch supplies from FastAPI
  const fetchSupplies = useCallback(async () => {
    setLoading(true);
    const data = await fetchSuppliesList();
    setSupplies(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedFacility]);

  const categories = useMemo(() => {
    return getUniqueCategories(supplies);
  }, [supplies]);

  const filteredSupplies = useMemo(() => {
    return filterSupplies(
      supplies,
      searchTerm,
      selectedCategory,
      selectedFacility
    );
  }, [supplies, searchTerm, selectedCategory, selectedFacility]);

  const handleView = (supply: Supply) => {
    setSelectedSupply(supply);
    setShowViewModal(true);
  };

  const handleAcquire = (supply: Supply) => {
    setSelectedSupply(supply);
    setAcquireQuantity(1);
    setAcquireReason("");
    setShowAcquireModal(true);
  };

  const submitAcquireRequest = async () => {
    if (!selectedSupply || acquireQuantity <= 0) return;

    setIsSubmittingAcquire(true);

    const success = await createAcquireRequest(
      selectedSupply.supply_id,
      acquireQuantity,
      acquireReason
    );

    if (success) {
      alert("Acquire request submitted successfully!");
      setShowAcquireModal(false);
      setSelectedSupply(null);
      setAcquireQuantity(1);
      setAcquireReason("");
      fetchSupplies();
    }

    setIsSubmittingAcquire(false);
  };

  const handleImageClick = (imageUrl: string, supplyName: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageName(supplyName);
    setShowImageModal(true);
  };

  const paginatedSupply = useMemo(() => {
    return paginateSupplies(filteredSupplies, currentPage, ITEMS_PER_PAGE);
  }, [filteredSupplies, currentPage]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Supplies
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                View all supply records, filter by category, or search for
                specific supplies.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={fetchSupplies}
                disabled={loading}
                className="px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5 sm:gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4">
              <div className="md:col-span-6 relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search supply..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs sm:text-sm"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedCategory ?? ""}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs sm:text-sm"
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
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs sm:text-sm"
                >
                  {FACILITIES.map((facility) => (
                    <option key={facility} value={facility}>
                      {facility}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600 text-sm sm:text-base">
                  Loading supplies...
                </span>
              </div>
            ) : filteredSupplies.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-12">
                <div className="text-gray-500 text-base sm:text-lg mb-2">
                  No supplies found
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              paginatedSupply.map((supply) => (
                <div
                  key={supply.supply_id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  {supply.image_url && (
                    <div className="h-32 sm:h-40 md:h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={supply.image_url}
                        alt={supply.supply_name}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          handleImageClick(
                            supply.image_url!,
                            supply.supply_name
                          )
                        }
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="flex items-center justify-center h-full text-red-500 text-xs sm:text-sm">Failed to load image</div>';
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className="p-2 sm:p-3 md:p-4">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 sm:mb-3">
                      {supply.supply_name}
                    </h3>

                    <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="text-gray-900">{supply.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Facility:</span>
                        <span className="text-gray-900">
                          {supply.facility_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleView(supply)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        View
                      </button>
                      {userLoading ? (
                        <div className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 rounded-lg animate-pulse">
                          <div className="h-3 sm:h-4 bg-gray-300 rounded"></div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcquire(supply)}
                          className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                            isAuthenticated
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!isAuthenticated}
                          title={
                            !isAuthenticated
                              ? "You must be logged in to acquire supplies"
                              : ""
                          }
                        >
                          Acquire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-center mt-2 mb-8 sm:mb-12 space-x-1 sm:space-x-2">
            {Array.from({
              length: calculateTotalPages(
                filteredSupplies.length,
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
        </div>
      </div>
      <Footer />
      {/* Image Modal */}
      {showImageModal && selectedImageUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-75"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowImageModal(false);
              setSelectedImageUrl(null);
              setSelectedImageName("");
            }
          }}
          tabIndex={0}
          autoFocus
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedImageUrl(null);
                setSelectedImageName("");
              }}
              className="fixed top-2 sm:top-4 right-2 sm:right-4 z-10 p-1.5 sm:p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
              title="Close (Esc)"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Supply name */}
            <div className="fixed top-2 sm:top-4 left-2 sm:left-4 z-10 bg-black bg-opacity-50 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
              <p className="text-white text-xs sm:text-sm font-medium">
                {selectedImageName}
              </p>
            </div>

            {/* Image container */}
            <div
              className="relative w-full h-full flex items-center justify-center cursor-pointer"
              onClick={() => {
                setShowImageModal(false);
                setSelectedImageUrl(null);
                setSelectedImageName("");
              }}
            >
              <img
                src={selectedImageUrl}
                alt={`${selectedImageName} supply preview`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxWidth: "90vw", maxHeight: "90vh" }}
              />
            </div>
          </div>
        </div>
      )}

      {showAcquireModal && selectedSupply && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-2 sm:p-4"
          onClick={() => {
            setShowAcquireModal(false);
            setSelectedSupply(null);
            setAcquireQuantity(1);
            setAcquireReason("");
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-xs sm:max-w-md p-3 sm:p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowAcquireModal(false);
                setSelectedSupply(null);
                setAcquireQuantity(1);
                setAcquireReason("");
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>

            <h2 className="text-lg sm:text-xl text-gray-800 font-bold mb-3 sm:mb-4">
              Acquire Supply
            </h2>

            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                Supply: <strong>{selectedSupply.supply_name}</strong>
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                Available Stock:{" "}
                <span className="font-medium">
                  {selectedSupply.quantity} {selectedSupply.stock_unit}
                </span>
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1"
                >
                  Quantity to Acquire
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedSupply.quantity}
                  value={acquireQuantity}
                  onChange={(e) =>
                    setAcquireQuantity(parseInt(e.target.value) || 1)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1"
                >
                  Reason (Optional)
                </label>
                <textarea
                  id="reason"
                  value={acquireReason}
                  onChange={(e) => setAcquireReason(e.target.value)}
                  placeholder="Enter reason for acquiring this supply..."
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-16 sm:h-20 resize-none text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setShowAcquireModal(false);
                  setSelectedSupply(null);
                  setAcquireQuantity(1);
                  setAcquireReason("");
                }}
                className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmittingAcquire}
              >
                Cancel
              </button>
              <button
                onClick={submitAcquireRequest}
                disabled={
                  isSubmittingAcquire ||
                  acquireQuantity <= 0 ||
                  acquireQuantity > selectedSupply.quantity
                }
                className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
              >
                {isSubmittingAcquire && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
                {isSubmittingAcquire ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedSupply && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
          onClick={() => {
            setShowViewModal(false);
            setSelectedSupply(null);
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg sm:max-w-2xl p-3 sm:p-6 relative shadow-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedSupply(null);
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl sm:text-2xl text-gray-800 font-bold mb-3 sm:mb-4">
              {selectedSupply.supply_name}
            </h2>

            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p>
                <strong>Description:</strong>{" "}
                {selectedSupply.description || "N/A"}
              </p>
              <p>
                <strong>Category:</strong> {selectedSupply.category || "N/A"}
              </p>
              <p>
                <strong>Facility:</strong>{" "}
                {selectedSupply.facility_name || "N/A"}
              </p>
              <p>
                <strong>Current Stock:</strong>{" "}
                <span
                  className={
                    isLowStock(
                      selectedSupply.quantity,
                      selectedSupply.stocking_point
                    )
                      ? "text-red-600 font-medium"
                      : "text-green-600 font-medium"
                  }
                >
                  {selectedSupply.quantity} {selectedSupply.stock_unit}
                </span>
              </p>
              <p>
                <strong>Stocking Point:</strong> {selectedSupply.stocking_point}{" "}
                {selectedSupply.stock_unit}
              </p>
              <p>
                <strong>Remarks:</strong> {selectedSupply.remarks || "N/A"}
              </p>
            </div>

            {isLowStock(
              selectedSupply.quantity,
              selectedSupply.stocking_point
            ) && (
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-xs sm:text-sm font-medium">
                  ⚠️ Low Stock Alert
                </p>
                <p className="text-red-700 text-[10px] sm:text-xs">
                  Current stock is at or below the stocking point.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
