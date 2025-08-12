"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Partial<Equipment>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Remove the old handleDeleteRow function and replace it with this one
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
      // Update local state by filtering out all selected rows
      setEquipments((prev) =>
        prev.filter((eq) => !selectedRows.includes(eq.id))
      );
      setSelectedRows([]); // Clear the selection
      console.log(`Successfully deleted ${selectedRows.length} rows.`);
    }

    // Close the modal
    setShowDeleteModal(false);
  };

  // You'll also need a function to handle the individual checkbox changes
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

    const { error } = await supabase.from("equipments").insert([
      {
        ...newEquipment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting equipment:", error);
      alert("Failed to insert equipment");
    } else {
      setShowInsertForm(false);
      setNewEquipment({ name: "" });
      fetchEquipments(false);
    }
  };

  const handleCancelInsert = () => {
    setShowInsertForm(false);
    setNewEquipment({ name: "" });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processExcelFile(file);
    }
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      // Here you would typically use a library like SheetJS to parse the Excel file
      // For now, we'll simulate the process
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate parsed data - replace this with actual Excel parsing logic
        const simulatedData: Partial<Equipment>[] = [
          {
            name: "Sample Equipment 1",
            description: "Sample description 1",
          },
          {
            name: "Sample Equipment 2",
            description: "Sample description 2",
          },
        ];
        setImportData(simulatedData);
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process Excel file");
      setIsProcessing(false);
    }
  };

  const handleImportData = async () => {
    if (importData.length === 0) {
      alert("No data to import");
      return;
    }

    setIsProcessing(true);
    try {
      const dataToInsert = importData.map((item) => ({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("equipments").insert(dataToInsert);

      if (error) {
        console.error("Error importing data:", error);
        alert("Failed to import data");
      } else {
        setShowImportModal(false);
        setSelectedFile(null);
        setImportData([]);
        fetchEquipments(false);
        alert(`Successfully imported ${importData.length} equipment records`);
      }
    } catch (error) {
      console.error("Error during import:", error);
      alert("Failed to import data");
    }
    setIsProcessing(false);
  };

  const handleEditClick = () => {
    if (selectedRows.length !== 1) return;
    const rowToEdit = equipments.find((eq) => eq.id === selectedRows[0]);
    if (rowToEdit) {
      setEditingEquipment(rowToEdit);
      setShowEditModal(true);
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

  // The new save function for the edit modal
  const handleSaveEdit = async () => {
    if (!editingEquipment || !editingEquipment.id) return;

    const { id, ...updates } = editingEquipment;
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
      // Update local state with the new data
      setEquipments((prev) =>
        prev.map((eq) => (eq.id === id ? editingEquipment : eq))
      );
      // Clear the edit state and close the modal
      setEditingEquipment(null);
      setShowEditModal(false);
      setSelectedRows([]);
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
    fetchEquipments(false);
  }, [fetchEquipments]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">-</span>;

    const statusColors = {
      working: "bg-green-100 text-green-800",
      for_repair: "bg-red-100 text-red-800",
      in_use: "bg-yellow-100 text-yellow-800",
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
    const colorClass = key ? statusColors[key] : "bg-blue-100 text-blue-800";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  const getAvailabilityBadge = (availability?: string) => {
    if (!availability) return <span className="text-gray-400">-</span>;

    const availabilityColors = {
      available: "bg-green-100 text-green-800",
      disposed: "bg-red-100 text-red-800",
      for_disposal: "bg-yellow-100 text-yellow-800",
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
      : "bg-blue-100 text-blue-800";

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
      // Special handling for status column
      if (column === "status") {
        return (
          <div className="relative">
            <select
              value={editingCell.value}
              onChange={(e) => handleCellEdit(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCancelEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm text-black border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="">Select status</option>
              <option value="working">Working</option>
              <option value="in_use">In Use</option>
              <option value="for_repair">For Repair</option>
            </select>
            <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
              Press Enter to save, Esc to cancel
            </div>
          </div>
        );
      }

      // Special handling for availability column
      if (column === "availability") {
        return (
          <div className="relative">
            <select
              value={editingCell.value}
              onChange={(e) => handleCellEdit(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCancelEdit}
              autoFocus
              className="w-full px-2 py-1 text-sm text-black border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="">Select availability</option>
              <option value="Available">Available</option>
              <option value="For Disposal">For Disposal</option>
              <option value="Disposed">Disposed</option>
            </select>
            <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
              Press Enter to save, Esc to cancel
            </div>
          </div>
        );
      }

      // Regular input for other columns
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
            className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
            placeholder="NULL"
          />
          <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
            Press Enter to save, Esc to cancel
          </div>
        </div>
      );
    }

    const displayValue =
      value === null || value === undefined ? "-" : String(value);

    return (
      <div className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
        {displayValue}
      </div>
    );
  };

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
                    Equipments
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Welcome to the Equipments page, where you can manage all the
                    equipments efficiently.
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* Insert Dropdown Button */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Insert
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

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowInsertForm(true);
                              setShowDropdown(false);
                            }}
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Insert Row
                          </button>
                          <button
                            onClick={() => {
                              setShowImportModal(true);
                              setShowDropdown(false);
                            }}
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
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                              />
                            </svg>
                            Import Data from Excel File
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* The Edit button */}
                  <button
                    onClick={handleEditClick}
                    disabled={selectedRows.length !== 1}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${
                      selectedRows.length !== 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Selected (
                    {selectedRows.length === 1 ? "1" : selectedRows.length})
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={selectedRows.length === 0}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${
                      selectedRows.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    }`}
                  >
                    Delete Selected ({selectedRows.length})
                  </button>

                  {/* The new Confirmation Modal */}
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
                              Delete Selected Equipments
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to delete **
                                {selectedRows.length}** equipment records? This
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
                    Loading equipments...
                  </span>
                </div>
              ) : equipments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">
                    No equipments found.
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
                            Add new row to equipments
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
                              value={newEquipment.name || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Equipment name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="PO Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Unit Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Brand Name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Category"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select status</option>
                              <option value="working">Working</option>
                              <option value="in_use">In Use</option>
                              <option value="for_repair">For Repair</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select availability</option>
                              <option value="Available">Available</option>
                              <option value="For Disposal">For Disposal</option>
                              <option value="Disposed">Disposed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Supplier"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Amount"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Estimated Life"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Item Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Control Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Serial Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Property Number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Person Liable"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Facility ID
                            </label>
                            <input
                              type="number"
                              value={newEquipment.facility_id || ""}
                              onChange={(e) =>
                                setNewEquipment({
                                  ...newEquipment,
                                  facility_id: e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : undefined,
                                })
                              }
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Facility ID"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                              rows={2}
                              placeholder="Description"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                              rows={2}
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
                            onClick={handleInsertEquipment}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
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
                                selectedRows.length === equipments.length &&
                                equipments.length > 0
                              }
                              onChange={() => {
                                if (selectedRows.length === equipments.length) {
                                  setSelectedRows([]); // Deselect all
                                } else {
                                  setSelectedRows(
                                    equipments.map((eq) => eq.id)
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
                            PO Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Unit Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Brand
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Category
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Status
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Availability
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Date Acquired
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Supplier
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Amount
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Estimated Life
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Item Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Control Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Serial Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Property Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Person Liable
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Facility ID
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Description
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {equipments.map((eq, index) => (
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
                              {renderEditableCell(eq, "name", eq.name)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {renderEditableCell(
                                eq,
                                "po_number",
                                eq.po_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {renderEditableCell(
                                eq,
                                "unit_number",
                                eq.unit_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(
                                eq,
                                "brand_name",
                                eq.brand_name
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(eq, "category", eq.category)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm border-r border-gray-100">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "status" ? (
                                renderEditableCell(eq, "status", eq.status)
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                  {getStatusBadge(eq.status)}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm border-r border-gray-100">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "availability" ? (
                                renderEditableCell(
                                  eq,
                                  "availability",
                                  eq.availability
                                )
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                  {getAvailabilityBadge(eq.availability)}
                                </div>
                              )}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "date_acquired" ? (
                                renderEditableCell(
                                  eq,
                                  "date_acquired",
                                  eq.date_acquired
                                )
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                  {formatDate(eq.date_acquired)}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(eq, "supplier", eq.supplier)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 font-mono">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "amount" ? (
                                renderEditableCell(eq, "amount", eq.amount)
                              ) : (
                                <div className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                  {eq.amount ? `₱${eq.amount}` : "-"}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(
                                eq,
                                "estimated_life",
                                eq.estimated_life
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(
                                eq,
                                "item_number",
                                eq.item_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(
                                eq,
                                "control_number",
                                eq.control_number
                              )}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {renderEditableCell(
                                eq,
                                "serial_number",
                                eq.serial_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {renderEditableCell(
                                eq,
                                "property_number",
                                eq.property_number
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(
                                eq,
                                "person_liable",
                                eq.person_liable
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {renderEditableCell(
                                eq,
                                "facility_id",
                                eq.facility_id
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600 max-w-xs border-r border-gray-100">
                              <div className="truncate cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
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
                            <td className="px-3 py-3 text-sm text-gray-600 max-w-xs">
                              <div className="truncate cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
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

                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing {equipments.length} equipment
                      {equipments.length !== 1 ? "s" : ""}
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

            <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Import data
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
                        Excel files (.xlsx, .xls) up to 10MB
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
                        <div className="max-h-48 overflow-y-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-700">
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left font-medium text-gray-700">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {importData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-gray-900">
                                    {item.name || "—"}
                                  </td>
                                  <td className="px-4 py-2 text-gray-600 truncate max-w-xs">
                                    {item.description || "—"}
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
                        Processing...
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
                    {isProcessing ? "Importing..." : "Import"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The new Edit Modal */}
      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 z-50 text-black flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
            onClick={handleCancelEdit}
          ></div>
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full z-50">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Equipment: {editingEquipment.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingEquipment.name || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PO Number
                  </label>
                  <input
                    type="text"
                    name="po_number"
                    value={editingEquipment.po_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    name="unit_number"
                    value={editingEquipment.unit_number || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brand_name"
                    value={editingEquipment.brand_name || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={editingEquipment.category || ""}
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
                    value={editingEquipment.status || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="working">Working</option>
                    <option value="in_use">In Use</option>
                    <option value="for_repair">For Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={editingEquipment.availability || ""}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select availability</option>
                    <option value="available">Available</option>
                    <option value="for_disposal">For Disposal</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Acquired
                  </label>
                  <input
                    type="date"
                    name="date_acquired"
                    value={editingEquipment.date_acquired?.split("T")[0] || ""} // Format for date input
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Hidden file input for drag and drop functionality */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
