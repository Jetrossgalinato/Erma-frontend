"use client";
import React from "react";
import {
  type Equipment,
  type Facility,
  filterEquipments,
} from "../utils/helpers";

type EditingCell = {
  rowId: number;
  column: keyof Equipment;
  value: string;
  originalValue: string;
};

interface EquipmentsTableProps {
  equipments: Equipment[];
  facilities: Facility[];
  selectedRows: number[];
  editingCell: EditingCell | null;
  currentPage: number;
  itemsPerPage: number;
  onCheckboxChange: (id: number) => void;
  onSelectAll: () => void;
  onImageClick: (imageUrl: string, equipmentName: string) => void;
  onCellEdit: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCancelEdit: () => void;
  categoryFilter: string;
  facilityFilter: string;
}

export default function EquipmentsTable({
  equipments,
  facilities,
  selectedRows,
  editingCell,
  currentPage,
  itemsPerPage,
  onCheckboxChange,
  onSelectAll,
  onImageClick,
  onCellEdit,
  onKeyDown,
  onCancelEdit,
  categoryFilter,
  facilityFilter,
}: EquipmentsTableProps) {
  const getFacilityName = (facilityId?: number) => {
    if (!facilityId) return "-";
    if (!Array.isArray(facilities) || facilities.length === 0) {
      return `ID: ${facilityId}`;
    }
    const facility = facilities.find((f) => f.id === facilityId);
    return facility ? facility.name : `ID: ${facilityId}`;
  };

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
              onChange={(e) => onCellEdit(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={onCancelEdit}
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
              onChange={(e) => onCellEdit(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={onCancelEdit}
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
                : column === "date_acquire"
                ? "date"
                : "text"
            }
            value={editingCell.value}
            onChange={(e) => onCellEdit(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onCancelEdit}
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

  const getFilteredEquipments = () => {
    return filterEquipments(equipments, categoryFilter, facilityFilter);
  };

  const getCurrentPageData = () => {
    const filtered = getFilteredEquipments();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  return (
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
                onChange={onSelectAll}
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
                  onChange={() => onCheckboxChange(eq.id)}
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
                          onClick={() => onImageClick(eq.image!, eq.name)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<span class="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Failed to load</span>';
                            }
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
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
                {renderEditableCell(eq, "po_number", eq.po_number)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-mono">
                {renderEditableCell(eq, "unit_number", eq.unit_number)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {renderEditableCell(eq, "brand_name", eq.brand_name)}
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
                  renderEditableCell(eq, "availability", eq.availability)
                ) : (
                  <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                    {getAvailabilityBadge(eq.availability)}
                  </div>
                )}
              </td>

              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {editingCell?.rowId === eq.id &&
                editingCell?.column === "date_acquire" ? (
                  renderEditableCell(eq, "date_acquire", eq.date_acquire)
                ) : (
                  <div className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                    {formatDate(eq.date_acquire)}
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
                {renderEditableCell(eq, "estimated_life", eq.estimated_life)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {renderEditableCell(eq, "item_number", eq.item_number)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {renderEditableCell(eq, "control_number", eq.control_number)}
              </td>

              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-mono">
                {renderEditableCell(eq, "serial_number", eq.serial_number)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-mono">
                {renderEditableCell(eq, "property_number", eq.property_number)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {renderEditableCell(eq, "person_liable", eq.person_liable)}
              </td>

              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {getFacilityName(eq.facility_id)}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs border-r border-gray-100 dark:border-gray-700">
                <div className="truncate cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                  {editingCell?.rowId === eq.id &&
                  editingCell?.column === "description"
                    ? renderEditableCell(eq, "description", eq.description)
                    : eq.description || "-"}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                <div className="truncate cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                  {editingCell?.rowId === eq.id &&
                  editingCell?.column === "remarks"
                    ? renderEditableCell(eq, "remarks", eq.remarks)
                    : eq.remarks || "-"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
