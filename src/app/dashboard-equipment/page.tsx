"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Upload,
  Loader2,
  Filter,
  ChevronDown,
  Settings,
  Plus,
  Download,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  Building,
  Tag,
  RefreshCw,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define the shape of one row from your equipments table
type Equipment = {
  id: number;
  po_number?: string;
  unit_number?: string;
  brand_name?: string;
  description?: string;
  category?: string;
  status?: string;
  date_acquired?: string;
  supplier?: string;
  amount?: string;
  estimated_life?: string;
  item_number?: string;
  property_number?: string;
  control_number?: string;
  serial_number?: string;
  person_liable?: string;
  remarks?: string;
  updated_at?: string;
  name: string;
  facility_id?: number;
  availability?: string;
  created_at: string;
  image?: string;
};

type Facility = {
  id: number;
  name: string;
};

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
  const editImageInputRef = useRef<HTMLInputElement>(null);
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

  const getCurrentPageData = () => {
    const filtered = getFilteredEquipments();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredEquipments().length / itemsPerPage);
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

  const getFacilityName = (facilityId?: number) => {
    if (!facilityId) return "-";
    const facility = facilities.find((f) => f.id === facilityId);
    return facility ? facility.name : `ID: ${facilityId}`;
  };

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing) {
      fetchEquipments(true);
    }
  }, [isRefreshing, fetchEquipments]);

  const handleInsertEquipment = async () => {
    if (!newEquipment.name?.trim()) {
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

  const clearImageSelection = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
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
    return equipments.filter((eq) => {
      const matchesCategory =
        !categoryFilter ||
        eq.category?.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchesFacility =
        !facilityFilter || eq.facility_id === parseInt(facilityFilter);
      return matchesCategory && matchesFacility;
    });
  };

  const getUniqueCategories = () => {
    return [
      ...new Set(equipments.map((eq) => eq.category).filter(Boolean)),
    ].sort();
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

      const equipmentData: Partial<Equipment>[] = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const equipment: Partial<Equipment> = {};

        headers.forEach((header, index) => {
          const value = values[index] || "";

          switch (header.toLowerCase()) {
            case "name":
            case "equipment name":
              equipment.name = value;
              break;
            case "po number":
            case "po_number":
            case "ponumber":
              equipment.po_number = value;
              break;
            case "unit number":
            case "unit_number":
            case "unitnumber":
              equipment.unit_number = value;
              break;
            case "brand name":
            case "brand_name":
            case "brand":
              equipment.brand_name = value;
              break;
            case "description":
              equipment.description = value;
              break;
            case "category":
              equipment.category = value;
              break;
            case "status":
              equipment.status = value;
              break;
            case "availability":
              equipment.availability = value;
              break;
            case "date acquired":
            case "date_acquired":
            case "dateacquired":
              equipment.date_acquired = value;
              break;
            case "supplier":
              equipment.supplier = value;
              break;
            case "amount":
            case "price":
              equipment.amount = value;
              break;
            case "estimated life":
            case "estimated_life":
            case "estimatedlife":
              equipment.estimated_life = value;
              break;
            case "item number":
            case "item_number":
            case "itemnumber":
              equipment.item_number = value;
              break;
            case "property number":
            case "property_number":
            case "propertynumber":
              equipment.property_number = value;
              break;
            case "control number":
            case "control_number":
            case "controlnumber":
              equipment.control_number = value;
              break;
            case "serial number":
            case "serial_number":
            case "serialnumber":
              equipment.serial_number = value;
              break;
            case "person liable":
            case "person_liable":
            case "personliable":
              equipment.person_liable = value;
              break;
            case "facility id":
            case "facility_id":
            case "facilityid":
              equipment.facility_id = value ? parseInt(value, 10) : undefined;
              break;
            case "remarks":
            case "notes":
              equipment.remarks = value;
              break;
          }
        });

        return equipment;
      });

      setImportData(equipmentData);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status?: string) => {
    if (!status)
      return <span className="text-gray-400 dark:text-gray-500">-</span>;

    const statusColors = {
      Working:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      "For Repair":
        "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      "In Use":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    };

    type StatusKey = keyof typeof statusColors;

    function normalizeStatus(input: string): StatusKey | undefined {
      const normalized = input.toLowerCase().replace(/ /g, "_");
      if (normalized in statusColors) {
        return normalized as StatusKey;
      }
      return undefined;
    }

    const key = normalizeStatus(status);
    const colorClass = key
      ? statusColors[key]
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  const getAvailabilityBadge = (availability?: string) => {
    if (!availability)
      return <span className="text-gray-400 dark:text-gray-500">-</span>;

    const availabilityColors = {
      available:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      disposed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      for_disposal:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    };

    type AvailabilityKey = keyof typeof availabilityColors;

    function normalizeAvailability(input: string): AvailabilityKey | undefined {
      const normalized = input.toLowerCase().replace(/ /g, "_");
      if (normalized in availabilityColors) {
        return normalized as AvailabilityKey;
      }
      return undefined;
    }

    const key = normalizeAvailability(availability);
    const colorClass = key
      ? availabilityColors[key]
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {availability}
      </span>
    );
  };

  const renderEditableCell = (
    eq: Equipment,
    column: keyof Equipment,
    value: string | number | null | undefined
  ) => {
    const isEditing =
      editingCell?.rowId === eq.id && editingCell?.column === column;

    if (isEditing) {
      if (column === "status") {
        return (
          <div className="relative">
            <select
              value={editingCell.value}
              onChange={(e) => handleCellEdit(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCancelEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
            >
              <option value="">Select status</option>
              <option value="Working">Working</option>
              <option value="In Use">In Use</option>
              <option value="For Repair">For Repair</option>
            </select>
            <div className="absolute -top-8 left-0 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
              Press Enter to save, Esc to cancel
            </div>
          </div>
        );
      }

      if (column === "availability") {
        return (
          <div className="relative">
            <select
              value={editingCell.value}
              onChange={(e) => handleCellEdit(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCancelEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
            >
              <option value="">Select availability</option>
              <option value="Available">Available</option>
              <option value="For Disposal">For Disposal</option>
              <option value="Disposed">Disposed</option>
            </select>
            <div className="absolute -top-8 left-0 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
              Press Enter to save, Esc to cancel
            </div>
          </div>
        );
      }

      return (
        <div className="relative">
          <input
            type={
              column === "facility_id"
                ? "number"
                : column === "date_acquired"
                ? "date"
                : "text"
            }
            value={editingCell.value}
            onChange={(e) => handleCellEdit(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCancelEdit}
            autoFocus
            className="w-full px-2 py-1 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
            placeholder="NULL"
          />
          <div className="absolute -top-8 left-0 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
            Press Enter to save, Esc to cancel
          </div>
        </div>
      );
    }

    const displayValue =
      value === null || value === undefined ? "-" : String(value);

    return (
      <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
        {displayValue}
      </div>
    );
  };

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
                      {getUniqueCategories().map((category) => (
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
                              Delete Selected Equipments
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete{" "}
                                {selectedRows.length} equipment records? This
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
                  {showInsertForm && (
                    <div className="border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Add new row to equipments
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
                              value={newEquipment.name || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Equipment name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              PO Number
                            </label>
                            <input
                              type="text"
                              value={newEquipment.po_number || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  po_number: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="PO Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Unit Number
                            </label>
                            <input
                              type="text"
                              value={newEquipment.unit_number || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  unit_number: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Unit Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Brand Name
                            </label>
                            <input
                              type="text"
                              value={newEquipment.brand_name || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  brand_name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Brand Name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              value={newEquipment.category || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  category: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Category"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Status
                            </label>
                            <select
                              value={newEquipment.status || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  status: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select status</option>
                              <option value="Working">Working</option>
                              <option value="In Use">In Use</option>
                              <option value="For Repair">For Repair</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Availability
                            </label>
                            <select
                              value={newEquipment.availability || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  availability: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select availability</option>
                              <option value="Available">Available</option>
                              <option value="For Disposal">For Disposal</option>
                              <option value="Disposed">Disposed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Date Acquired
                            </label>
                            <input
                              type="date"
                              value={newEquipment.date_acquired || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  date_acquired: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Supplier
                            </label>
                            <input
                              type="text"
                              value={newEquipment.supplier || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  supplier: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Supplier"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Amount
                            </label>
                            <input
                              type="text"
                              value={newEquipment.amount || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  amount: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Amount"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Estimated Life
                            </label>
                            <input
                              type="text"
                              value={newEquipment.estimated_life || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  estimated_life: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Estimated Life"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Item Number
                            </label>
                            <input
                              type="text"
                              value={newEquipment.item_number || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  item_number: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Item Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Control Number
                            </label>
                            <input
                              type="text"
                              value={newEquipment.control_number || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  control_number: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Control Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Serial Number
                            </label>
                            <input
                              type="text"
                              value={newEquipment.serial_number || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  serial_number: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Serial Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Property Number
                            </label>
                            <input
                              type="text"
                              value={newEquipment.property_number || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  property_number: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Property Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Person Liable
                            </label>
                            <input
                              type="text"
                              value={newEquipment.person_liable || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  person_liable: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Person Liable"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Facility
                            </label>
                            <select
                              value={newEquipment.facility_id || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  facility_id: e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : undefined,
                                })
                              }
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

                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              value={newEquipment.description || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                              rows={2}
                              placeholder="Description"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Remarks
                            </label>
                            <textarea
                              value={newEquipment.remarks || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  remarks: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                              rows={2}
                              placeholder="Remarks"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelInsert}
                            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleInsertEquipment}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="sticky left-0 z-10 w-12 px-6 py-3 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-green-600 dark:text-green-400 transition duration-150 ease-in-out"
                              checked={
                                selectedRows.length === equipments.length &&
                                equipments.length > 0
                              }
                              onChange={() => {
                                if (selectedRows.length === equipments.length) {
                                  setSelectedRows([]);
                                } else {
                                  setSelectedRows(
                                    equipments.map((eq) => eq.id)
                                  );
                                }
                              }}
                            />
                          </th>

                          <th className="sticky left-12 z-10 px-3 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Name
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Image
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            PO Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Unit Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Brand
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Category
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Status
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Availability
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Date Acquired
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Supplier
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Amount
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Estimated Life
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Item Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Control Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Serial Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Property Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Person Liable
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Facility
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Description
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {getCurrentPageData().map((eq, index) => (
                          <tr
                            key={eq.id}
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
                                checked={selectedRows.includes(eq.id)}
                                onChange={() => handleCheckboxChange(eq.id)}
                              />
                            </td>

                            <td className="sticky left-12 z-10 px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(eq, "name", eq.name)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "image" ? (
                                renderEditableCell(eq, "image", eq.image)
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                  {eq.image ? (
                                    <div className="flex items-center justify-center">
                                      <img
                                        src={eq.image}
                                        alt={`${eq.name} equipment`}
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
                                        onClick={() =>
                                          handleImageClick(eq.image!, eq.name)
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
                                        onLoad={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.opacity = "1";
                                        }}
                                        style={{
                                          opacity: "0",
                                          transition:
                                            "opacity 0.3s ease-in-out, transform 0.2s ease-in-out",
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
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-mono">
                              {renderEditableCell(
                                eq,
                                "po_number",
                                eq.po_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-mono">
                              {renderEditableCell(
                                eq,
                                "unit_number",
                                eq.unit_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(
                                eq,
                                "brand_name",
                                eq.brand_name
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(eq, "category", eq.category)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm border-r border-gray-100 dark:border-gray-700">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "status" ? (
                                renderEditableCell(eq, "status", eq.status)
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                  {getStatusBadge(eq.status)}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm border-r border-gray-100 dark:border-gray-700">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "availability" ? (
                                renderEditableCell(
                                  eq,
                                  "availability",
                                  eq.availability
                                )
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                  {getAvailabilityBadge(eq.availability)}
                                </div>
                              )}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "date_acquired" ? (
                                renderEditableCell(
                                  eq,
                                  "date_acquired",
                                  eq.date_acquired
                                )
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                  {formatDate(eq.date_acquired)}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(eq, "supplier", eq.supplier)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700 font-mono">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "amount" ? (
                                renderEditableCell(eq, "amount", eq.amount)
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                  {eq.amount ? `₱${eq.amount}` : "-"}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(
                                eq,
                                "estimated_life",
                                eq.estimated_life
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(
                                eq,
                                "item_number",
                                eq.item_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(
                                eq,
                                "control_number",
                                eq.control_number
                              )}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-mono">
                              {renderEditableCell(
                                eq,
                                "serial_number",
                                eq.serial_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-mono">
                              {renderEditableCell(
                                eq,
                                "property_number",
                                eq.property_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {renderEditableCell(
                                eq,
                                "person_liable",
                                eq.person_liable
                              )}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                              {getFacilityName(eq.facility_id)}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs border-r border-gray-100 dark:border-gray-700">
                              <div className="truncate cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                {editingCell?.rowId === eq.id &&
                                editingCell?.column === "description"
                                  ? renderEditableCell(
                                      eq,
                                      "description",
                                      eq.description
                                    )
                                  : eq.description || "-"}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                              <div className="truncate cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                {editingCell?.rowId === eq.id &&
                                editingCell?.column === "remarks"
                                  ? renderEditableCell(
                                      eq,
                                      "remarks",
                                      eq.remarks
                                    )
                                  : eq.remarks || "-"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
              onClick={() => setShowImportModal(false)}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Import Equipment Data
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
                      <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
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
                        <div className="max-h-48 overflow-y-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Brand
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Category
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Status
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Amount
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
                                    {item.brand_name || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {item.category || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    {item.status ? (
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          item.status === "Working"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                            : item.status === "For Repair"
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                            : item.status === "In Use"
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                        }`}
                                      >
                                        {item.status}
                                      </span>
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400 font-mono">
                                    {item.amount ? `₱${item.amount}` : "—"}
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
                        Processing equipment data...
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportData}
                    disabled={importData.length === 0 || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing
                      ? "Importing..."
                      : `Import ${importData.length} Equipment${
                          importData.length !== 1 ? "s" : ""
                        }`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 z-50 text-black dark:text-white flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
            onClick={handleCancelEdit}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] z-50 flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-200 dark:border-gray-700">
                Edit Equipment: {editingEquipment.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingEquipment.name || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PO Number
                  </label>
                  <input
                    type="text"
                    name="po_number"
                    value={editingEquipment.po_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    name="unit_number"
                    value={editingEquipment.unit_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brand_name"
                    value={editingEquipment.brand_name || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={editingEquipment.category || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editingEquipment.status || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Working">Working</option>
                    <option value="In Use">In Use</option>
                    <option value="For Repair">For Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={editingEquipment.availability || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select availability</option>
                    <option value="available">Available</option>
                    <option value="for_disposal">For Disposal</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Acquired
                  </label>
                  <input
                    type="date"
                    name="date_acquired"
                    value={editingEquipment.date_acquired?.split("T")[0] || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={editingEquipment.supplier || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={editingEquipment.amount || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Life
                  </label>
                  <input
                    type="text"
                    name="estimated_life"
                    value={editingEquipment.estimated_life || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Number
                  </label>
                  <input
                    type="text"
                    name="item_number"
                    value={editingEquipment.item_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Control Number
                  </label>
                  <input
                    type="text"
                    name="control_number"
                    value={editingEquipment.control_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={editingEquipment.serial_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Property Number
                  </label>
                  <input
                    type="text"
                    name="property_number"
                    value={editingEquipment.property_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Person Liable
                  </label>
                  <input
                    type="text"
                    name="person_liable"
                    value={editingEquipment.person_liable || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Facility
                  </label>
                  <select
                    name="facility_id"
                    value={editingEquipment.facility_id || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image
                  </label>
                  <div className="space-y-3">
                    {editingEquipment?.image && !editImagePreview && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Current Image:
                        </div>
                        <div className="flex items-center space-x-2">
                          <img
                            src={editingEquipment.image}
                            alt="Current equipment"
                            className="w-16 h-16 rounded border object-cover cursor-pointer hover:scale-105 hover:shadow-md transition-all"
                            onClick={() =>
                              handleImageClick(
                                editingEquipment.image!,
                                editingEquipment.name
                              )
                            }
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
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

                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => editImageInputRef.current?.click()}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {editingEquipment?.image
                            ? "Change Image"
                            : "Add Image"}
                        </button>
                        {editImageFile && (
                          <button
                            type="button"
                            onClick={clearEditImageSelection}
                            className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

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
                            className="w-16 h-16 rounded border object-cover cursor-pointer hover:scale-105 hover:shadow-md transition-all"
                            onClick={() =>
                              handleImageClick(
                                editImagePreview,
                                `${editingEquipment.name} (Preview)`
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={editingEquipment.description || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    name="remarks"
                    value={editingEquipment.remarks || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-center gap-3 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 dark:bg-blue-700 text-base font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

            <div className="fixed top-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg px-3 py-2">
              <p className="text-white text-sm font-medium">
                {selectedImageName}
              </p>
            </div>

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
                alt={`${selectedImageName} equipment preview`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="text-white text-center"><p class="text-lg mb-2">Failed to load image</p><p class="text-sm opacity-75">The image could not be displayed</p></div>';
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

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
