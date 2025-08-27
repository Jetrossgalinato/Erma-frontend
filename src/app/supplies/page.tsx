"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";

interface Supplies {
  id: number;
  image?: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  stocking_point: number;
  stock_unit: string;
  facilities: {
    id: number;
    name: string;
  };
  remarks?: string;
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

export default function SuppliesPage() {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [supplies, setSupplies] = useState<Supplies[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFacility, setSelectedFacility] = useState("All Facilities");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supplies | null>(null);

  const [showAcquireModal, setShowAcquireModal] = useState(false);
  const [acquireQuantity, setAcquireQuantity] = useState(1);
  const [acquireReason, setAcquireReason] = useState("");
  const [isSubmittingAcquire, setIsSubmittingAcquire] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name?: string;
    email?: string;
  } | null>(null);

  // Add these states after your existing useState declarations
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSupplies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("supplies")
      .select("*, facilities(id, name)");

    if (error) {
      console.error("Error fetching supplies:", error);
    } else {
      setSupplies(data as Supplies[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setUserLoading(false);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedFacility]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        supplies
          .map((e) => e.category)
          .filter((cat): cat is string => cat !== null)
      )
    );
    return ["All Categories", ...unique];
  }, [supplies]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch user details from your user table (adjust table name as needed)
        const { data: userData } = await supabase
          .from("account_requests") // or whatever your user table is called
          .select("*")
          .eq("user_id", user.id) // adjust this field name to match your schema
          .single();

        setCurrentUser(userData);
      }
    };

    getCurrentUser();
  }, [supabase]);

  const filteredSupplies = useMemo(() => {
    return supplies.filter((supply) => {
      const matchesSearch =
        supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supply.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" ||
        supply.category === selectedCategory;
      const matchesFacility =
        selectedFacility === "All Facilities" ||
        supply.facilities.name === selectedFacility;

      return matchesSearch && matchesCategory && matchesFacility;
    });
  }, [supplies, searchTerm, selectedCategory, selectedFacility]);

  const handleView = (supply: Supplies) => {
    setSelectedSupply(supply);
    setShowViewModal(true);
  };

  const handleAcquire = (supply: Supplies) => {
    setSelectedSupply(supply);
    setAcquireQuantity(1);
    setAcquireReason("");
    setShowAcquireModal(true);
  };

  const submitAcquireRequest = async () => {
    if (!selectedSupply || acquireQuantity <= 0 || !currentUser) return;

    setIsSubmittingAcquire(true);

    try {
      // Insert acquire request into database
      const { error } = await supabase.from("acquiring").insert([
        {
          supply_id: selectedSupply.id,
          acquirers_id: currentUser.id,
          quantity: acquireQuantity,
          purpose: acquireReason || null,
          status: "Pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error submitting acquire request:", error);
        alert("Failed to submit acquire request. Please try again.");
      } else {
        alert("Acquire request submitted successfully!");
        setShowAcquireModal(false);
        setSelectedSupply(null);
        setAcquireQuantity(1);
        setAcquireReason("");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmittingAcquire(false);
    }
  };

  const handleImageClick = (imageUrl: string, supplyName: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageName(supplyName);
    setShowImageModal(true);
  };

  const paginatedSupply = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredSupplies.slice(start, end);
  }, [filteredSupplies, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Supplies
              </h1>
              <p className="text-gray-600">
                View all supply records, filter by category, or search for
                specific supplies.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchSupplies}
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
                  placeholder="Search supply..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Loading supplies...</span>
              </div>
            ) : filteredSupplies.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  No supplies found
                </div>
                <p className="text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              paginatedSupply.map((supply) => (
                <div
                  key={supply.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  {supply.image && (
                    <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={supply.image}
                        alt={supply.name}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          handleImageClick(supply.image!, supply.name)
                        }
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="flex items-center justify-center h-full text-red-500 text-sm">Failed to load image</div>';
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3">
                      {supply.name}
                    </h3>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="text-gray-900">{supply.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Facility:</span>
                        <span className="text-gray-900">
                          {supply.facilities.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(supply)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View
                      </button>
                      {userLoading ? (
                        <div className="flex-1 px-3 py-2 text-sm bg-gray-200 rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcquire(supply)}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                            user
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!user}
                          title={
                            !user
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
          <div className="flex justify-center mt-2 mb-12 space-x-2">
            {Array.from({
              length: Math.ceil(filteredSupplies.length / ITEMS_PER_PAGE),
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

      {/* Image Modal */}
      {showImageModal && selectedImageUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-75"
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
              className="fixed top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
              title="Close (Esc)"
            >
              <svg
                className="w-6 h-6"
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
            <div className="fixed top-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg px-3 py-2">
              <p className="text-white text-sm font-medium">
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
          className="fixed inset-0 z-50 backdrop-blur-sm  bg-opacity-40 flex items-center justify-center p-4"
          onClick={() => {
            setShowAcquireModal(false);
            setSelectedSupply(null);
            setAcquireQuantity(1);
            setAcquireReason("");
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg"
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

            <h2 className="text-xl text-gray-800 font-bold mb-4">
              Acquire Supply
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Supply: <strong>{selectedSupply.name}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Available Stock:{" "}
                <span className="font-medium">
                  {selectedSupply.quantity} {selectedSupply.stock_unit}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason (Optional)
                </label>
                <textarea
                  id="reason"
                  value={acquireReason}
                  onChange={(e) => setAcquireReason(e.target.value)}
                  placeholder="Enter reason for acquiring this supply..."
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAcquireModal(false);
                  setSelectedSupply(null);
                  setAcquireQuantity(1);
                  setAcquireReason("");
                }}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmittingAcquire}
              >
                Cancel
              </button>
              <button
                onClick={submitAcquireRequest}
                disabled={
                  isSubmittingAcquire ||
                  acquireQuantity <= 0 ||
                  acquireQuantity > selectedSupply.quantity ||
                  !currentUser
                }
                className="flex-1 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            className="bg-white rounded-lg w-full max-w-2xl p-6 relative shadow-lg max-h-[80vh] overflow-y-auto"
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

            <h2 className="text-2xl text-gray-800 font-bold mb-4">
              {selectedSupply.name}
            </h2>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Description:</strong>{" "}
                {selectedSupply.description || "N/A"}
              </p>
              <p>
                <strong>Category:</strong> {selectedSupply.category || "N/A"}
              </p>
              <p>
                <strong>Facility:</strong>{" "}
                {selectedSupply.facilities.name || "N/A"}
              </p>
              <p>
                <strong>Current Stock:</strong>{" "}
                <span
                  className={
                    selectedSupply.quantity <= selectedSupply.stocking_point
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

            {selectedSupply.quantity <= selectedSupply.stocking_point && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ Low Stock Alert
                </p>
                <p className="text-red-700 text-xs">
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
