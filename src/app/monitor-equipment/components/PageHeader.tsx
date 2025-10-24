"use client";

import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
  onRefresh: () => void;
}

export default function PageHeader({ onRefresh }: PageHeaderProps) {
  return (
    <div className="mb-8 pt-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Equipment Monitoring
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          View detailed logs of all user interactions with equipment records and
          borrowing requests, including approvals, rejections, modifications,
          and deletions.
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>
    </div>
  );
}
