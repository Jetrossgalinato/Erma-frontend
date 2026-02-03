import { Supply, isLowStock } from "../utils/helpers";

interface SupplyDetailsModalProps {
  isOpen: boolean;
  supply: Supply | null;
  onClose: () => void;
}

export default function SupplyDetailsModal({
  isOpen,
  supply,
  onClose,
}: SupplyDetailsModalProps) {
  if (!isOpen || !supply) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg sm:max-w-2xl p-3 sm:p-6 relative shadow-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl sm:text-2xl text-gray-800 font-semibold mb-3 sm:mb-4">
          {supply.supply_name}
        </h2>

        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
          <p>
            <strong>Description:</strong> {supply.description || "N/A"}
          </p>
          <p>
            <strong>Category:</strong> {supply.category || "N/A"}
          </p>
          <p>
            <strong>Facility:</strong> {supply.facility_name || "N/A"}
          </p>
          <p>
            <strong>Current Stock:</strong>{" "}
            <span
              className={
                supply.quantity <= 0
                  ? "text-red-600 font-medium"
                  : isLowStock(supply.quantity, supply.stocking_point)
                    ? "text-yellow-600 font-medium"
                    : "text-green-600 font-medium"
              }
            >
              {supply.quantity} {supply.stock_unit}
            </span>
          </p>
          <p>
            <strong>Stocking Point:</strong> {supply.stocking_point}{" "}
            {supply.stock_unit}
          </p>
          <p>
            <strong>Remarks:</strong> {supply.remarks || "N/A"}
          </p>
        </div>

        {supply.quantity <= 0 ? (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-xs sm:text-sm font-medium">
              🚫 Out of Stock
            </p>
            <p className="text-red-700 text-[10px] sm:text-xs">
              This item is currently out of stock.
            </p>
          </div>
        ) : isLowStock(supply.quantity, supply.stocking_point) ? (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-xs sm:text-sm font-medium">
              ⚠️ Low Stock Warning
            </p>
            <p className="text-yellow-700 text-[10px] sm:text-xs">
              Current stock is at or below the stocking point.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
