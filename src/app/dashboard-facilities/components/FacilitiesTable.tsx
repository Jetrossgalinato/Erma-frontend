/**
 * FacilitiesTable Component
 *
 * Displays the facilities table with sorting, selection, and pagination
 */

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Facility, getStatusColor } from "../utils/helpers";

interface FacilitiesTableProps {
  facilities: Facility[];
  selectedRows: number[];
  onCheckboxChange: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  currentPage: number;
  itemsPerPage: number;
  searchQuery?: string;
  onRowClick?: (facility: Facility) => void;
  onEdit: (facility: Facility) => void;
  onDelete: (facility: Facility) => void;
}

const FacilitiesTable: React.FC<FacilitiesTableProps> = ({
  facilities,
  selectedRows,
  onCheckboxChange,
  onSelectAll,
  currentPage,
  itemsPerPage,
  searchQuery = "",
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFacilities = facilities.slice(startIndex, endIndex);
  const allSelected =
    currentFacilities.length > 0 &&
    currentFacilities.every((facility) => selectedRows.includes(facility.id));

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="sticky left-0 z-10 w-12 px-6 py-3 text-left border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
              />
            </th>
            <th className="sticky left-12 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Connection Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Facility Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Floor Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Capacity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Cooling Tools
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Building
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Remarks
            </th>
            <th className="sticky right-0 z-10 px-3 py-3 border-b border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider shadow-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {currentFacilities.map((facility, index) => (
            <tr
              key={facility.id}
              onClick={() => onRowClick && onRowClick(facility)}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                index % 2 === 0
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50/50 dark:bg-gray-700/20"
              }`}
            >
              <td className="sticky left-0 z-10 w-12 px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(facility.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onCheckboxChange(facility.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                />
              </td>
              <td className="sticky left-12 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {facility.facility_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {facility.connection_type || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {facility.facility_type || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {facility.floor_level || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {facility.capacity || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {facility.cooling_tools || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {facility.building || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    facility.status || "",
                  )}`}
                >
                  {facility.status || "N/A"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate border-r border-gray-100 dark:border-gray-700">
                {facility.remarks || "-"}
              </td>
              <td className="sticky right-0 z-10 px-3 py-3 whitespace-nowrap text-sm font-medium bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(facility);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(facility);
                    }}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacilitiesTable;
