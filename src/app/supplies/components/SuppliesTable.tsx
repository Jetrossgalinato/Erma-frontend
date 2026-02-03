import Image from "next/image";
import { formatImageUrl, Supply, isLowStock } from "../utils/helpers";
import { ImageIcon } from "lucide-react";

interface SuppliesTableProps {
  data: Supply[];
  isAuthenticated: boolean;
  isLoading: boolean;
  onAcquire: (supply: Supply) => void;
  onImageClick?: (imageUrl: string, supplyName: string) => void;
}

export default function SuppliesTable({
  data,
  isAuthenticated,
  isLoading,
  onAcquire,
  onImageClick,
}: SuppliesTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden mb-8 sm:mb-12">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Image
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Facility
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Stock Info
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Remarks
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((supply) => (
              <tr key={supply.supply_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-10 w-10 relative">
                    {supply.image_url ? (
                      <button
                        onClick={() =>
                          onImageClick?.(
                            formatImageUrl(supply.image_url) || "",
                            supply.supply_name,
                          )
                        }
                        className="relative w-full h-full block cursor-pointer transition-opacity hover:opacity-80"
                      >
                        <Image
                          src={formatImageUrl(supply.image_url) || ""}
                          alt={supply.supply_name}
                          fill
                          className="rounded object-cover"
                          sizes="40px"
                        />
                      </button>
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {supply.supply_name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-500 max-w-xs break-words">
                    {supply.description || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {supply.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supply.facility_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span
                      className={
                        supply.quantity <= 0
                          ? "text-red-600 font-medium"
                          : isLowStock(supply.quantity, supply.stocking_point)
                            ? "text-yellow-600 font-medium"
                            : "text-green-600 font-medium"
                      }
                    >
                      Qty: {supply.quantity} {supply.stock_unit}
                    </span>
                    <span className="text-xs text-gray-500">
                      Min: {supply.stocking_point}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-500 max-w-xs break-words">
                    {supply.remarks || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white/95 backdrop-blur z-10 border-l border-gray-100">
                  <div className="flex justify-end gap-2">
                    {isLoading ? (
                      <div className="px-3 py-1 text-xs bg-gray-200 rounded animate-pulse w-[60px]"></div>
                    ) : (
                      <button
                        className={`px-3 py-1 text-xs text-white rounded transition-colors ${
                          isAuthenticated && supply.quantity > 0
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          isAuthenticated &&
                          supply.quantity > 0 &&
                          onAcquire(supply)
                        }
                        disabled={!isAuthenticated || supply.quantity <= 0}
                        title={
                          !isAuthenticated
                            ? "Please log in to acquire supplies"
                            : supply.quantity <= 0
                              ? "Out of stock"
                              : ""
                        }
                      >
                        {supply.quantity <= 0 ? "Out of Stock" : "Acquire"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
