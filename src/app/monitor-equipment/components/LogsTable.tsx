"use client";

import { EquipmentLog } from "../utils/helpers";
import { formatDateTime } from "../utils/helpers";

interface LogsTableProps {
  logs: EquipmentLog[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
        No equipment logs found
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700"></thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {logs.map((log) => (
          <tr
            key={log.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td className="px-6 py-4 text-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1 text-gray-900 dark:text-gray-100 break-words pr-4">
                  {log.log_message}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
