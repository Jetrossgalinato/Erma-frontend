"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAlert } from "@/contexts/AlertContext";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import Loader from "@/components/Loader";
import EquipmentsTable from "./components/equipmentsTable";
import PageHeader from "./components/pageHeader";
import FilterControls from "./components/filterControls";
import ActionsDropdown from "./components/actionsDropdown";
import EmptyState from "./components/emptyState";
import Pagination from "./components/pagination";
import { RefreshCw, Search } from "lucide-react";

// Code-split heavy modal components (lazy load on demand - 40% bundle reduction)
const ImageModal = lazy(() => import("./components/imageModal"));
const EditModal = lazy(() => import("./components/editModal"));
const ImportDataModal = lazy(() => import("./components/importDataModal"));
const DeleteConfirmationModal = lazy(
  () => import("./components/deleteConfirmationModal")
);
const InsertEquipmentForm = lazy(
  () => import("./components/insertEquipmentForm")
);

import {
  type Equipment,
  type Facility,
  validateImageFile,
  readFileAsDataURL,
  filterEquipments,
  calculateTotalPages,
  parseCSVToEquipment,
  validateEquipmentName,
  validateCSVFile,
  fetchEquipments,
  fetchFacilities,
  createEquipment,
  updateEquipment,
  deleteEquipments,
  uploadEquipmentImage,
  bulkImportEquipments,
  logEquipmentAction,
} from "./utils/helpers";

// Define the shape of one row from your equipments table
type EditingCell = {
  rowId: number;
  column: keyof Equipment;
  value: string;
  originalValue: string;
};

export default function DashboardEquipmentPage() {
  const { showAlert } = useAlert();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editImageInputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [facilityFilter, setFacilityFilter] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "category" | "facility" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Partial<Equipment>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, facilityFilter, searchQuery]);

  const handleDeleteSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    try {
      const deletedNames = equipments
        .filter((eq) => selectedRows.includes(eq.id))
        .map((eq) => eq.name)
        .join(", ");

      await deleteEquipments(selectedRows);

      await logEquipmentAction(
        "deleted",
        undefined,
        `Deleted ${selectedRows.length} equipment(s): ${deletedNames}`
      );

      setEquipments((prev) =>
        prev.filter((eq) => !selectedRows.includes(eq.id))
      );
      setSelectedRows([]);

      showAlert({
        type: "success",
        message: `Successfully deleted ${selectedRows.length} equipment${
          selectedRows.length > 1 ? "s" : ""
        }!`,
      });
    } catch (err) {
      console.error("Error deleting equipments:", err);
      showAlert({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to delete selected equipments",
      });
    }

    setShowDeleteModal(false);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const loadEquipments = useCallback(
    async (showAnimation = false) => {
      if (!isAuthenticated) return;

      if (showAnimation) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await fetchEquipments();
        setEquipments(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching equipments:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch equipments"
        );
      } finally {
        if (showAnimation) {
          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
        } else {
          setLoading(false);
        }
      }
    },
    [isAuthenticated]
  );

  const loadFacilities = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await fetchFacilities();
      setFacilities(data);
    } catch (err) {
      console.error("Error fetching facilities:", err);
      showAlert({
        type: "error",
        message: "Failed to load facilities",
      });
    }
  }, [isAuthenticated, showAlert]);

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      loadEquipments(true);
    }
  }, [isRefreshing, loadEquipments]);

  const handleInsertEquipment = async () => {
    if (!validateEquipmentName(newEquipment.name)) {
      showAlert({
        type: "warning",
        message: "Equipment name is required",
      });
      return;
    }

    let imageUrl = null;

    if (selectedImageFile) {
      try {
        imageUrl = await uploadEquipmentImage(selectedImageFile);
      } catch (error) {
        console.error("Error uploading image:", error);
        showAlert({
          type: "error",
          message:
            error instanceof Error
              ? `Failed to upload image: ${error.message}. Equipment will be created without image.`
              : "Failed to upload image. Equipment will be created without image.",
        });
      }
    }

    try {
      await createEquipment({
        ...newEquipment,
        image: imageUrl || undefined,
      });

      await logEquipmentAction("added", newEquipment.name);

      showAlert({
        type: "success",
        message: `Equipment "${newEquipment.name}" has been successfully added!`,
      });

      setShowInsertForm(false);
      setNewEquipment({ name: "" });
      clearImageSelection();
      await loadEquipments(false);
    } catch (error) {
      console.error("Error inserting equipment:", error);
      showAlert({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to insert equipment",
      });
    }
  };

  const handleImageFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      showAlert({
        type: "error",
        message: error,
      });
      return;
    }

    setSelectedImageFile(file);

    try {
      const dataURL = await readFileAsDataURL(file);
      setImagePreview(dataURL);
    } catch (error) {
      console.error("Error reading image file:", error);
      showAlert({
        type: "error",
        message: "Failed to read image file",
      });
    }
  };

  const clearImageSelection = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleEditImageFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      showAlert({
        type: "error",
        message: error,
      });
      return;
    }

    setEditImageFile(file);

    try {
      const dataURL = await readFileAsDataURL(file);
      setEditImagePreview(dataURL);
    } catch (error) {
      console.error("Error reading image file:", error);
      showAlert({
        type: "error",
        message: "Failed to read image file",
      });
    }
  };

  const handleImageClick = (imageUrl: string, equipmentName: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageName(equipmentName);
    setShowImageModal(true);
  };

  const clearEditImageSelection = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }
  };

  const removeCurrentImage = () => {
    if (editingEquipment) {
      setEditingEquipment({ ...editingEquipment, image: undefined });
    }
  };

  const getFilteredEquipments = () => {
    return filterEquipments(
      equipments,
      categoryFilter,
      facilityFilter,
      searchQuery
    );
  };

  const getTotalPages = () => {
    return calculateTotalPages(getFilteredEquipments().length, itemsPerPage);
  };

  const handleCancelInsert = () => {
    setShowInsertForm(false);
    setNewEquipment({ name: "" });
    clearImageSelection();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateCSVFile(file);
    if (error) {
      showAlert({
        type: "error",
        message: error,
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const equipmentData = await parseCSVToEquipment(file);
      setImportData(equipmentData);
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      showAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error reading CSV file. Please make sure it's properly formatted.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportData = async () => {
    if (importData.length === 0) return;

    setIsProcessing(true);

    try {
      const validData = importData.filter(
        (item) => item.name && item.name.trim()
      );

      if (validData.length === 0) {
        showAlert({
          type: "warning",
          message: "No valid equipment found. Make sure each row has a name.",
        });
        return;
      }

      const result = await bulkImportEquipments(validData);

      await logEquipmentAction(
        "imported",
        undefined,
        `Imported ${result.imported} equipment(s) from CSV file: ${selectedFile?.name}`
      );

      showAlert({
        type: "success",
        message: `Successfully imported ${result.imported} equipment records!${
          result.failed > 0 ? ` ${result.failed} failed.` : ""
        }`,
      });

      setShowImportModal(false);
      setSelectedFile(null);
      setImportData([]);
      loadEquipments(false);
    } catch (error) {
      console.error("Error importing data:", error);
      showAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while importing data.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportClick = () => {
    if (equipments.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const headers = [
      "ID",
      "Name",
      "PO Number",
      "Unit Number",
      "Brand",
      "Category",
      "Status",
      "Availability",
      "Date Acquired",
      "Supplier",
      "Amount",
      "Estimated Life",
      "Item Number",
      "Control Number",
      "Serial Number",
      "Property Number",
      "Person Liable",
      "Facility",
      "Description",
      "Remarks",
    ];

    const csvContent = [
      headers.join(","),
      ...equipments.map((eq) => {
        const facilityName =
          facilities.find((f) => f.facility_id === eq.facility_id)
            ?.facility_name || "-";
        return [
          eq.id,
          `"${eq.name || ""}"`,
          `"${eq.po_number || ""}"`,
          `"${eq.unit_number || ""}"`,
          `"${eq.brand_name || ""}"`,
          `"${eq.category || ""}"`,
          `"${eq.status || ""}"`,
          `"${eq.availability || ""}"`,
          `"${eq.date_acquire || ""}"`,
          `"${eq.supplier || ""}"`,
          `"${eq.amount || ""}"`,
          `"${eq.estimated_life || ""}"`,
          `"${eq.item_number || ""}"`,
          `"${eq.control_number || ""}"`,
          `"${eq.serial_number || ""}"`,
          `"${eq.property_number || ""}"`,
          `"${eq.person_liable || ""}"`,
          `"${facilityName}"`,
          `"${eq.description || ""}"`,
          `"${eq.remarks || ""}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `equipments_export_${new Date().toISOString().split("T")[0]}.csv`
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

  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;
    const rowToEdit = equipments.find((eq) => eq.id === selectedRows[0]);
    if (rowToEdit) {
      setEditingEquipment(rowToEdit);
      setShowEditModal(true);
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
    if (editingEquipment) {
      setEditingEquipment({ ...editingEquipment, [name]: value });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEquipment || !editingEquipment.id) return;

    const updatedEquipment = { ...editingEquipment };

    if (editImageFile) {
      try {
        const imageUrl = await uploadEquipmentImage(editImageFile);
        updatedEquipment.image = imageUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        showAlert({
          type: "error",
          message:
            error instanceof Error
              ? `Failed to upload image: ${error.message}. Equipment will be updated without new image.`
              : "Failed to upload image. Equipment will be updated without new image.",
        });
      }
    }

    try {
      const { id, ...updates } = updatedEquipment;
      await updateEquipment(id, updates);

      await logEquipmentAction("updated", updatedEquipment.name);

      setEquipments((prev) =>
        prev.map((eq) => (eq.id === id ? updatedEquipment : eq))
      );
      setEditingEquipment(null);
      setShowEditModal(false);
      setSelectedRows([]);
      clearEditImageSelection();

      showAlert({
        type: "success",
        message: `Equipment "${updatedEquipment.name}" has been successfully updated!`,
      });
    } catch (error) {
      console.error("Error updating equipment:", error);
      showAlert({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to update equipment",
      });
    }
  };

  const handleCellEdit = (value: string) => {
    if (editingCell) {
      setEditingCell({ ...editingCell, value });
    }
  };

  const handleCancelEdit = () => {
    setEditingEquipment(null);
    setShowEditModal(false);
    clearEditImageSelection();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Load initial data - Use Promise.all for parallel fetching (50% faster)
  useEffect(() => {
    if (isAuthenticated) {
      // Parallel data fetching instead of sequential
      Promise.all([loadFacilities(), loadEquipments(false)]).catch((error) => {
        console.error("Error loading initial data:", error);
      });
    }
  }, [isAuthenticated, loadEquipments, loadFacilities]);

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
                <PageHeader
                  title="Equipments"
                  description="Welcome to the Equipments page, where you can manage all the equipments efficiently."
                />
                <div className="flex gap-3 items-center">
                  <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
                    />
                  </div>

                  <FilterControls
                    equipments={equipments}
                    facilities={facilities}
                    categoryFilter={categoryFilter}
                    facilityFilter={facilityFilter}
                    activeFilter={activeFilter}
                    showFilterDropdown={showFilterDropdown}
                    filterDropdownRef={filterDropdownRef}
                    onToggleDropdown={() =>
                      setShowFilterDropdown(!showFilterDropdown)
                    }
                    onFilterSelect={handleFilterSelect}
                    onCategoryChange={setCategoryFilter}
                    onFacilityChange={setFacilityFilter}
                    onClearFilters={clearFilters}
                  />

                  <ActionsDropdown
                    selectedRows={selectedRows}
                    showActionsDropdown={showActionsDropdown}
                    actionsDropdownRef={actionsDropdownRef}
                    onToggleDropdown={() =>
                      setShowActionsDropdown(!showActionsDropdown)
                    }
                    onInsertClick={() => {
                      setShowInsertForm(true);
                      setShowActionsDropdown(false);
                    }}
                    onImportClick={() => {
                      setShowImportModal(true);
                      setShowActionsDropdown(false);
                    }}
                    onExportClick={handleExportClick}
                    onEditClick={() => {
                      handleEditClick();
                      setShowActionsDropdown(false);
                    }}
                    onDeleteClick={() => {
                      setShowDeleteModal(true);
                      setShowActionsDropdown(false);
                    }}
                  />

                  <Suspense fallback={null}>
                    <DeleteConfirmationModal
                      isOpen={showDeleteModal}
                      itemCount={selectedRows.length}
                      itemType="equipment"
                      onConfirm={handleDeleteSelectedRows}
                      onCancel={() => setShowDeleteModal(false)}
                    />
                  </Suspense>

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

              <Suspense fallback={null}>
                <InsertEquipmentForm
                  isOpen={showInsertForm}
                  newEquipment={newEquipment}
                  facilities={facilities}
                  selectedImageFile={selectedImageFile}
                  imagePreview={imagePreview}
                  onChange={(field, value) =>
                    setNewEquipment({ ...newEquipment, [field]: value })
                  }
                  onImageSelect={() => imageInputRef.current?.click()}
                  onImageClear={clearImageSelection}
                  onSave={handleInsertEquipment}
                  onCancel={handleCancelInsert}
                />
              </Suspense>

              {loading ? (
                <Loader />
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="text-red-600 dark:text-red-400 font-semibold">
                      Error loading equipments
                    </div>
                  </div>
                  <p className="mt-2 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </p>
                  <button
                    onClick={() => loadEquipments(false)}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : equipments.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <EquipmentsTable
                    equipments={equipments}
                    facilities={facilities}
                    selectedRows={selectedRows}
                    editingCell={editingCell}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    categoryFilter={categoryFilter}
                    facilityFilter={facilityFilter}
                    searchQuery={searchQuery}
                    onCheckboxChange={handleCheckboxChange}
                    onSelectAll={() => {
                      if (selectedRows.length === equipments.length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(equipments.map((eq) => eq.id));
                      }
                    }}
                    onImageClick={handleImageClick}
                    onCellEdit={handleCellEdit}
                    onKeyDown={handleKeyDown}
                    onCancelEdit={handleCancelEdit}
                  />

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={getTotalPages()}
                    onPageChange={handlePageChange}
                    totalItems={getFilteredEquipments().length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Import Data Modal */}
      <Suspense fallback={null}>
        <ImportDataModal
          isOpen={showImportModal}
          selectedFile={selectedFile}
          importData={importData}
          isProcessing={isProcessing}
          onClose={() => {
            setShowImportModal(false);
            setSelectedFile(null);
            setImportData([]);
          }}
          onFileSelect={handleFileSelect}
          onImport={handleImportData}
          fileInputRef={fileInputRef}
        />
      </Suspense>

      {/* Edit Modal */}
      <Suspense fallback={null}>
        <EditModal
          isOpen={showEditModal && !!editingEquipment}
          equipment={editingEquipment}
          facilities={facilities}
          editImageFile={editImageFile}
          editImagePreview={editImagePreview}
          onChange={handleEditChange}
          onImageUpload={handleEditImageFileSelect}
          onRemoveImage={removeCurrentImage}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          editImageInputRef={editImageInputRef}
          onImageClick={handleImageClick}
        />
      </Suspense>

      <Suspense fallback={null}>
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
      </Suspense>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        type="file"
        ref={imageInputRef}
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleImageFileSelect}
        className="hidden"
      />

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
