"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import SuppliesTable from "./components/SuppliesTable";
import FilterControls from "./components/FilterControls";
import ActionsDropdown from "./components/ActionsDropdown";
import EditModal from "./components/EditModal";
import AddSupplyForm from "./components/AddSupplyForm";
import ImportModal from "./components/ImportModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import Pagination from "./components/Pagination";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import ImageModal from "./components/ImageModal";
import {
  Supply,
  SupplyFormData,
  Facility,
  fetchSupplies,
  fetchFacilities,
  createSupply,
  updateSupply,
  deleteSupplies,
  bulkImportSupplies,
  logSupplyAction,
  parseCSVToSupplies,
  getUniqueCategories,
  getUniqueFacilities,
  filterSupplies,
  getStockStatus,
} from "./utils/helpers";

// Keep the old interface for compatibility during migration
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
  updated_at?: string;
}

export default function DashboardSuppliesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Data State
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [newSupply, setNewSupply] = useState<Partial<SupplyFormData>>({
    name: "",
    category: "",
    quantity: 0,
    stocking_point: 0,
    stock_unit: "",
  });
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [importData, setImportData] = useState<Partial<Supply>[]>([]);

  // Image-related states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [facilityFilter, setFacilityFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<
    "category" | "facility" | null
  >(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11;

  // Processing State
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth check - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

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

  const handleFilterSelect = (filterType: "category" | "facility") => {
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setFacilityFilter("");
    setActiveFilter(null);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Fetch facilities from FastAPI
  const loadFacilities = useCallback(async () => {
    try {
      const data = await fetchFacilities();
      setFacilities(data);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      setError("Failed to load facilities");
    }
  }, []);

  // Fetch supplies from FastAPI
  const loadSupplies = useCallback(async (showAnimation = false) => {
    if (showAnimation) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchSupplies();
      setSupplies(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching supplies:", error);
      setError("Failed to load supplies");
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

  // Refresh data handler
  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      loadSupplies(true);
    }
  }, [isRefreshing, loadSupplies]);

  // Replace the existing handleEditClick function
  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;
    const rowToEdit = supplies.find((supply) => supply.id === selectedRows[0]);
    if (rowToEdit) {
      setEditingSupply(rowToEdit);
      setShowEditModal(true);
      // Reset image states
      setEditImageFile(null);
      setEditImagePreview(null);
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditingSupply((prev) => {
      if (!prev) return null;

      // Handle numeric fields
      if (name === "quantity" || name === "stocking_point") {
        return { ...prev, [name]: parseInt(value) || 0 };
      }

      // Handle facility selection
      if (name === "facility_id") {
        const selectedFacility = facilities.find(
          (f) => f.id === parseInt(value)
        );
        return {
          ...prev,
          facilities: selectedFacility || { id: 0, name: "" },
        };
      }

      return { ...prev, [name]: value };
    });
  };

  // Add these functions after your existing handler functions
  const handleImageFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
      alert("Please select a PNG or JPG image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB");
      return;
    }

    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
      alert("Please select a PNG or JPG image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB");
      return;
    }

    setEditImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setEditImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImageSelection = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const clearEditImageSelection = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }
  };

  const handleImageClick = (imageUrl: string, supplyName: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageName(supplyName);
    setShowImageModal(true);
  };

  const removeCurrentImage = () => {
    if (editingSupply) {
      setEditingSupply({ ...editingSupply, image: undefined });
    }
  };

  // Replace the existing handleSaveEdit function
  // Save edited supply using FastAPI
  const handleSaveEdit = async () => {
    if (!editingSupply) return;

    if (!editingSupply.name?.trim()) {
      alert("Supply name is required");
      return;
    }

    if (!editingSupply.category?.trim()) {
      alert("Category is required");
      return;
    }

    if (!editingSupply.stock_unit?.trim()) {
      alert("Stock unit is required");
      return;
    }

    try {
      const supplyData: SupplyFormData = {
        name: editingSupply.name,
        description: editingSupply.description,
        category: editingSupply.category,
        quantity: editingSupply.quantity,
        stocking_point: editingSupply.stocking_point,
        stock_unit: editingSupply.stock_unit,
        facility_id: editingSupply.facilities.id,
        image: editingSupply.image,
        remarks: editingSupply.remarks,
      };

      // TODO: Handle image upload to FastAPI when endpoint is ready
      // For now, existing image URL is preserved
      if (editImageFile) {
        console.warn("Image upload to FastAPI not yet implemented");
      }

      const updatedSupply = await updateSupply(editingSupply.id, supplyData);

      // Log the action
      await logSupplyAction(
        "update",
        editingSupply.id,
        `Supply "${updatedSupply.name}" was updated`,
        `Category: ${updatedSupply.category}, Quantity: ${
          updatedSupply.quantity
        } ${updatedSupply.stock_unit}, Facility: ${
          updatedSupply.facilities?.name || "None"
        }`
      );

      // Update local state
      setSupplies((prev) =>
        prev.map((supply) =>
          supply.id === updatedSupply.id ? updatedSupply : supply
        )
      );

      setShowEditModal(false);
      setEditingSupply(null);
      setSelectedRows([]);
      clearEditImageSelection();
      console.log("Supply updated successfully");
    } catch (error) {
      console.error("Error updating supply:", error);
      alert("Failed to update supply");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingSupply(null);
    clearEditImageSelection();
  };

  // Insert new supply using FastAPI
  const handleInsertSupply = async () => {
    if (!newSupply.name?.trim()) {
      alert("Supply name is required");
      return;
    }

    if (!newSupply.category?.trim()) {
      alert("Category is required");
      return;
    }

    if (!newSupply.stock_unit?.trim()) {
      alert("Stock unit is required");
      return;
    }

    try {
      const supplyData: SupplyFormData = {
        name: newSupply.name!,
        description: newSupply.description,
        category: newSupply.category!,
        quantity: newSupply.quantity!,
        stocking_point: newSupply.stocking_point!,
        stock_unit: newSupply.stock_unit!,
        facility_id: newSupply.facility_id,
        image: newSupply.image,
        remarks: newSupply.remarks,
      };

      // TODO: Handle image upload to FastAPI when endpoint is ready
      if (selectedImageFile) {
        console.warn("Image upload to FastAPI not yet implemented");
      }

      const createdSupply = await createSupply(supplyData);

      // Log the action
      await logSupplyAction(
        "create",
        createdSupply.id,
        `Supply "${createdSupply.name}" was created`,
        `Category: ${createdSupply.category}, Quantity: ${createdSupply.quantity} ${createdSupply.stock_unit}`
      );

      setShowInsertForm(false);
      setNewSupply({
        name: "",
        category: "",
        quantity: 0,
        stocking_point: 0,
        stock_unit: "",
      });
      clearImageSelection();
      loadSupplies(false);
    } catch (error) {
      console.error("Error inserting supply:", error);
      alert("Failed to insert supply");
    }
  };

  // Use helper functions from helpers.ts for filtering
  const filteredSupplies = filterSupplies(
    supplies,
    searchQuery,
    categoryFilter,
    facilityFilter
  );
  const uniqueCategories = getUniqueCategories(supplies);
  const uniqueFacilities = getUniqueFacilities(supplies);

  const filteredSupplies = getFilteredSupplies();
  const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSupplies = filteredSupplies.slice(startIndex, endIndex);

  const handleCancelInsert = () => {
    setShowInsertForm(false);
    setNewSupply({
      name: "",
      category: "",
      quantity: 0,
      stocking_point: 0,
      stock_unit: "",
    });
    clearImageSelection();
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

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("CSV file must have at least a header row and one data row");
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));

      const suppliesData: Partial<Supplies>[] = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const supply: Partial<Supplies> = {};

        headers.forEach((header, index) => {
          const value = values[index] || "";

          switch (header.toLowerCase()) {
            case "name":
            case "supply name":
              supply.name = value;
              break;
            case "description":
              supply.description = value;
              break;
            case "category":
              supply.category = value;
              break;
            case "quantity":
              supply.quantity = parseInt(value) || 0;
              break;
            case "stocking point":
            case "stocking_point":
              supply.stocking_point = parseInt(value) || 0;
              break;
            case "stock unit":
            case "stock_unit":
            case "unit":
              supply.stock_unit = value;
              break;
            case "facility":
            case "facility_name":
              // Find facility by name
              const facility = facilities.find(
                (f) => f.name.toLowerCase() === value.toLowerCase()
              );
              if (facility) {
                supply.facilities = facility;
              }
              break;
            case "remarks":
            case "notes":
              supply.remarks = value;
              break;
          }
        });

        return supply;
      });

      setImportData(suppliesData);
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      alert(
        "Error reading CSV file. Please make sure it's properly formatted."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Import supplies from CSV using FastAPI
  const handleImportData = async () => {
    if (importData.length === 0) return;

    setIsProcessing(true);

    try {
      const validData = importData.filter(
        (item) =>
          item.name && item.name.trim() && item.category && item.stock_unit
      );

      if (validData.length === 0) {
        alert(
          "No valid supplies found. Make sure each row has name, category, and stock unit."
        );
        setIsProcessing(false);
        return;
      }

      const result = await bulkImportSupplies(validData as SupplyFormData[]);

      const importedSupplyNames = result
        .map((supply) => supply.name)
        .slice(0, 5)
        .join(", ");
      const remainingCount = Math.max(0, result.length - 5);
      const namesList =
        remainingCount > 0
          ? `${importedSupplyNames} and ${remainingCount} more`
          : importedSupplyNames;

      // Log the import action
      await logSupplyAction(
        "import",
        null,
        `${result.length} supplies were imported from CSV`,
        namesList
      );

      alert(`Successfully imported ${result.length} supplies!`);
      setShowImportModal(false);
      setSelectedFile(null);
      setImportData([]);
      loadSupplies(false);
    } catch (error) {
      console.error("Error importing data:", error);
      alert("An error occurred while importing data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete selected supplies using FastAPI
  const handleDeleteSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    try {
      const suppliesToDelete = supplies.filter((supply) =>
        selectedRows.includes(supply.id)
      );
      const supplyNames = suppliesToDelete
        .map((supply) => supply.name)
        .join(", ");

      await deleteSupplies(selectedRows);

      // Log the action
      await logSupplyAction(
        "delete",
        null,
        `${selectedRows.length} supply/supplies were deleted`,
        supplyNames
      );

      setSupplies((prev) =>
        prev.filter((supply) => !selectedRows.includes(supply.id))
      );
      setSelectedRows([]);
      console.log(`Successfully deleted ${selectedRows.length} rows.`);
    } catch (error) {
      console.error("Error deleting supplies:", error);
      alert("Failed to delete selected supplies");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // getStockStatus and logSupplyAction are now imported from helpers.ts

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadSupplies();
      loadFacilities();
    }
  }, [isAuthenticated, loadSupplies, loadFacilities]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Supplies
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Welcome to the Supplies Dashboard. Here you can manage and
                    track all supply inventory.
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* Filter Dropdown */}
                  <div className="relative" ref={filterDropdownRef}>
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeFilter || categoryFilter || facilityFilter
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-600"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          <button
                            onClick={() => handleFilterSelect("category")}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <Tag className="w-4 h-4 mr-3" />
                            Filter by Category
                          </button>
                          <button
                            onClick={() => handleFilterSelect("facility")}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <Building className="w-4 h-4 mr-3" />
                            Filter by Facility
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Filter Dropdown for Category */}
                  {activeFilter === "category" && (
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories().map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Active Filter Dropdown for Facility */}
                  {activeFilter === "facility" && (
                    <select
                      value={facilityFilter}
                      onChange={(e) => {
                        setFacilityFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Facilities</option>
                      {getUniqueFacilities().map((facility) => (
                        <option key={facility} value={facility}>
                          {facility}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Clear Filter Button */}
                  {(categoryFilter || facilityFilter || activeFilter) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1 inline" />
                      Clear
                    </button>
                  )}

                  {/* Actions Dropdown Button */}
                  <div className="relative" ref={actionsDropdownRef}>
                    <button
                      onClick={() =>
                        setShowActionsDropdown(!showActionsDropdown)
                      }
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium rounded-md shadow-sm transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Actions
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>

                    {/* Actions Dropdown Menu */}
                    {showActionsDropdown && (
                      <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          {/* Insert Row Option */}
                          <button
                            onClick={() => {
                              setShowInsertForm(true);
                              setShowActionsDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <Plus className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                            Insert Row
                          </button>

                          {/* Import Data Option */}
                          <button
                            onClick={() => {
                              setShowImportModal(true);
                              setShowActionsDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <Upload className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                            Import Data from CSV File
                          </button>

                          <hr className="my-1 border-gray-100 dark:border-gray-600" />

                          {/* Edit Selected Option */}
                          <button
                            onClick={() => {
                              handleEditClick();
                              setShowActionsDropdown(false);
                            }}
                            disabled={selectedRows.length !== 1}
                            className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                              selectedRows.length !== 1
                                ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                            }`}
                          >
                            <Edit className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
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
                                ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-400"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-3 text-red-600 dark:text-red-400" />
                            Delete Selected ({selectedRows.length})
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* The Delete Confirmation Modal */}
                  {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div
                        className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
                        onClick={() => setShowDeleteModal(false)}
                      ></div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-sm w-full z-50">
                        <div className="p-6">
                          <div className="flex items-center justify-center">
                            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              Delete Selected Supplies
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete{" "}
                                {selectedRows.length} supply records? This
                                action cannot be undone.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-center gap-3">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-700 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            onClick={handleDeleteSelectedRows}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
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

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading supplies...
                  </span>
                </div>
              ) : supplies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 text-lg">
                    No supplies found.
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  {/* Insert Form Row */}
                  {showInsertForm && (
                    <div className="border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Add new supply
                          </h4>
                          <button
                            onClick={handleCancelInsert}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newSupply.name || ""}
                              onChange={(e) =>
                                setNewSupply({
                                  ...newSupply,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Supply name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={newSupply.description || ""}
                              onChange={(e) =>
                                setNewSupply({
                                  ...newSupply,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Description"
                            />
                          </div>

                          {/* Add this in the insert form grid, after the facility field */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Image
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => imageInputRef.current?.click()}
                                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                  Choose Image
                                </button>
                                {selectedImageFile && (
                                  <button
                                    type="button"
                                    onClick={clearImageSelection}
                                    className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              {selectedImageFile && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Selected: {selectedImageFile.name}
                                </div>
                              )}

                              {imagePreview && (
                                <div className="mt-2">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-16 h-16 rounded border object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newSupply.category || ""}
                              onChange={(e) =>
                                setNewSupply({
                                  ...newSupply,
                                  category: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Category"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newSupply.quantity || 0}
                              onChange={(e) =>
                                setNewSupply({
                                  ...newSupply,
                                  quantity: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Stocking Point
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newSupply.stocking_point || 0}
                              onChange={(e) =>
                                setNewSupply({
                                  ...newSupply,
                                  stocking_point: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Stock Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newSupply.stock_unit || ""}
                              onChange={(e) =>
                                setNewSupply({
                                  ...newSupply,
                                  stock_unit: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="e.g., pieces, kg, liters"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Facility
                            </label>
                            <select
                              value={newSupply.facilities?.id || ""}
                              onChange={(e) => {
                                const selectedFacility = facilities.find(
                                  (f) => f.id === parseInt(e.target.value)
                                );
                                setNewSupply({
                                  ...newSupply,
                                  facilities: selectedFacility || {
                                    id: 0,
                                    name: "",
                                  },
                                });
                              }}
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select facility</option>
                              {facilities.map((facility) => (
                                <option key={facility.id} value={facility.id}>
                                  {facility.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Remarks
                            </label>
                            <input
                              type="text"
                              value={newSupply.remarks || ""}
                              onChange={(e) =>
                                setNewSupply({
                                  ...newSupply,
                                  remarks: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Additional notes"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelInsert}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleInsertSupply}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-20">
                        <tr>
                          <th
                            scope="col"
                            className="sticky left-0 z-10 w-12 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-green-600 dark:text-green-400 transition duration-150 ease-in-out"
                              checked={
                                selectedRows.length === supplies.length &&
                                supplies.length > 0
                              }
                              onChange={() => {
                                if (selectedRows.length === supplies.length) {
                                  setSelectedRows([]);
                                } else {
                                  setSelectedRows(
                                    supplies.map((supply) => supply.id)
                                  );
                                }
                              }}
                            />
                          </th>

                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Name
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Description
                          </th>

                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Image
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Category
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Quantity
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Stocking Point
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Stock Unit
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Facility
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Stock Status
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentSupplies.map((supply, index) => {
                          const stockStatus = getStockStatus(
                            supply.quantity,
                            supply.stocking_point
                          );
                          return (
                            <tr
                              key={supply.id}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                index % 2 === 0
                                  ? "bg-white dark:bg-gray-800"
                                  : "bg-gray-50/50 dark:bg-gray-700/20"
                              }`}
                            >
                              <td className="sticky left-0 z-10 w-12 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-green-600 dark:text-green-400 transition duration-150 ease-in-out"
                                  checked={selectedRows.includes(supply.id)}
                                  onChange={() =>
                                    handleCheckboxChange(supply.id)
                                  }
                                />
                              </td>

                              <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
                                {supply.name}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                                <div className="max-w-xs truncate">
                                  {supply.description || "-"}
                                </div>
                              </td>
                              {/* Add this after the checkbox cell, before the name cell */}
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                                {supply.image ? (
                                  <div className="flex items-center justify-center">
                                    <img
                                      src={supply.image}
                                      alt={`${supply.name} supply`}
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
                                      onClick={() =>
                                        handleImageClick(
                                          supply.image!,
                                          supply.name
                                        )
                                      }
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML =
                                            '<span class="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Failed to load</span>';
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <svg
                                      className="w-6 h-6 text-gray-400 dark:text-gray-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                  {supply.category}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 text-center font-mono">
                                {supply.quantity}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 text-center font-mono">
                                {supply.stocking_point}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                                {supply.stock_unit}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                                {supply.facilities?.name || "-"}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}
                                >
                                  {stockStatus.status}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                                <div className="max-w-xs truncate">
                                  {supply.remarks || "-"}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredSupplies.length)} of{" "}
                      {filteredSupplies.length} supplies
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Previous
                      </button>

                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
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

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Import Supplies Data
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Upload file
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload
                        className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-3"
                        strokeWidth={1.5}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        CSV files (.csv) up to 10MB
                      </p>
                    </div>
                  </div>

                  {importData.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Preview
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {importData.length} row
                          {importData.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Category
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Quantity
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Stock Unit
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Stocking Point
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Facility
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                              {importData.map((item, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 font-medium">
                                    {item.name || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {item.category || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {item.quantity || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {item.stock_unit || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {item.stocking_point || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {item.facilities?.name || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 dark:border-green-400 border-t-transparent"></div>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        Processing supplies data...
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedFile(null);
                      setImportData([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportData}
                    disabled={importData.length === 0 || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing
                      ? "Importing..."
                      : `Import ${importData.length} supplies`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            className="hidden"
          />
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSupply && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
              onClick={handleCancelEdit}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Edit Supply
                  </h3>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingSupply.name || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Supply name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={editingSupply.category || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Category"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="0"
                        value={editingSupply.quantity || 0}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stocking Point
                      </label>
                      <input
                        type="number"
                        name="stocking_point"
                        min="0"
                        value={editingSupply.stocking_point || 0}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock Unit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="stock_unit"
                        value={editingSupply.stock_unit || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., pieces, kg, liters"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Facility
                      </label>
                      <select
                        name="facility_id"
                        value={editingSupply.facilities?.id || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select facility</option>
                        {facilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={editingSupply.description || ""}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Supply description"
                    />
                  </div>

                  {/* Add this in the edit modal grid, after the facility field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image
                    </label>
                    <div className="space-y-3">
                      {/* Current Image Display */}
                      {editingSupply?.image && !editImagePreview && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Current Image:
                          </div>
                          <div className="flex items-center space-x-2">
                            <img
                              src={editingSupply.image}
                              alt="Current supply"
                              className="w-16 h-16 rounded border object-cover cursor-pointer hover:scale-105"
                              onClick={() =>
                                handleImageClick(
                                  editingSupply.image!,
                                  editingSupply.name
                                )
                              }
                            />
                            <button
                              type="button"
                              onClick={removeCurrentImage}
                              className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded"
                            >
                              Remove Current Image
                            </button>
                          </div>
                        </div>
                      )}

                      {/* New Image Upload Section */}
                      <div>
                        <button
                          type="button"
                          onClick={() => editImageInputRef.current?.click()}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {editingSupply?.image ? "Change Image" : "Add Image"}
                        </button>

                        {editImageFile && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            New image: {editImageFile.name}
                          </div>
                        )}

                        {editImagePreview && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Preview:
                            </div>
                            <img
                              src={editImagePreview}
                              alt="Preview"
                              className="w-16 h-16 rounded border object-cover cursor-pointer hover:scale-105"
                              onClick={() =>
                                handleImageClick(
                                  editImagePreview,
                                  `${editingSupply.name} (Preview)`
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      rows={2}
                      value={editingSupply.remarks || ""}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add this before the closing div of the main component */}
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
              <X className="w-6 h-6" />
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

      {/* Add these before the closing div of the main component */}
      {/* Hidden image input for new supply */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* Hidden image input for edit modal */}
      <input
        type="file"
        ref={editImageInputRef}
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleEditImageFileSelect}
        className="hidden"
      />
    </div>
  );
}
