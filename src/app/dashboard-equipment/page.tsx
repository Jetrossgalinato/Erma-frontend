"use client";
import { useState, useEffect, useCallback } from "react";
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
  property_num?: string;
  control_numb?: string;
  serial_number?: string;
  person_liable?: string;
  remarks?: string;
  updated_at?: string;
  name: string;
  facility_id?: number;
  availability?: string;
  quantity: number;
  created_at: string;
};

type EditingCell = {
  rowId: number;
  column: keyof Equipment;
  value: string;
  originalValue: string;
};

export default function DashboardEquipmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
    quantity: 1,
  });

  const supabase = createClientComponentClient();

  const handleOverlayClick = () => {
    setSidebarOpen(false);
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
        .order("id", { ascending: false });

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
      setShowInsertModal(false);
      setNewEquipment({ name: "", quantity: 1 });
      fetchEquipments(false);
    }
  };

  const handleCellDoubleClick = (
    rowId: number,
    column: keyof Equipment,
    currentValue: string | number | null | undefined
  ) => {
    const stringValue =
      currentValue === null || currentValue === undefined
        ? ""
        : String(currentValue);
    setEditingCell({
      rowId,
      column,
      value: stringValue,
      originalValue: stringValue,
    });
  };

  const handleCellEdit = (value: string) => {
    if (editingCell) {
      setEditingCell({ ...editingCell, value });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const { rowId, column, value } = editingCell;

    // Convert value appropriately
    let finalValue: string | number | null = value === "" ? null : value;
    if (column === "quantity" || column === "facility_id") {
      finalValue = value === "" ? null : parseInt(value, 10);
    }

    const { error } = await supabase
      .from("equipments")
      .update({
        [column]: finalValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rowId);

    if (error) {
      console.error("Error updating equipment:", error);
      alert("Failed to update equipment");
    } else {
      // Update local state
      setEquipments((prev) =>
        prev.map((eq) =>
          eq.id === rowId ? { ...eq, [column]: finalValue } : eq
        )
      );
    }

    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
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
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      retired: "bg-gray-100 text-gray-800",
    };

    const colorClass =
      statusColors[status.toLowerCase() as keyof typeof statusColors] ||
      "bg-blue-100 text-blue-800";

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
      unavailable: "bg-red-100 text-red-800",
      "in use": "bg-yellow-100 text-yellow-800",
    };

    const colorClass =
      availabilityColors[
        availability.toLowerCase() as keyof typeof availabilityColors
      ] || "bg-blue-100 text-blue-800";

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
      return (
        <div className="relative">
          <input
            type={
              column === "quantity" || column === "facility_id"
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
      <div
        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
        onDoubleClick={() => handleCellDoubleClick(eq.id, column, value)}
        title="Double-click to edit"
      >
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
                    Welcome to the Equipments page, where you can manage all
                    your equipment efficiently.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInsertModal(true)}
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
                  </button>
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
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
                            Quantity
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
                            Serial Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Property Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Person Liable
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
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
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 font-mono">
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
                              editingCell?.column === "status"
                                ? renderEditableCell(eq, "status", eq.status)
                                : getStatusBadge(eq.status)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm border-r border-gray-100">
                              {editingCell?.rowId === eq.id &&
                              editingCell?.column === "availability"
                                ? renderEditableCell(
                                    eq,
                                    "availability",
                                    eq.availability
                                  )
                                : getAvailabilityBadge(eq.availability)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 font-semibold">
                              {renderEditableCell(eq, "quantity", eq.quantity)}
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
                                <div
                                  className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                  onDoubleClick={() =>
                                    handleCellDoubleClick(
                                      eq.id,
                                      "date_acquired",
                                      eq.date_acquired
                                    )
                                  }
                                  title="Double-click to edit"
                                >
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
                                <div
                                  className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                  onDoubleClick={() =>
                                    handleCellDoubleClick(
                                      eq.id,
                                      "amount",
                                      eq.amount
                                    )
                                  }
                                  title="Double-click to edit"
                                >
                                  {eq.amount ? `₱${eq.amount}` : "-"}
                                </div>
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
                                "property_num",
                                eq.property_num
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {renderEditableCell(
                                eq,
                                "person_liable",
                                eq.person_liable
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600 max-w-xs">
                              <div
                                className="truncate cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title={eq.description || "Double-click to edit"}
                                onDoubleClick={() =>
                                  handleCellDoubleClick(
                                    eq.id,
                                    "description",
                                    eq.description
                                  )
                                }
                              >
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

      {/* Insert Modal */}
      {showInsertModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowInsertModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Insert New Equipment
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter equipment name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={newEquipment.quantity || 1}
                          onChange={(e) =>
                            setNewEquipment({
                              ...newEquipment,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Enter equipment description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleInsertEquipment}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => setShowInsertModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
