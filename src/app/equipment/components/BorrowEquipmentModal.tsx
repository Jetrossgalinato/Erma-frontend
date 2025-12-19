import React from "react";
import { Equipment, BorrowingFormData } from "../utils/helpers";

interface BorrowEquipmentModalProps {
  isOpen: boolean;
  equipment: Equipment | null;
  formData: BorrowingFormData;
  borrowing: boolean;
  onClose: () => void;
  onFormChange: (formData: BorrowingFormData) => void;
  onSubmit: () => void;
}

export default function BorrowEquipmentModal({
  isOpen,
  equipment,
  formData,
  borrowing,
  onClose,
  onFormChange,
  onSubmit,
}: BorrowEquipmentModalProps) {
  if (!isOpen || !equipment) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
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
        <h2 className="text-lg sm:text-xl text-gray-800 font-semibold mb-2 sm:mb-4">
          Borrow Equipment: {equipment.name}
        </h2>
        <div className="space-y-2 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
              Purpose *
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  purpose: e.target.value,
                })
              }
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-base text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              rows={2}
              placeholder="Enter purpose for borrowing..."
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
              Start Date *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.start_date}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  start_date: e.target.value,
                })
              }
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-base text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
              End Date *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.end_date}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  end_date: e.target.value,
                })
              }
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-base text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
              Expected Return Date *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.return_date}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  return_date: e.target.value,
                })
              }
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-base text-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={borrowing}
            className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {borrowing ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
