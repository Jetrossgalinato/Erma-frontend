/**
 * DeleteConfirmationModal Component
 *
 * Modal for confirming deletion of selected supplies
 */

import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  selectedCount,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Confirm Deletion
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete {selectedCount} selected{" "}
                {selectedCount === 1 ? "supply" : "supplies"}? This action
                cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Delete {selectedCount === 1 ? "Supply" : "Supplies"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
