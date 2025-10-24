import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function PageHeader({
  onRefresh,
  isRefreshing,
}: PageHeaderProps) {
  return (
    <div className="mb-8 pt-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Users Management
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage and view all account requests from users in the system
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isRefreshing ? "cursor-not-allowed opacity-75" : ""
        }`}
      >
        <RefreshCw
          className={`w-4 h-4 transition-transform duration-300 ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}
