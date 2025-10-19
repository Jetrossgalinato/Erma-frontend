"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import EquipmentsTable from "./components/equipmentsTable";
import ImageModal from "./components/imageModal";
import EditModal from "./components/editModal";
import ImportDataModal from "./components/importDataModal";
import DeleteConfirmationModal from "./components/deleteConfirmationModal";
import InsertEquipmentForm from "./components/insertEquipmentForm";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Loader2,
  Filter,
  ChevronDown,
  Settings,
  Plus,
  Download,
  Edit,
  Trash2,
  X,
  Building,
  Tag,
  RefreshCw,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  type Equipment,
  type Facility,
  validateImageFile,
  readFileAsDataURL,
  filterEquipments,
  getUniqueCategories,
  calculateTotalPages,
  parseCSVToEquipment,
  validateEquipmentName,
  validateCSVFile,
} from "./utils/helpers";

// Define the shape of one row from your equipments table
type EditingCell = {
  rowId: number;
  column: keyof Equipment;
  value: string;
  originalValue: string;
};

export default function DashboardEquipmentPage() {
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);

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
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || "",
          full_name:
            session.user.user_metadata?.full_name || session.user.email,
        });
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

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

  const logEquipmentAction = async (
    action: string,
    equipmentName?: string,
    details?: string
  ) => {
    if (!currentUser) return;

    const logMessage = equipmentName
      ? `${
          currentUser.full_name || currentUser.email
        } ${action} equipment: ${equipmentName}${
          details ? ` - ${details}` : ""
        }`
      : `${currentUser.full_name || currentUser.email} ${action}${
          details ? ` - ${details}` : ""
        }`;

    try {
      await supabase.from("equipment_logs").insert([
        {
          log_message: logMessage,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error logging equipment action:", error);
    }
  };

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
  }, [categoryFilter, facilityFilter]);

  const handleDeleteSelectedRows = async () => {
    if (selectedRows.length === 0) return;

    const { error } = await supabase
      .from("equipments")
      .delete()
      .in("id", selectedRows);

    if (error) {
      console.error("Error deleting equipments:", error);
      alert("Failed to delete selected equipments");
    } else {
      const deletedNames = equipments
        .filter((eq) => selectedRows.includes(eq.id))
        .map((eq) => eq.name)
        .join(", ");

      await logEquipmentAction(
        `deleted ${selectedRows.length} equipment(s)`,
        undefined,
        `Items: ${deletedNames}`
      );

      setEquipments((prev) =>
        prev.filter((eq) => !selectedRows.includes(eq.id))
      );
      setSelectedRows([]);
      console.log(`Successfully deleted ${selectedRows.length} rows.`);
    }

    setShowDeleteModal(false);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const fetchEquipments = useCallback(
    async (showAnimation = false) => {
      if (showAnimation) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("equipments")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching equipments:", error);
      } else {
        setEquipments(data as Equipment[]);
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

  const fetchFacilities = useCallback(async () => {
    const { data, error } = await supabase
      .from("facilities")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching facilities:", error);
    } else {
      setFacilities(data as Facility[]);
    }
  }, [supabase]);

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      fetchEquipments(true);
    }
  }, [isRefreshing, fetchEquipments]);

  const handleInsertEquipment = async () => {
    if (!validateEquipmentName(newEquipment.name)) {
      alert("Equipment name is required");
      return;
    }

    let imageUrl = null;

    if (selectedImageFile) {
      try {
        const fileExt = selectedImageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("equipment-images")
          .upload(fileName, selectedImageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          alert(
            `Failed to upload image: ${uploadError.message}. Equipment will be created without image.`
          );
        } else {
          const { data: urlData } = supabase.storage
            .from("equipment-images")
            .getPublicUrl(fileName);

          imageUrl = urlData.publicUrl;
        }
      } catch (error) {
        console.error("Error processing image:", error);
        alert(
          "Failed to process image. Equipment will be created without image."
        );
      }
    }

    const { error } = await supabase.from("equipments").insert([
      {
        ...newEquipment,
        image: imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting equipment:", error);
      alert("Failed to insert equipment");
    } else {
      await logEquipmentAction("added", newEquipment.name);
      setShowInsertForm(false);
      setNewEquipment({ name: "" });
      clearImageSelection();
      fetchEquipments(false);
    }
  };

  const handleImageFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }

    setSelectedImageFile(file);

    try {
      const dataURL = await readFileAsDataURL(file);
      setImagePreview(dataURL);
    } catch (error) {
      console.error("Error reading image file:", error);
      alert("Failed to read image file");
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
      alert(error);
      return;
    }

    setEditImageFile(file);

    try {
      const dataURL = await readFileAsDataURL(file);
      setEditImagePreview(dataURL);
    } catch (error) {
      console.error("Error reading image file:", error);
      alert("Failed to read image file");
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
    return filterEquipments(equipments, categoryFilter, facilityFilter);
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
      alert(error);
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const equipmentData = await parseCSVToEquipment(file);
      setImportData(equipmentData);
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
      const validData = importData.filter(
        (item) => item.name && item.name.trim()
      );

      if (validData.length === 0) {
        alert("No valid equipment found. Make sure each row has a name.");
        return;
      }

      const equipmentWithTimestamps = validData.map((equipment) => ({
        ...equipment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("equipments")
        .insert(equipmentWithTimestamps);

      if (error) {
        console.error("Error importing equipment:", error);
        alert("Failed to import equipment. Please try again.");
      } else {
        await logEquipmentAction(
          `imported ${validData.length} equipment(s) from CSV`,
          undefined,
          `File: ${selectedFile?.name}`
        );

        alert(`Successfully imported ${validData.length} equipment records!`);
        setShowImportModal(false);
        setSelectedFile(null);
        setImportData([]);
        fetchEquipments(false);
      }
    } catch (error) {
      console.error("Error importing data:", error);
      alert("An error occurred while importing data.");
    } finally {
      setIsProcessing(false);
    }
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
        const fileExt = editImageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("equipment-images")
          .upload(fileName, editImageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          alert(
            `Failed to upload image: ${uploadError.message}. Equipment will be updated without new image.`
          );
        } else {
          const { data: urlData } = supabase.storage
            .from("equipment-images")
            .getPublicUrl(fileName);

          updatedEquipment.image = urlData.publicUrl;
        }
      } catch (error) {
        console.error("Error processing image:", error);
        alert(
          "Failed to process image. Equipment will be updated without new image."
        );
      }
    }

    const { id, ...updates } = updatedEquipment;
    const { error } = await supabase
      .from("equipments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating equipment:", error);
      alert("Failed to update equipment");
    } else {
      await logEquipmentAction("updated", updatedEquipment.name);
      setEquipments((prev) =>
        prev.map((eq) => (eq.id === id ? updatedEquipment : eq))
      );
      setEditingEquipment(null);
      setShowEditModal(false);
      setSelectedRows([]);
      clearEditImageSelection();
      alert("Equipment updated successfully!");
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

  useEffect(() => {
    fetchFacilities();
    fetchEquipments(false);
  }, [fetchEquipments, fetchFacilities]);

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
                    Equipments
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Welcome to the Equipments page, where you can manage all the
                    equipments efficiently.
                  </p>
                </div>
                <div className="flex gap-3">
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

                  {activeFilter === "category" && (
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories(equipments).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  )}

                  {activeFilter === "facility" && (
                    <select
                      value={facilityFilter}
                      onChange={(e) => setFacilityFilter(e.target.value)}
                      className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Facilities</option>
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {(categoryFilter || facilityFilter || activeFilter) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1 inline" />
                      Clear
                    </button>
                  )}

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

                    {showActionsDropdown && (
                      <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
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

                          <button
                            onClick={() => {
                              setShowImportModal(true);
                              setShowActionsDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <Download className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                            Import Data from CSV File
                          </button>

                          <hr className="my-1 border-gray-100 dark:border-gray-600" />

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
                            <Edit
                              className={`w-4 h-4 mr-3 ${
                                selectedRows.length !== 1
                                  ? "text-gray-400 dark:text-gray-500"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            />
                            Edit Selected (
                            {selectedRows.length === 1
                              ? "1"
                              : selectedRows.length}
                            )
                          </button>

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
                            <Trash2
                              className={`w-4 h-4 mr-3 ${
                                selectedRows.length === 0
                                  ? "text-gray-400 dark:text-gray-500"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            />
                            Delete Selected ({selectedRows.length})
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    selectedCount={selectedRows.length}
                    onConfirm={handleDeleteSelectedRows}
                    onCancel={() => setShowDeleteModal(false)}
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

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading equipments...
                  </span>
                </div>
              ) : equipments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 text-lg">
                    No equipments found.
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
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

                  <EquipmentsTable
                    equipments={equipments}
                    facilities={facilities}
                    selectedRows={selectedRows}
                    editingCell={editingCell}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
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
                    categoryFilter={categoryFilter}
                    facilityFilter={facilityFilter}
                  />

                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        getFilteredEquipments().length
                      )}{" "}
                      to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        getFilteredEquipments().length
                      )}{" "}
                      of {getFilteredEquipments().length} equipment
                      {getFilteredEquipments().length !== 1 ? "s" : ""}
                    </div>

                    {getTotalPages() > 1 && (
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Page {currentPage} of {getTotalPages()}
                        </span>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === getTotalPages()}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Import Data Modal */}
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

      {/* Edit Modal */}
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
