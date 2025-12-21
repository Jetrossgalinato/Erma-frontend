import React from "react";
import { Filter, RefreshCw } from "lucide-react";

interface MaintenanceLogHeaderProps {
  filterType: string;
  setFilterType: (type: string) => void;
  onRefresh: () => void;
}

export default function MaintenanceLogHeader({
  filterType,
  setFilterType,
  onRefresh,
}: MaintenanceLogHeaderProps) {
  return (
    <div className="mb-8 pt-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Maintenance Logs
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review and confirm maintenance reports submitted by student assistants
          and lab technicians.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="All">All Types</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <button
          onClick={onRefresh}
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}
