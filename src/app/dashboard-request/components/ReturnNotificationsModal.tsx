/**
 * Return Notifications Modal Component
 * Displays notifications for equipment returns (borrowing requests)
 */

import { X, Check, XCircle } from "lucide-react";
import { ReturnNotification } from "../utils/helpers";
import {
  formatDate,
  formatTime,
  confirmReturn,
  rejectReturn,
} from "../utils/helpers";
import { useState } from "react";

interface ReturnNotificationsModalProps {
  notifications: ReturnNotification[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function ReturnNotificationsModal({
  notifications,
  onClose,
  onRefresh,
}: ReturnNotificationsModalProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleConfirm = async (notificationId: number, borrowingId: number) => {
    try {
      setProcessingId(notificationId);
      await confirmReturn(notificationId, borrowingId);
      alert("Return confirmed successfully");
      onRefresh();
    } catch (error) {
      console.error("Error confirming return:", error);
      alert("Failed to confirm return");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (notificationId: number) => {
    try {
      setProcessingId(notificationId);
      await rejectReturn(notificationId);
      alert("Return rejected successfully");
      onRefresh();
    } catch (error) {
      console.error("Error rejecting return:", error);
      alert("Failed to reject return");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Return Notifications ({notifications.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No return notifications
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {notification.borrower_name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          returned
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {notification.equipment_name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Receiver:</span>{" "}
                          {notification.receiver_name}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          <span className="capitalize">
                            {notification.status}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Message:</span>{" "}
                          {notification.message}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(notification.created_at)} at{" "}
                          {formatTime(notification.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleConfirm(
                            notification.id,
                            notification.borrowing_id
                          )
                        }
                        disabled={processingId === notification.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleReject(notification.id)}
                        disabled={processingId === notification.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
