"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Filter,
  ChevronDown,
  Tag,
  Building,
  X,
  Settings,
  Plus,
  Upload,
  Edit,
  Trash2,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [supplies, setSupplies] = useState<Supplies[]>([]);
  const [editingSupply, setEditingSupply] = useState<Supplies | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>(
    []
  );
  const [newSupply, setNewSupply] = useState<Partial<Supplies>>({
    name: "",
    category: "",
    quantity: 0,
    stocking_point: 0,
    stock_unit: "",
  });

  const [currentUser, setCurrentUser] = useState<{
    full_name?: string;
    last_name?: string;
  } | null>(null);

  // Add these image-related states after your existing state declarations
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Image states for editing supplies
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [facilityFilter, setFacilityFilter] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "category" | "facility" | null
  >(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Partial<Supplies>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
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

        // Fetch user profile information
        const { data: profile, error: profileError } = await supabase
          .from("account_requests") // or whatever your user profile table is called
          .select("first_name, last_name")
          .eq("user_id", session.user.id)
          .single();

        if (!profileError && profile) {
          setCurrentUser(profile);
        }
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

  const fetchFacilities = useCallback(async () => {
    const { data, error } = await supabase
      .from("facilities")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching facilities:", error);
    } else {
      setFacilities(data || []);
    }
  }, [supabase]);

  const fetchSupplies = useCallback(
    async (showAnimation = false) => {
      if (showAnimation) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("supplies")
        .select(
          `
          *,
          facilities:facility_id (
            id,
            name
          )
        `
        )
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching supplies:", error);
      } else {
        setSupplies(data as Supplies[]);
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
      fetchSupplies(true);
    }
  }, [isRefreshing, fetchSupplies]);

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

    const updatedSupply = { ...editingSupply };

    // Handle image upload if a new image file is selected
    if (editImageFile) {
      try {
        const fileExt = editImageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("supply-images")
          .upload(fileName, editImageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          alert(
            `Failed to upload image: ${uploadError.message}. Supply will be updated without new image.`
          );
        } else {
          const { data: urlData } = supabase.storage
            .from("supply-images")
            .getPublicUrl(fileName);
          updatedSupply.image = urlData.publicUrl;
        }
      } catch (error) {
        console.error("Error processing image:", error);
        alert(
          "Failed to process image. Supply will be updated without new image."
        );
      }
    }

    const { error } = await supabase
      .from("supplies")
      .update({
        name: updatedSupply.name,
        description: updatedSupply.description,
        category: updatedSupply.category,
        quantity: updatedSupply.quantity,
        stocking_point: updatedSupply.stocking_point,
        stock_unit: updatedSupply.stock_unit,
        facility_id: updatedSupply.facilities.id,
        image: updatedSupply.image,
        remarks: updatedSupply.remarks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updatedSupply.id);

    if (error) {
      console.error("Error updating supply:", error);
      alert("Failed to update supply");
    } else {
      await logSupplyAction(
        `Supply "${updatedSupply.name}" was updated`,
        `- Category: ${updatedSupply.category}, Quantity: ${
          updatedSupply.quantity
        } ${updatedSupply.stock_unit}, Facility: ${
          updatedSupply.facilities?.name || "None"
        }`
      );
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
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingSupply(null);
    clearEditImageSelection();
  };

  // Replace the existing handleInsertSupply function
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

    let imageUrl = null;

    // Upload image if selected
    if (selectedImageFile) {
      try {
        const fileExt = selectedImageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("supply-images") // Create this bucket in Supabase
          .upload(fileName, selectedImageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          alert(
            `Failed to upload image: ${uploadError.message}. Supply will be created without image.`
          );
        } else {
          const { data: urlData } = supabase.storage
            .from("supply-images")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process image. Supply will be created without image.");
      }
    }

    const { error } = await supabase.from("supplies").insert([
      {
        ...newSupply,
        image: imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting supply:", error);
      alert("Failed to insert supply");
    } else {
      await logSupplyAction(
        `Supply "${newSupply.name}" was created`,
        `with category "${newSupply.category}" and quantity ${newSupply.quantity} ${newSupply.stock_unit}`
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
      fetchSupplies(false);
    }
  };

  const getFilteredSupplies = () => {
    return supplies.filter((supply) => {
      const matchesCategory =
        !categoryFilter ||
        supply.category?.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesFacility =
        !facilityFilter ||
        supply.facilities?.name
          ?.toLowerCase()
          .includes(facilityFilter.toLowerCase());

      return matchesCategory && matchesFacility;
    });
  };

  const getUniqueCategories = () => {
    return [
      ...new Set(supplies.map((supply) => supply.category).filter(Boolean)),
    ].sort();
  };

  const getUniqueFacilities = () => {
    return [
      ...new Set(
        supplies.map((supply) => supply.facilities?.name).filter(Boolean)
      ),
    ].sort();
  };

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
        return;
      }

      const suppliesWithTimestamps = validData.map((supply) => ({
        ...supply,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("supplies")
        .insert(suppliesWithTimestamps);

      if (error) {
        console.error("Error importing supplies:", error);
        alert("Failed to import supplies. Please try again.");
      } else {
        const importedSupplyNames = validData
          .map((supply) => supply.name)
          .slice(0, 5)
          .join(", ");
        const remainingCount = Math.max(0, validData.length - 5);
        const namesList =
          remainingCount > 0
            ? `${importedSupplyNames} and ${remainingCount} more`
            : importedSupplyNames;
        await logSupplyAction(
          `${validData.length} supplies were imported from CSV:`,
          `${namesList}`
        );
        alert(`Successfully imported ${validData.length} supplies!`);
        setShowImportModal(false);
        setSelectedFile(null);
        setImportData([]);
        fetchSupplies(false);
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
      .from("supplies")
      .delete()
      .in("id", selectedRows);

    if (error) {
      console.error("Error deleting supplies:", error);
      alert("Failed to delete selected supplies");
    } else {
      const suppliesToDelete = supplies.filter((supply) =>
        selectedRows.includes(supply.id)
      );
      const supplyNames = suppliesToDelete
        .map((supply) => supply.name)
        .join(", ");

      await logSupplyAction(
        `${selectedRows.length} supply/supplies were deleted:`,
        `${supplyNames}`
      );
      setSupplies((prev) =>
        prev.filter((supply) => !selectedRows.includes(supply.id))
      );
      setSelectedRows([]);
      console.log(`Successfully deleted ${selectedRows.length} rows.`);
    }

    setShowDeleteModal(false);
  };

  // Helper function to get stock status color
  const getStockStatus = (quantity: number, stockingPoint: number) => {
    if (quantity === 0)
      return {
        status: "Out of Stock",
        color: "bg-red-100 text-red-800 border-red-200",
      };
    if (quantity <= stockingPoint)
      return {
        status: "Low Stock",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    return {
      status: "In Stock",
      color: "bg-green-100 text-green-800 border-green-200",
    };
  };

  const logSupplyAction = async (action: string, details: string) => {
    try {
      const adminName =
        currentUser?.full_name && currentUser?.last_name
          ? `${currentUser.full_name} ${currentUser.last_name}`
          : "Unknown Admin";

      const logMessage = `${action} by ${adminName} ${details}`;

      await supabase.from("supply_logs").insert([
        {
          log_message: logMessage,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error logging supply action:", error);
    }
  };

  useEffect(() => {
    fetchSupplies();
    fetchFacilities();
  }, [fetchSupplies, fetchFacilities]);

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
                    Supplies
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Welcome to the Supplies Dashboard. Here you can manage and
                    track all supply inventory.
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* Filter Dropdown */}
                  <div className="relative" ref={filterDropdownRef}>
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeFilter || categoryFilter || facilityFilter
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          <button
                            onClick={() => handleFilterSelect("category")}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Tag className="w-4 h-4 mr-3" />
                            Filter by Category
                          </button>
                          <button
                            onClick={() => handleFilterSelect("facility")}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
                      className="px-3 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="px-3 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Actions
                      <ChevronDown className="w-4 h-4 ml-2" />
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
                            <Plus className="w-4 h-4 mr-3 text-green-600" />
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
                            <Upload className="w-4 h-4 mr-3 text-green-600" />
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
                            <Edit className="w-4 h-4 mr-3 text-blue-600" />
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
                            <Trash2 className="w-4 h-4 mr-3 text-red-600" />
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
                      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full z-50">
                        <div className="p-6">
                          <div className="flex items-center justify-center">
                            <AlertTriangle className="h-10 w-10 text-red-600" />
                          </div>
                          <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              Delete Selected Supplies
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to delete **
                                {selectedRows.length}** supply records? This
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
                    <RefreshCw
                      className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RotateCcw
                    className={`inline-block mr-2 transition-transform duration-300 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  <span className="ml-3 text-gray-600">
                    Loading supplies...
                  </span>
                </div>
              ) : supplies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">
                    No supplies found.
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
                            Add new supply
                          </h4>
                          <button
                            onClick={handleCancelInsert}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Supply name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Description"
                            />
                          </div>

                          {/* Add this in the insert form grid, after the facility field */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Image
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => imageInputRef.current?.click()}
                                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                  Choose Image
                                </button>
                                {selectedImageFile && (
                                  <button
                                    type="button"
                                    onClick={clearImageSelection}
                                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              {selectedImageFile && (
                                <div className="text-xs text-gray-500">
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Category"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="e.g., pieces, kg, liters"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Additional notes"
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
                            onClick={handleInsertSupply}
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
                          <th
                            scope="col"
                            className="sticky left-0 z-10 w-12 px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
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

                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Name
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Description
                          </th>

                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Image
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Category
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Quantity
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Stocking Point
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Stock Unit
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Facility
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Stock Status
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentSupplies.map((supply, index) => {
                          const stockStatus = getStockStatus(
                            supply.quantity,
                            supply.stocking_point
                          );
                          return (
                            <tr
                              key={supply.id}
                              className={`hover:bg-gray-50 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              }`}
                            >
                              <td className="sticky left-0 z-10 w-12 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white border-r border-gray-200">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                                  checked={selectedRows.includes(supply.id)}
                                  onChange={() =>
                                    handleCheckboxChange(supply.id)
                                  }
                                />
                              </td>

                              <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                                {supply.name}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                <div className="max-w-xs truncate">
                                  {supply.description || "-"}
                                </div>
                              </td>
                              {/* Add this after the checkbox cell, before the name cell */}
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                {supply.image ? (
                                  <div className="flex items-center justify-center">
                                    <img
                                      src={supply.image}
                                      alt={`${supply.name} supply`}
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
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
                                            '<span class="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Failed to load</span>';
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg">
                                    <svg
                                      className="w-6 h-6 text-gray-400"
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
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                  {supply.category}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 text-center font-mono">
                                {supply.quantity}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 text-center font-mono">
                                {supply.stocking_point}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                {supply.stock_unit}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                {supply.facilities?.name || "-"}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}
                                >
                                  {stockStatus.status}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
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

                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
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
                  Import Supplies Data
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload file
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload
                        className="mx-auto h-8 w-8 text-gray-400 mb-3"
                        strokeWidth={1.5}
                      />
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
                                  Category
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Quantity
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Stock Unit
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Stocking Point
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                  Facility
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
                                    {item.category || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.quantity || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.stock_unit || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {item.stocking_point || "—"}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
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
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                      <span className="ml-3 text-sm text-gray-600">
                        Processing supplies data...
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportData}
                    disabled={importData.length === 0 || isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Supply
                  </h3>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingSupply.name || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Supply name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={editingSupply.category || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Category"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="0"
                        value={editingSupply.quantity || 0}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stocking Point
                      </label>
                      <input
                        type="number"
                        name="stocking_point"
                        min="0"
                        value={editingSupply.stocking_point || 0}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Unit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="stock_unit"
                        value={editingSupply.stock_unit || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., pieces, kg, liters"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facility
                      </label>
                      <select
                        name="facility_id"
                        value={editingSupply.facilities?.id || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={editingSupply.description || ""}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Supply description"
                    />
                  </div>

                  {/* Add this in the edit modal grid, after the facility field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    <div className="space-y-3">
                      {/* Current Image Display */}
                      {editingSupply?.image && !editImagePreview && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
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
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded"
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
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {editingSupply?.image ? "Change Image" : "Add Image"}
                        </button>

                        {editImageFile && (
                          <div className="text-xs text-gray-500 mt-1">
                            New image: {editImageFile.name}
                          </div>
                        )}

                        {editImagePreview && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      rows={2}
                      value={editingSupply.remarks || ""}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
