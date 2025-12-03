/**
 * Shared DeleteConfirmationModal Component
 *
 * Reusable modal for confirming deletion actions across the application
 */

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemCount?: number;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title = "Confirm Deletion",
  message,
  itemCount,
  itemType = "item",
  onConfirm,
  onCancel,
  confirmText,
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  // Generate default message if not provided
  const defaultMessage = itemCount
    ? `Are you sure you want to delete ${itemCount} selected ${
        itemCount === 1 ? itemType : `${itemType}s`
      }? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  const displayMessage = message || defaultMessage;

  // Generate confirm button text
  const defaultConfirmText = itemCount
    ? `Delete ${itemCount === 1 ? itemType : `${itemType}s`}`
    : `Delete`;

  const displayConfirmText = confirmText || defaultConfirmText;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {displayMessage}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              {displayConfirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
