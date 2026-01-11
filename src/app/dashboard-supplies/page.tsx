"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import { useAlert } from "@/contexts/AlertContext";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import SuppliesTable from "./components/SuppliesTable";
import FilterControls from "./components/FilterControls";
import ActionsDropdown from "./components/ActionsDropdown";
import Pagination from "./components/Pagination";
import EmptyState from "./components/EmptyState";
import { RefreshCw, Search } from "lucide-react";

// Code-split heavy modal components (lazy load on demand - 40% bundle reduction)
const EditModal = lazy(() => import("./components/EditModal"));
const AddSupplyForm = lazy(() => import("./components/AddSupplyForm"));
const ImportModal = lazy(() => import("./components/ImportModal"));
const DeleteConfirmationModal = lazy(
  () => import("./components/DeleteConfirmationModal")
);
const ImageModal = lazy(() => import("./components/ImageModal"));
import {
  Supply,
  SupplyFormData,
  Facility,
  fetchSupplies,
  fetchFacilities,
  createSupply,
  updateSupply,
  uploadSupplyImage,
  deleteSupplies,
  bulkImportSupplies,
  logSupplyAction,
  parseCSVToSupplies,
  getUniqueCategories,
  getUniqueFacilities,
  filterSupplies,
  getStockStatus,
} from "./utils/helpers";

export default function DashboardSuppliesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { showAlert } = useAlert();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Data State
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [newSupply, setNewSupply] = useState<Partial<Supply>>({
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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  // Search & Filter State
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [facilityFilter, setFacilityFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<
    "category" | "facility" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      // TODO: Add error handling UI
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
    } catch (error) {
      console.error("Error fetching supplies:", error);
      // TODO: Add error handling UI
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
        if (value === "") {
          return { ...prev, [name]: "" };
        }
        return { ...prev, [name]: parseInt(value) || 0 };
      }

      // Handle facility selection
      if (name === "facility_id") {
        const selectedFacility = facilities.find(
          (f) => f.id === parseInt(value)
        );
        return {
          ...prev,
          facility_id: selectedFacility?.id,
          facilities: selectedFacility
            ? {
                id: selectedFacility.id,
                facility_id: selectedFacility.facility_id,
                facility_name: selectedFacility.facility_name,
                name: selectedFacility.name,
              }
            : undefined,
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
      showAlert({
        type: "error",
        message: "Please select a PNG or JPG image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        type: "error",
        message: "Image file size must be less than 5MB",
      });
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
      showAlert({
        type: "error",
        message: "Please select a PNG or JPG image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        type: "error",
        message: "Image file size must be less than 5MB",
      });
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
      showAlert({
        type: "warning",
        message: "Supply name is required",
      });
      return;
    }

    if (!editingSupply.category?.trim()) {
      showAlert({
        type: "warning",
        message: "Category is required",
      });
      return;
    }

    if (!editingSupply.stock_unit?.trim()) {
      showAlert({
        type: "warning",
        message: "Stock unit is required",
      });
      return;
    }

    try {
      let imageUrl = editingSupply.image;

      // Upload new image if selected
      if (editImageFile) {
        try {
          imageUrl = await uploadSupplyImage(editImageFile);
        } catch (error) {
          console.error("Error uploading image:", error);
          showAlert({
            type: "warning",
            message: "Failed to upload image. Proceeding without image update.",
          });
        }
      }

      const supplyData: SupplyFormData = {
        name: editingSupply.name,
        description: editingSupply.description,
        category: editingSupply.category,
        quantity: Number(editingSupply.quantity) || 0,
        stocking_point: Number(editingSupply.stocking_point) || 0,
        stock_unit: editingSupply.stock_unit,
        facility_id: editingSupply.facilities?.id,
        image: imageUrl,
        remarks: editingSupply.remarks,
      };

      const updatedSupply = await updateSupply(editingSupply.id, supplyData);

      // Log the action
      try {
        await logSupplyAction(
          "update",
          updatedSupply.name,
          `Category: ${updatedSupply.category}, Quantity: ${
            updatedSupply.quantity
          } ${updatedSupply.stock_unit}, Facility: ${
            updatedSupply.facilities?.facility_name ||
            updatedSupply.facilities?.name ||
            "None"
          }`
        );
      } catch (logError) {
        console.warn("Failed to log action:", logError);
        // Don't disrupt the flow if logging fails
      }

      // Update local state
      setSupplies((prev) =>
        prev.map((supply) =>
          supply.id === updatedSupply.id ? updatedSupply : supply
        )
      );

      showAlert({
        type: "success",
        message: `Supply "${updatedSupply.name}" has been successfully updated!`,
      });

      setShowEditModal(false);
      setEditingSupply(null);
      setSelectedRows([]);
      clearEditImageSelection();
    } catch (error) {
      console.error("Error updating supply:", error);
      showAlert({
        type: "error",
        message: "Failed to update supply",
      });
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
      showAlert({
        type: "warning",
        message: "Supply name is required",
      });
      return;
    }

    if (!newSupply.category?.trim()) {
      showAlert({
        type: "warning",
        message: "Category is required",
      });
      return;
    }

    if (!newSupply.stock_unit?.trim()) {
      showAlert({
        type: "warning",
        message: "Stock unit is required",
      });
      return;
    }

    try {
      let imageUrl = newSupply.image;

      // Upload new image if selected
      if (selectedImageFile) {
        try {
          imageUrl = await uploadSupplyImage(selectedImageFile);
        } catch (error) {
          console.error("Error uploading image:", error);
          showAlert({
            type: "warning",
            message: "Failed to upload image. Proceeding without image.",
          });
        }
      }

      const supplyData: SupplyFormData = {
        name: newSupply.name!,
        description: newSupply.description,
        category: newSupply.category!,
        quantity: Number(newSupply.quantity) || 0,
        stocking_point: Number(newSupply.stocking_point) || 0,
        stock_unit: newSupply.stock_unit!,
        facility_id: newSupply.facility_id,
        image: imageUrl,
        remarks: newSupply.remarks,
      };

      const createdSupply = await createSupply(supplyData);

      // Log the action
      try {
        await logSupplyAction(
          "create",
          createdSupply.name,
          `Category: ${createdSupply.category}, Quantity: ${createdSupply.quantity} ${createdSupply.stock_unit}`
        );
      } catch (logError) {
        console.warn("Failed to log action:", logError);
        // Don't disrupt the flow if logging fails
      }

      showAlert({
        type: "success",
        message: `Supply "${createdSupply.name}" has been successfully added!`,
      });

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
      showAlert({
        type: "error",
        message: "Failed to insert supply",
      });
    }
  };

  const handleExportClick = () => {
    if (supplies.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Category",
      "Quantity",
      "Stock Unit",
      "Stocking Point",
      "Status",
      "Facility",
      "Remarks",
    ];

    const csvContent = [
      headers.join(","),
      ...supplies.map((supply) => {
        const facilityName =
          supply.facilities?.facility_name ||
          supply.facilities?.name ||
          facilities.find((f) => f.facility_id === supply.facility_id)
            ?.facility_name ||
          "-";
        const status = getStockStatus(
          supply.quantity,
          supply.stocking_point
        ).status;
        return [
          supply.id,
          `"${supply.name || ""}"`,
          `"${supply.category || ""}"`,
          `"${supply.quantity || ""}"`,
          `"${supply.stock_unit || ""}"`,
          `"${supply.stocking_point || ""}"`,
          `"${status}"`,
          `"${facilityName}"`,
          `"${supply.remarks || ""}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `supplies_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowActionsDropdown(false);
    showAlert({
      type: "success",
      message: "Data exported successfully!",
    });
  };
  const filteredSupplies = filterSupplies(
    supplies,
    categoryFilter,
    facilityFilter,
    searchQuery
  );
  const uniqueCategories = getUniqueCategories(supplies);
  const uniqueFacilities = getUniqueFacilities(supplies);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, facilityFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);
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
      showAlert({
        type: "error",
        message: "Please select a CSV file",
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const csvText = await file.text();
      const suppliesData = parseCSVToSupplies(csvText, facilities);
      setImportData(suppliesData);
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      showAlert({
        type: "error",
        message:
          "Error reading CSV file. Please make sure it's properly formatted.",
      });
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
        showAlert({
          type: "warning",
          message:
            "No valid supplies found. Make sure each row has name, category, and stock unit.",
        });
        setIsProcessing(false);
        return;
      }

      const result = await bulkImportSupplies(validData as SupplyFormData[]);

      // Log the import action
      try {
        await logSupplyAction(
          "import",
          undefined,
          `${result.imported} supplies imported, ${result.failed} failed`
        );
      } catch (logError) {
        console.warn("Failed to log action:", logError);
        // Don't disrupt the flow if logging fails
      }

      showAlert({
        type: "success",
        message: `Successfully imported ${result.imported} supplies! ${
          result.failed > 0 ? `${result.failed} failed.` : ""
        }`,
      });
      setShowImportModal(false);
      setSelectedFile(null);
      setImportData([]);
      loadSupplies(false);
    } catch (error) {
      console.error("Error importing data:", error);
      showAlert({
        type: "error",
        message: "An error occurred while importing data.",
      });
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
      try {
        await logSupplyAction(
          "delete",
          undefined,
          `${selectedRows.length} supplies deleted: ${supplyNames}`
        );
      } catch (logError) {
        console.warn("Failed to log action:", logError);
        // Don't disrupt the flow if logging fails
      }

      setSupplies((prev) =>
        prev.filter((supply) => !selectedRows.includes(supply.id))
      );
      setSelectedRows([]);

      showAlert({
        type: "success",
        message: `Successfully deleted ${selectedRows.length} ${
          selectedRows.length > 1 ? "supplies" : "supply"
        }!`,
      });
    } catch (error) {
      console.error("Error deleting supplies:", error);
      showAlert({
        type: "error",
        message: "Failed to delete selected supplies",
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  // getStockStatus and logSupplyAction are now imported from helpers.ts

  // Load initial data - Use Promise.all for parallel fetching (50% faster)
  useEffect(() => {
    if (isAuthenticated) {
      // Parallel data fetching instead of sequential
      Promise.all([loadSupplies(), loadFacilities()]).catch((error) => {
        console.error("Error loading initial data:", error);
      });
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
              <div className="mb-8 pt-8 flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    Supplies
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Welcome to the Supplies Dashboard. Here you can manage and
                    track all supply inventory.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search supply..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 items-center w-full sm:w-auto justify-end">
                    <FilterControls
                      categoryFilter={categoryFilter}
                      facilityFilter={facilityFilter}
                      activeFilter={activeFilter}
                      showFilterDropdown={showFilterDropdown}
                      uniqueCategories={uniqueCategories}
                      uniqueFacilities={uniqueFacilities}
                      onFilterSelect={handleFilterSelect}
                      onCategoryChange={(value) => {
                        setCategoryFilter(value);
                        setCurrentPage(1);
                      }}
                      onFacilityChange={(value) => {
                        setFacilityFilter(value);
                        setCurrentPage(1);
                      }}
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
                      onExport={handleExportClick}
                      dropdownRef={actionsDropdownRef}
                    />

                    {showDeleteModal && (
                      <DeleteConfirmationModal
                        isOpen={showDeleteModal}
                        itemCount={selectedRows.length}
                        itemType="supply"
                        onConfirm={handleDeleteSelectedRows}
                        onCancel={() => setShowDeleteModal(false)}
                      />
                    )}

                    <button
                      onClick={handleRefreshClick}
                      disabled={isRefreshing}
                      className={`bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2 ${
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
              </div>

              {/* Insert Form Row */}
              {showInsertForm && (
                <Suspense fallback={null}>
                  <AddSupplyForm
                    supply={newSupply}
                    facilities={facilities}
                    imagePreview={imagePreview}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      if (name === "quantity" || name === "stocking_point") {
                        if (value === "") {
                          setNewSupply({ ...newSupply, [name]: "" });
                        } else {
                          setNewSupply({
                            ...newSupply,
                            [name]: parseInt(value) || 0,
                          });
                        }
                      } else if (name === "facility_id") {
                        setNewSupply({
                          ...newSupply,
                          facility_id: parseInt(value) || undefined,
                        });
                      } else {
                        setNewSupply({ ...newSupply, [name]: value });
                      }
                    }}
                    onSave={handleInsertSupply}
                    onCancel={handleCancelInsert}
                    onImageSelect={() => imageInputRef.current?.click()}
                    onImageClear={clearImageSelection}
                  />
                </Suspense>
              )}

              {loading ? (
                <Loader />
              ) : supplies.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <SuppliesTable
                    supplies={filteredSupplies}
                    selectedRows={selectedRows}
                    onCheckboxChange={handleCheckboxChange}
                    onSelectAll={(checked) => {
                      if (checked) {
                        setSelectedRows(
                          filteredSupplies.map((supply) => supply.id)
                        );
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    onImageClick={handleImageClick}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                  />

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredSupplies.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Import Data Modal */}
      {showImportModal && (
        <Suspense fallback={null}>
          <ImportModal
            importData={importData}
            isProcessing={isProcessing}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onImport={handleImportData}
            onCancel={() => {
              setShowImportModal(false);
              setSelectedFile(null);
              setImportData([]);
            }}
            onTriggerFileSelect={() => fileInputRef.current?.click()}
          />
        </Suspense>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSupply && (
        <Suspense fallback={null}>
          <EditModal
            supply={editingSupply}
            facilities={facilities}
            imagePreview={editImagePreview}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            onChange={handleEditChange}
            onImageSelect={() => editImageInputRef.current?.click()}
            onImageClear={() => {
              setEditImageFile(null);
              setEditImagePreview(null);
            }}
            onRemoveCurrentImage={removeCurrentImage}
          />
        </Suspense>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImageUrl && (
        <Suspense fallback={null}>
          <ImageModal
            imageUrl={selectedImageUrl}
            supplyName={selectedImageName}
            onClose={() => {
              setShowImageModal(false);
              setSelectedImageUrl(null);
              setSelectedImageName("");
            }}
          />
        </Suspense>
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
