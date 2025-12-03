/**
 * Action Buttons Component
 * Provides bulk action buttons and dropdown for requests
 */

import { ChevronDown, Check, X, Trash2, RefreshCw, Bell } from "lucide-react";

interface ActionButtonsProps {
  selectedCount: number;
  showActionDropdown: boolean;
  onToggleDropdown: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onShowNotifications?: () => void;
  notificationCount?: number;
  notificationLabel?: string;
  disableApprove?: boolean;
  disableReject?: boolean;
}

export default function ActionButtons({
  selectedCount,
  showActionDropdown,
  onToggleDropdown,
  onApprove,
  onReject,
  onDelete,
  onRefresh,
  onShowNotifications,
  notificationCount,
  notificationLabel = "Notifications",
  disableApprove = false,
  disableReject = false,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Actions Dropdown */}
      <div className="relative">
        <button
          onClick={onToggleDropdown}
          disabled={selectedCount === 0}
          className="bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Actions
          <ChevronDown className="w-4 h-4" />
        </button>

        {showActionDropdown && selectedCount > 0 && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={onApprove}
                disabled={disableApprove}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                Approve Selected
              </button>
              <button
                onClick={onReject}
                disabled={disableReject}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                Reject Selected
              </button>
              <div className="border-t dark:border-gray-600 mt-1">
                <button
                  onClick={onDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>

      {/* Notifications Button (optional) */}
      {onShowNotifications && (
        <button
          onClick={onShowNotifications}
          className="bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative"
        >
          <Bell className="w-4 h-4" />
          {notificationLabel}
          {notificationCount !== undefined && notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
