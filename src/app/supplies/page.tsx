"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import { useAlert } from "@/contexts/AlertContext";
import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useAuthStore, useUIStore } from "@/store";
import {
  Supply,
  FACILITIES,
  ITEMS_PER_PAGE,
  getUniqueCategories,
  filterSupplies,
  paginateSupplies,
  calculateTotalPages,
  fetchSuppliesList,
  createAcquireRequest,
} from "./utils/helpers";
import SupplyDetailsModal from "./components/SupplyDetailsModal";
import AcquireSupplyModal from "./components/AcquireSupplyModal";
import ImageModal from "./components/ImageModal";
import Image from "next/image";

export default function SuppliesPage() {
  // Use stores for auth and UI state
  const { isAuthenticated, isLoading: userLoading } = useAuthStore();
  const { showAlert } = useAlert();
  const searchTerm = useUIStore((state) => state.searchTerms.supplies || "");
  const setSearchTerm = useUIStore((state) => state.setSearchTerm);
  const currentPage = useUIStore(
    (state) => state.pagination.supplies?.currentPage || 1
  );
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);

  // Local state for supplies data (due to type conflicts)
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);

  // Local UI state
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
    setCurrentPage("supplies", 1);
  }, [searchTerm, selectedCategory, selectedFacility, setCurrentPage]);

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
      acquireReason,
      showAlert
    );

    if (success) {
      showAlert({
        type: "success",
        message: "Acquire request submitted successfully!",
      });
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
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-1 sm:mb-2">
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
                  placeholder="Search supplies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm("supplies", e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015]"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedCategory ?? ""}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs sm:text-sm shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015]"
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
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs sm:text-sm shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015]"
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
              <div className="col-span-full">
                <Loader />
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
                      <Image
                        src={supply.image_url}
                        alt={supply.supply_name}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        width={500}
                        height={500}
                        sizes="100vw"
                        priority
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
          <Pagination
            currentPage={currentPage}
            totalPages={calculateTotalPages(
              filteredSupplies.length,
              ITEMS_PER_PAGE
            )}
            onPageChange={(page) => setCurrentPage("supplies", page)}
          />
        </div>
      </div>
      <Footer />

      {/* Modals */}
      <ImageModal
        isOpen={showImageModal}
        imageUrl={selectedImageUrl}
        imageName={selectedImageName}
        onClose={() => {
          setShowImageModal(false);
          setSelectedImageUrl(null);
          setSelectedImageName("");
        }}
      />

      <AcquireSupplyModal
        isOpen={showAcquireModal}
        supply={selectedSupply}
        quantity={acquireQuantity}
        reason={acquireReason}
        isSubmitting={isSubmittingAcquire}
        onQuantityChange={setAcquireQuantity}
        onReasonChange={setAcquireReason}
        onSubmit={submitAcquireRequest}
        onClose={() => {
          setShowAcquireModal(false);
          setSelectedSupply(null);
          setAcquireQuantity(1);
          setAcquireReason("");
        }}
      />

      <SupplyDetailsModal
        isOpen={showViewModal}
        supply={selectedSupply}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSupply(null);
        }}
      />
    </div>
  );
}
