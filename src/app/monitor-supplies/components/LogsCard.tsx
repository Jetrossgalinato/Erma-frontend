"use client";

import { SupplyLog } from "../utils/helpers";
import Loader from "@/components/Loader";
import LogsTable from "./LogsTable";
import PaginationControls from "./PaginationControls";

interface LogsCardProps {
  logs: SupplyLog[];
  loading: boolean;
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function LogsCard({
  logs,
  loading,
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
}: LogsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Supply Logs
        </h2>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <Loader fullScreen={false} className="h-64" />
        ) : (
          <LogsTable logs={logs} />
        )}
      </div>
      {!loading && logs.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
