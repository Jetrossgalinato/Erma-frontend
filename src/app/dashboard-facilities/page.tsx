"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import FacilitiesTable from "./components/FacilitiesTable";
import FilterControls from "./components/FilterControls";
import ActionsDropdown from "./components/ActionsDropdown";
import EditModal from "./components/EditModal";
import AddFacilityForm from "./components/AddFacilityForm";
import ImportModal from "./components/ImportModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import Pagination from "./components/Pagination";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import { RefreshCw } from "lucide-react";
import {
  fetchFacilities,
  createFacility,
  updateFacility,
  deleteFacilities,
  bulkImportFacilities,
  logFacilityAction,
  parseCSVToFacilities,
  getUniqueFacilityTypes,
  getUniqueFloorLevels,
  filterFacilities,
  type Facility,
  type FacilityFormData,
} from "./utils/helpers";

export default function DashboardFacilitiesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Data State
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [newFacility, setNewFacility] = useState<Partial<FacilityFormData>>({
    facility_name: "",
    facility_type: "",
    floor_level: "",
    capacity: 0,
    status: "Available",
  });
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [importData, setImportData] = useState<Partial<Facility>[]>([]);

  // Filter State
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>("");
  const [floorLevelFilter, setFloorLevelFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<
    "facility type" | "floor level" | null
  >(null);

  // Loading State
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);
  const actionsDropdownRef = useRef<HTMLDivElement | null>(null);

  // Auth check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
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

  // Fetch facilities
  const loadFacilities = useCallback(async (showAnimation = false) => {
    if (showAnimation) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchFacilities();
      setFacilities(data);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      if (showAnimation) {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFacilities();
    }
  }, [isAuthenticated, loadFacilities]);

  // Handlers
  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      loadFacilities(true);
    }
  }, [isRefreshing, loadFacilities]);

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentFacilitiesList = filteredFacilitiesComputed.slice(
        startIndex,
        endIndex
      );
      setSelectedRows(
        currentFacilitiesList.map((facility: Facility) => facility.id)
      );
    } else {
      setSelectedRows([]);
    }
  };

  const handleFilterSelect = (filterType: "facility type" | "floor level") => {
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setFacilityTypeFilter("");
    setFloorLevelFilter("");
    setActiveFilter(null);
  };

  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;
    const rowToEdit = facilities.find(
      (facility) => facility.id === selectedRows[0]
    );
    if (rowToEdit) {
      setEditingFacility(rowToEdit);
      setShowEditModal(true);
    }
  };

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

    if (!editingFacility.facility_name?.trim()) {
      alert("Facility name is required");
      return;
    }

    try {
      const updatedFacility = await updateFacility(editingFacility.id, {
        facility_name: editingFacility.facility_name,
        connection_type: editingFacility.connection_type,
        facility_type: editingFacility.facility_type,
        floor_level: editingFacility.floor_level,
        cooling_tools: editingFacility.cooling_tools,
        building: editingFacility.building,
        capacity: editingFacility.capacity || 0,
        status: editingFacility.status || "Available",
        remarks: editingFacility.remarks,
      });

      // Log the edit action
      await logFacilityAction("updated", editingFacility.facility_name);

      // Update local state
      setFacilities((prev) =>
        prev.map((facility) =>
          facility.id === updatedFacility.id ? updatedFacility : facility
        )
      );

      setShowEditModal(false);
      setEditingFacility(null);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error updating facility:", error);
      alert("Failed to update facility");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingFacility(null);
  };

  const handleNewFacilityChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewFacility((prev) => ({ ...prev, [name]: value }));
  };

  const handleInsertFacility = async () => {
    if (!newFacility.facility_name?.trim()) {
      alert("Facility name is required");
      return;
    }

    try {
      // Filter out empty string values and only send non-empty fields
      const cleanedData: Partial<FacilityFormData> = {};

      Object.entries(newFacility).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          cleanedData[key as keyof FacilityFormData] = value as never;
        }
      });

      console.log("Sending facility data:", cleanedData);
      await createFacility(cleanedData as FacilityFormData);

      // Log the insert action
      await logFacilityAction("created", newFacility.facility_name);

      setShowInsertForm(false);
      setNewFacility({
        facility_name: "",
        facility_type: "",
        floor_level: "",
        capacity: 0,
        status: "Available",
      });
      loadFacilities(false);
    } catch (error) {
      console.error("Error creating facility:", error);
      alert(
        error instanceof Error
          ? `Failed to create facility: ${error.message}`
          : "Failed to create facility"
      );
    }
  };

  const handleCancelInsert = () => {
    setShowInsertForm(false);
    setNewFacility({
      facility_name: "",
      facility_type: "",
      floor_level: "",
      capacity: 0,
      status: "Available",
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();
      const facilitiesData = parseCSVToFacilities(text);
      setImportData(facilitiesData);
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error reading CSV file. Please make sure it's properly formatted."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportData = async () => {
    if (importData.length === 0) return;

    setIsProcessing(true);

    try {
      // Filter out rows without facility_name (required field)
      const validData = importData.filter(
        (item) => item.facility_name && item.facility_name.trim()
      );

      if (validData.length === 0) {
        alert(
          "No valid facilities found. Make sure each row has a facility_name."
        );
        return;
      }

      const result = await bulkImportFacilities(validData);

      // Log the import action
      const facilityNames = validData
        .map((facility) => facility.facility_name)
        .join(", ");
      await logFacilityAction(
        "imported",
        undefined,
        `Imported ${result.imported} facilities: ${facilityNames}`
      );

      alert(`Successfully imported ${result.imported} facilities!`);
      setShowImportModal(false);
      setImportData([]);
      loadFacilities(false);
    } catch (error) {
      console.error("Error importing data:", error);
      alert("An error occurred while importing data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    try {
      // Get the names of facilities being deleted for logging
      const facilityNames = facilities
        .filter((facility) => selectedRows.includes(facility.id))
        .map((facility) => facility.facility_name);

      await deleteFacilities(selectedRows);

      // Log the delete action
      await logFacilityAction(
        "deleted",
        undefined,
        `Deleted ${selectedRows.length} facilities: ${facilityNames.join(", ")}`
      );

      // Update local state by filtering out all selected rows
      setFacilities((prev) =>
        prev.filter((facility) => !selectedRows.includes(facility.id))
      );
      setSelectedRows([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting facilities:", error);
      alert("Failed to delete selected facilities");
    }
  };

  // Computed values
  const uniqueFacilityTypes = getUniqueFacilityTypes(facilities);
  const uniqueFloorLevels = getUniqueFloorLevels(facilities);
  const filteredFacilitiesComputed = filterFacilities(
    facilities,
    facilityTypeFilter,
    floorLevelFilter
  );
  const totalPages = Math.ceil(
    filteredFacilitiesComputed.length / itemsPerPage
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    Facilities
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Welcome to the Facilities Dashboard. Here you can manage and
                    view all facilities.
                  </p>
                </div>
                <div className="flex gap-3">
                  <FilterControls
                    facilityTypeFilter={facilityTypeFilter}
                    floorLevelFilter={floorLevelFilter}
                    activeFilter={activeFilter}
                    showFilterDropdown={showFilterDropdown}
                    uniqueFacilityTypes={uniqueFacilityTypes}
                    uniqueFloorLevels={uniqueFloorLevels}
                    onFilterSelect={handleFilterSelect}
                    onFacilityTypeChange={setFacilityTypeFilter}
                    onFloorLevelChange={setFloorLevelFilter}
                    onClearFilters={clearFilters}
                    onToggleDropdown={() =>
                      setShowFilterDropdown(!showFilterDropdown)
                    }
                    dropdownRef={filterDropdownRef}
                  />

                  <ActionsDropdown
                    selectedRows={selectedRows}
                    isRefreshing={isRefreshing}
                    showActionsDropdown={showActionsDropdown}
                    onRefresh={handleRefreshClick}
                    onToggleDropdown={() =>
                      setShowActionsDropdown(!showActionsDropdown)
                    }
                    onAddNew={() => {
                      setShowInsertForm(true);
                      setShowActionsDropdown(false);
                    }}
                    onEdit={() => {
                      handleEditClick();
                      setShowActionsDropdown(false);
                    }}
                    onDelete={() => {
                      setShowDeleteModal(true);
                      setShowActionsDropdown(false);
                    }}
                    onImport={() => {
                      setShowImportModal(true);
                      setShowActionsDropdown(false);
                    }}
                    dropdownRef={actionsDropdownRef}
                  />

                  <button
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className={`bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      isRefreshing ? "cursor-not-allowed opacity-75" : ""
                    }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {showInsertForm && (
                <AddFacilityForm
                  facility={newFacility}
                  onChange={handleNewFacilityChange}
                  onSave={handleInsertFacility}
                  onCancel={handleCancelInsert}
                />
              )}

              {loading ? (
                <LoadingState />
              ) : facilities.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <FacilitiesTable
                    facilities={filteredFacilitiesComputed}
                    selectedRows={selectedRows}
                    onCheckboxChange={handleCheckboxChange}
                    onSelectAll={handleSelectAll}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                  />

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredFacilitiesComputed.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showImportModal && (
        <ImportModal
          importData={importData}
          isProcessing={isProcessing}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onImport={handleImportData}
          onCancel={() => {
            setShowImportModal(false);
            setImportData([]);
          }}
          onTriggerFileSelect={() => fileInputRef.current?.click()}
        />
      )}

      {showEditModal && editingFacility && (
        <EditModal
          facility={editingFacility}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onChange={handleEditChange}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          selectedCount={selectedRows.length}
          onConfirm={handleDeleteSelectedRows}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
