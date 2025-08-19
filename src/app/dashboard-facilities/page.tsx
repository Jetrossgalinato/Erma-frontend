"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

type Facility = {
  id: number;
  name: string;
  connection_type?: string;
  facility_type?: string;
  floor_level?: string;
  cooling_tools?: string;
  building?: string;
  remarks?: string;
  updated_at?: string;
  status?: string;
};

export default function DashboardFacilitiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [newFacility, setNewFacility] = useState<Partial<Facility>>({
    name: "",
  });

  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>("");
  const [floorLevelFilter, setFloorLevelFilter] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "facility type" | "floor level" | null
  >(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Partial<Facility>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Add pagination state after your existing state declarations
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11);

  const supabase = createClientComponentClient();

  const [, setUser] = useState<SupabaseUser | null>(null);
  const [, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error);
          router.push("/login");
          return;
        }

        if (!session?.user) {
          router.push("/login");
          return;
        }

        setUser(session.user);

        // Allow all authenticated users for now
        // TODO: Add role-based restrictions if needed
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
      // Add this new condition for actions dropdown
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFilterSelect = (filterType: "facility type" | "floor level") => {
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setFacilityTypeFilter("");
    setFloorLevelFilter("");
    setActiveFilter(null);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const fetchFacilities = useCallback(
    async (showAnimation = false) => {
      if (showAnimation) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching facilities:", error);
      } else {
        setFacilities(data as Facility[]);
      }

      if (showAnimation) {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      } else {
        setLoading(false);
      }
    },
    [supabase]
  );

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      fetchFacilities(true);
    }
  }, [isRefreshing, fetchFacilities]);

  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;
    const rowToEdit = facilities.find((eq) => eq.id === selectedRows[0]);
    if (rowToEdit) {
      setEditingFacility(rowToEdit);
      setShowEditModal(true);
    }
  };

  // Add these handler functions to your component

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditingFacility((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveEdit = async () => {
    if (!editingFacility) return;

    if (!editingFacility.name?.trim()) {
      alert("Facility name is required");
      return;
    }

    const { error } = await supabase
      .from("facilities")
      .update({
        ...editingFacility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingFacility.id);

    if (error) {
      console.error("Error updating facility:", error);
      alert("Failed to update facility");
    } else {
      // Update local state
      setFacilities((prev) =>
        prev.map((facility) =>
          facility.id === editingFacility.id ? editingFacility : facility
        )
      );
      setShowEditModal(false);
      setEditingFacility(null);
      setSelectedRows([]);
      console.log("Facility updated successfully");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingFacility(null);
  };

  const handleInsertFacility = async () => {
    if (!newFacility.name?.trim()) {
      alert("Facility name is required");
      return;
    }

    const { error } = await supabase.from("facilities").insert([
      {
        ...newFacility,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting facility:", error);
      alert("Failed to insert facility");
    } else {
      setShowInsertForm(false);
      setNewFacility({ name: "" });
      fetchFacilities(false);
    }
  };

  const getFilteredFacilities = () => {
    return facilities.filter((facility) => {
      const matchesFacilityType =
        !facilityTypeFilter ||
        facility.facility_type
          ?.toLowerCase()
          .includes(facilityTypeFilter.toLowerCase());

      const matchesFloorLevel =
        !floorLevelFilter ||
        facility.floor_level
          ?.toString()
          .toLowerCase()
          .includes(floorLevelFilter.toLowerCase());

      return matchesFacilityType && matchesFloorLevel;
    });
  };

  // Helper function to get unique facility types for dropdown
  const getUniqueFacilityTypes = () => {
    return [
      ...new Set(
        facilities.map((facility) => facility.facility_type).filter(Boolean)
      ),
    ].sort();
  };

  // Helper function to get unique floor levels for dropdown
  const getUniqueFloorLevels = () => {
    return [
      ...new Set(
        facilities.map((facility) => facility.floor_level).filter(Boolean)
      ),
    ].sort();
  };

  const filteredFacilities = getFilteredFacilities();
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFacilities = filteredFacilities.slice(startIndex, endIndex);

  const handleCancelInsert = () => {
    setShowInsertForm(false);
    setNewFacility({ name: "" });
  };

  // CSV-only version (no external dependencies needed)
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept CSV files in this version
    if (!file.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("CSV file must have at least a header row and one data row");
        return;
      }

      // Parse CSV headers
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));

      // Parse data rows
      const facilitiesData: Partial<Facility>[] = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const facility: Partial<Facility> = {};

        headers.forEach((header, index) => {
          const value = values[index] || "";

          // Map common header variations to your facility properties
          switch (header.toLowerCase()) {
            case "name":
            case "facility name":
              facility.name = value;
              break;
            case "connection type":
            case "connectiontype":
              facility.connection_type = value;
              break;
            case "facility type":
            case "facilitytype":
            case "type":
              facility.facility_type = value;
              break;
            case "floor level":
            case "floor":
            case "level":
              facility.floor_level = value;
              break;
            case "cooling tools":
            case "cooling":
              facility.cooling_tools = value;
              break;
            case "building":
              facility.building = value;
              break;
            case "status":
              facility.status = value;
              break;
            case "remarks":
            case "notes":
              facility.remarks = value;
              break;
          }
        });

        return facility;
      });

      setImportData(facilitiesData);
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      alert(
        "Error reading CSV file. Please make sure it's properly formatted."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportData = async () => {
    if (importData.length === 0) return;

    setIsProcessing(true);

    try {
      // Filter out rows without names (required field)
      const validData = importData.filter(
        (item) => item.name && item.name.trim()
      );

      if (validData.length === 0) {
        alert("No valid facilities found. Make sure each row has a name.");
        return;
      }

      // Add timestamps
      const facilitiesWithTimestamps = validData.map((facility) => ({
        ...facility,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("facilities")
        .insert(facilitiesWithTimestamps);

      if (error) {
        console.error("Error importing facilities:", error);
        alert("Failed to import facilities. Please try again.");
      } else {
        alert(`Successfully imported ${validData.length} facilities!`);
        setShowImportModal(false);
        setSelectedFile(null);
        setImportData([]);
        fetchFacilities(false); // Refresh the facilities list
      }
    } catch (error) {
      console.error("Error importing data:", error);
      alert("An error occurred while importing data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    const { error } = await supabase
      .from("facilities")
      .delete()
      .in("id", selectedRows);

    if (error) {
      console.error("Error deleting facilities:", error);
      alert("Failed to delete selected facilities");
    } else {
      // Update local state by filtering out all selected rows
      setFacilities((prev) =>
        prev.filter((facility) => !selectedRows.includes(facility.id))
      );
      setSelectedRows([]); // Clear the selection
      console.log(`Successfully deleted ${selectedRows.length} rows.`);
    }

    // Close the modal
    setShowDeleteModal(false);
  };

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
        <DashboardNavbar />
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
              lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="w-64 h-full">
          <Sidebar />
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 relative overflow-y-auto focus:outline-none mt-16">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-8 pt-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Facilities
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Welcome to the Facilities Dashboard. Here you can manage and
                    view all facilities.
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* Filter Icon Dropdown */}
                  <div className="relative" ref={filterDropdownRef}>
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeFilter || facilityTypeFilter || floorLevelFilter
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                        />
                      </svg>
                      Filter
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Filter Dropdown Menu */}
                    {showFilterDropdown && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          <button
                            onClick={() => handleFilterSelect("facility type")}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            Filter by Facility Type
                          </button>
                          <button
                            onClick={() => handleFilterSelect("floor level")}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                            Filter by Floor Level
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Filter Dropdown for Facility Type */}
                  {activeFilter === "facility type" && (
                    <select
                      value={facilityTypeFilter}
                      onChange={(e) => {
                        setFacilityTypeFilter(e.target.value);
                        setCurrentPage(1); // Reset to first page when filtering
                      }}
                      className="px-3 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Facility Types</option>
                      {getUniqueFacilityTypes().map((facilityType) => (
                        <option key={facilityType} value={facilityType}>
                          {facilityType}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Active Filter Dropdown for Floor Level */}
                  {activeFilter === "floor level" && (
                    <select
                      value={floorLevelFilter}
                      onChange={(e) => {
                        setFloorLevelFilter(e.target.value);
                        setCurrentPage(1); // Reset to first page when filtering
                      }}
                      className="px-3 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Floor Levels</option>
                      {getUniqueFloorLevels().map((floorLevel) => (
                        <option key={floorLevel} value={floorLevel}>
                          {floorLevel}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Clear Filter Button */}
                  {(facilityTypeFilter || floorLevelFilter || activeFilter) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1 inline"
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
                      Clear
                    </button>
                  )}

                  {/* Actions Dropdown Button */}
                  <div className="relative" ref={actionsDropdownRef}>
                    <button
                      onClick={() =>
                        setShowActionsDropdown(!showActionsDropdown)
                      }
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                        />
                      </svg>
                      Actions
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Actions Dropdown Menu */}
                    {showActionsDropdown && (
                      <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          {/* Insert Row Option */}
                          <button
                            onClick={() => {
                              setShowInsertForm(true);
                              setShowActionsDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <svg
                              className="w-4 h-4 mr-3 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Insert Row
                          </button>

                          {/* Import Data Option */}
                          <button
                            onClick={() => {
                              setShowImportModal(true);
                              setShowActionsDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <svg
                              className="w-4 h-4 mr-3 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                              />
                            </svg>
                            Import Data from CSV File
                          </button>

                          <hr className="my-1 border-gray-100" />

                          {/* Edit Selected Option */}
                          <button
                            onClick={() => {
                              handleEditClick();
                              setShowActionsDropdown(false);
                            }}
                            disabled={selectedRows.length !== 1}
                            className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                              selectedRows.length !== 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            <svg
                              className={`w-4 h-4 mr-3 ${
                                selectedRows.length !== 1
                                  ? "text-gray-400"
                                  : "text-blue-600"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit Selected (
                            {selectedRows.length === 1
                              ? "1"
                              : selectedRows.length}
                            )
                          </button>

                          {/* Delete Selected Option */}
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setShowActionsDropdown(false);
                            }}
                            disabled={selectedRows.length === 0}
                            className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                              selectedRows.length === 0
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-red-50 hover:text-red-900"
                            }`}
                          >
                            <svg
                              className={`w-4 h-4 mr-3 ${
                                selectedRows.length === 0
                                  ? "text-gray-400"
                                  : "text-red-600"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Selected ({selectedRows.length})
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* The Delete Confirmation Modal (moved here from the original location) */}
                  {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div
                        className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
                        onClick={() => setShowDeleteModal(false)}
                      ></div>
                      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full z-50">
                        <div className="p-6">
                          <div className="flex items-center justify-center">
                            <svg
                              className="h-10 w-10 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </div>
                          <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              Delete Selected Facilities
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to delete **
                                {selectedRows.length}** facility records? This
                                action cannot be undone.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center gap-3">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            onClick={handleDeleteSelectedRows}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => setShowDeleteModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keep the Refresh button separate */}
                  <button
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      isRefreshing
                        ? "cursor-not-allowed opacity-75"
                        : "hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`inline-block mr-2 transition-transform duration-300 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    >
                      ⟳
                    </span>
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">
                    Loading facilities...
                  </span>
                </div>
              ) : facilities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">
                    No facilities found.
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Insert Form Row */}
                  {showInsertForm && (
                    <div className="border-b border-gray-200 bg-green-50">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Add new facility
                          </h4>
                          <button
                            onClick={handleCancelInsert}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newFacility.name || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Facility name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Connection Type
                            </label>
                            <input
                              type="text"
                              value={newFacility.connection_type || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  connection_type: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Connection Type"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Facility Type
                            </label>
                            <input
                              type="text"
                              value={newFacility.facility_type || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  facility_type: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Facility Type"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Floor Level
                            </label>
                            <input
                              type="text"
                              value={newFacility.floor_level || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  floor_level: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Floor Level"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Cooling Tools
                            </label>
                            <input
                              type="text"
                              value={newFacility.cooling_tools || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  cooling_tools: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Cooling Tools"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Building
                            </label>
                            <input
                              type="text"
                              value={newFacility.building || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  building: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Building"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={newFacility.status || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  status: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select status</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Maintenance">
                                Under Maintenance
                              </option>
                              <option value="Renovation">
                                Under Renovation
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Remarks
                            </label>
                            <input
                              type="text"
                              value={newFacility.remarks || ""}
                              onChange={(e) =>
                                setNewFacility({
                                  ...newFacility,
                                  remarks: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Remarks"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelInsert}
                            className="px-3 py-1.5 text-sm text-black font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleInsertFacility}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-20">
                        <tr>
                          {/* Add a new header for the checkbox column */}
                          <th
                            scope="col"
                            className="sticky left-0 z-10 w-12 px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {/* Optional: Add a master checkbox to select/deselect all rows */}
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                              // Logic to check if all rows are selected
                              checked={
                                selectedRows.length === facilities.length &&
                                facilities.length > 0
                              }
                              onChange={() => {
                                if (selectedRows.length === facilities.length) {
                                  setSelectedRows([]); // Deselect all
                                } else {
                                  setSelectedRows(
                                    facilities.map((eq) => eq.id)
                                  ); // Select all
                                }
                              }}
                            />
                          </th>

                          <th
                            scope="col"
                            className="sticky left-12 z-10 px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider"
                          >
                            ID
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Name
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Connection Type
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Facility Type
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Floor Level
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Cooling Tools
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Building
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Remarks
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Updated At
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentFacilities.map((eq, index) => (
                          <tr
                            key={eq.id}
                            className={`hover:bg-gray-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="sticky left-0 z-10 w-12 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white border-r border-gray-200">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                                checked={selectedRows.includes(eq.id)}
                                onChange={() => handleCheckboxChange(eq.id)}
                              />
                            </td>
                            {/* ID Data Cell (Sticky) */}
                            <td className="sticky left-12 z-10 px-6 py-4 whitespace-nowrap text-sm text-gray-500 bg-white border-r border-gray-200">
                              {eq.id}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                              {eq.name}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {eq.connection_type}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {eq.facility_type}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.floor_level || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.cooling_tools || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.building || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.remarks || "-"}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.updated_at}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.status ? (
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    eq.status === "Active"
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : eq.status === "Inactive"
                                      ? "bg-gray-100 text-gray-800 border border-gray-200"
                                      : eq.status === "Maintenance"
                                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      : eq.status === "Renovation"
                                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                                      : "bg-gray-100 text-gray-500 border border-gray-200"
                                  }`}
                                >
                                  {eq.status}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, facilities.length)} of{" "}
                      {facilities.length} facilities
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm text-black border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Previous
                      </button>

                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm text-black border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Import Data Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
              onClick={() => setShowImportModal(false)}
            />

            <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Import Facilities Data
                </h3>

                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload file
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 mb-1">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500">
                        CSV files (.csv) up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  {importData.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Preview
                        </label>
                        <span className="text-xs text-gray-500">
                          {importData.length} row
                          {importData.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Connection Type
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Facility Type
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Floor Level
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Cooling Tools
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Building
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Status
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {importData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-gray-900 font-medium">
                                    {item.name || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.connection_type || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.facility_type || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.floor_level || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.cooling_tools || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.building || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        item.status === "Active"
                                          ? "bg-green-100 text-green-800"
                                          : item.status === "Inactive"
                                          ? "bg-gray-100 text-gray-800"
                                          : item.status === "Maintenance"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : item.status === "Renovation"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                    >
                                      {item.status || "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 truncate max-w-xs">
                                    {item.remarks || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing */}
                  {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                      <span className="ml-3 text-sm text-gray-600">
                        Processing facilities data...
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedFile(null);
                      setImportData([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportData}
                    disabled={importData.length === 0 || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing
                      ? "Importing..."
                      : `Import ${importData.length} Facilities`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingFacility && (
        <div className="fixed inset-0 z-50 text-black flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
            onClick={handleCancelEdit}
          ></div>
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full z-50">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Facility: {editingFacility.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingFacility.name || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Connection Type
                  </label>
                  <input
                    type="text"
                    name="connection_type"
                    value={editingFacility.connection_type || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Type
                  </label>
                  <input
                    type="text"
                    name="facility_type"
                    value={editingFacility.facility_type || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="text"
                    name="floor_level"
                    value={editingFacility.floor_level || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cooling Tools
                  </label>
                  <input
                    type="text"
                    name="cooling_tools"
                    value={editingFacility.cooling_tools || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={editingFacility.building || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editingFacility.status || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Under Maintenance</option>
                    <option value="Renovation">Under Renovation</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    rows={3}
                    value={editingFacility.remarks || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes or remarks..."
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
