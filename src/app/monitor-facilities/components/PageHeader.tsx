"use client";

import { RefreshCw, Search, Download } from "lucide-react";

interface PageHeaderProps {
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onExport: () => void;
}

export default function PageHeader({
  onRefresh,
  searchQuery,
  onSearchChange,
  onExport,
}: PageHeaderProps) {
  return (
    <div className="mb-8 pt-8 flex flex-col sm:flex-row items-end justify-between gap-4">
      <div className="w-full sm:w-auto">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Facility Monitoring
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          View detailed logs of all user interactions with facility records and
          reservation requests, including approvals, rejections, modifications,
          and deletions.
        </p>
        <div className="relative mt-4 w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all"
          />
        </div>
      </div>

      <div className="flex gap-4 items-center w-full sm:w-auto">
        <button
          onClick={onExport}
          className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>

        <button
          onClick={onRefresh}
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}
