/**
 * SuppliesTable Component
 *
 * Table component for displaying supplies with selection and stock status
 */

import React from "react";
import { Supply, getStockStatus, formatImageUrl } from "../utils/helpers";
import { Image as ImageIcon, Edit, Trash2 } from "lucide-react";
import Image from "next/image";

interface SuppliesTableProps {
  supplies: Supply[];
  selectedRows: number[];
  onCheckboxChange: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onImageClick?: (imageUrl: string, supplyName: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onRowClick: (supply: Supply) => void;
  onEdit: (supply: Supply) => void;
  onDelete: (supply: Supply) => void;
}

const SuppliesTable: React.FC<SuppliesTableProps> = ({
  supplies,
  selectedRows,
  onCheckboxChange,
  onSelectAll,
  onImageClick,
  currentPage,
  itemsPerPage,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSupplies = supplies.slice(startIndex, endIndex);

  const allSelected =
    currentSupplies.length > 0 &&
    currentSupplies.every((supply) => selectedRows.includes(supply.id));

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
                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Name
            </th>
            <th className="sticky left-12 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Facility
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
          {currentSupplies.map((supply, index) => {
            const stockStatus = getStockStatus(
              supply.quantity,
              supply.stocking_point,
            );
            return (
              <tr
                key={supply.id}
                onClick={() => onRowClick(supply)}
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50/50 dark:bg-gray-700/20"
                }`}
              >
                <td
                  onClick={(e) => e.stopPropagation()}
                  className="sticky left-0 z-10 w-12 px-6 py-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(supply.id)}
                    onChange={() => onCheckboxChange(supply.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
                  {supply.name}
                </td>
                <td className="sticky left-12 z-10 px-6 py-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {supply.image ? (
                    <>
                      <Image
                        src={formatImageUrl(supply.image)!}
                        alt={supply.name}
                        className="h-12 w-12 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                        width={48}
                        height={48}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onImageClick) {
                            onImageClick(
                              formatImageUrl(supply.image!)!,
                              supply.name,
                            );
                          }
                        }}
                      />
                    </>
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                  {supply.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
                  {supply.quantity} {supply.stock_unit}
                </td>
                <td className="px-6 py-4 border-r border-gray-100 dark:border-gray-700">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${stockStatus.color}`}
                  >
                    {stockStatus.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                  {supply.facilities?.facility_name ||
                    supply.facilities?.name ||
                    "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {supply.remarks || "—"}
                </td>
                <td className="sticky right-0 z-10 px-3 py-3 whitespace-nowrap text-sm font-medium bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(supply);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(supply);
                      }}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliesTable;
