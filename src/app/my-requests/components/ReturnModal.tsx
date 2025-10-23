import { X, Send, RefreshCw } from "lucide-react";

interface ReturnModalProps {
  isOpen: boolean;
  selectedCount: number;
  receiverName: string;
  isSubmitting: boolean;
  onReceiverNameChange: (name: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function ReturnModal({
  isOpen,
  selectedCount,
  receiverName,
  isSubmitting,
  onReceiverNameChange,
  onSubmit,
  onClose,
}: ReturnModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Mark Items as Returned
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-2 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
            You are about to mark {selectedCount} item(s) as returned.
          </p>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            {"Receiver's"} Name *
          </label>
          <input
            type="text"
            value={receiverName}
            onChange={(e) => onReceiverNameChange(e.target.value)}
            placeholder="Enter the name of person who received the items"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex gap-2 sm:gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !receiverName.trim()}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSubmitting ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}
