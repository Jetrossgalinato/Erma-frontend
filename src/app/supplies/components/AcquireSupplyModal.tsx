import { RefreshCw } from "lucide-react";
import { Supply } from "../utils/helpers";

interface AcquireSupplyModalProps {
  isOpen: boolean;
  supply: Supply | null;
  quantity: number;
  reason: string;
  isSubmitting: boolean;
  onQuantityChange: (quantity: number) => void;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function AcquireSupplyModal({
  isOpen,
  supply,
  quantity,
  reason,
  isSubmitting,
  onQuantityChange,
  onReasonChange,
  onSubmit,
  onClose,
}: AcquireSupplyModalProps) {
  if (!isOpen || !supply) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-xs sm:max-w-md p-3 sm:p-6 relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg sm:text-xl text-gray-800 font-semibold mb-3 sm:mb-4">
          Acquire Supply
        </h2>

        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Supply: <strong>{supply.supply_name}</strong>
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            Available Stock:{" "}
            <span className="font-medium">
              {supply.quantity} {supply.stock_unit}
            </span>
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label
              htmlFor="quantity"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1"
            >
              Quantity to Acquire
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={supply.quantity}
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1"
            >
              Reason (Optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Enter reason for acquiring this supply..."
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-16 sm:h-20 resize-none text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={
              isSubmitting || quantity <= 0 || quantity > supply.quantity
            }
            className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
          >
            {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
