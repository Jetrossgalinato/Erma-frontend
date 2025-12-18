/**
 * SuppliesTable Component
 *
 * Table component for displaying supplies with selection and stock status
 */

import React from "react";
import { Supply, getStockStatus, formatImageUrl } from "../utils/helpers";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface SuppliesTableProps {
  supplies: Supply[];
  selectedRows: number[];
  onCheckboxChange: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onImageClick?: (imageUrl: string, supplyName: string) => void;
  currentPage: number;
  itemsPerPage: number;
}

const SuppliesTable: React.FC<SuppliesTableProps> = ({
  supplies,
  selectedRows,
  onCheckboxChange,
  onSelectAll,
  onImageClick,
  currentPage,
  itemsPerPage,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSupplies = supplies.slice(startIndex, endIndex);

  const allSelected =
    currentSupplies.length > 0 &&
    currentSupplies.every((supply) => selectedRows.includes(supply.id));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Facility
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Remarks
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {currentSupplies.map((supply) => {
            const stockStatus = getStockStatus(
              supply.quantity,
              supply.stocking_point
            );
            return (
              <tr
                key={supply.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(supply.id)}
                    onChange={() => onCheckboxChange(supply.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                  />
                </td>
                <td className="px-6 py-4">
                  {supply.image ? (
                    <>
                      <Image
                        src={formatImageUrl(supply.image)!}
                        alt={supply.name}
                        className="h-12 w-12 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                        width={48} // Adjust width as needed
                        height={48} // Adjust height as needed
                        onClick={() =>
                          onImageClick &&
                          onImageClick(
                            formatImageUrl(supply.image)!,
                            supply.name
                          )
                        }
                      />
                    </>
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {supply.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {supply.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {supply.quantity} {supply.stock_unit}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${stockStatus.color}`}
                  >
                    {stockStatus.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {supply.facilities?.facility_name ||
                    supply.facilities?.name ||
                    "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {supply.remarks || "—"}
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
