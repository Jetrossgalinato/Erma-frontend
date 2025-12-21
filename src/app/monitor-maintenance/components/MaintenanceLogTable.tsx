import React from "react";
import {
  Eye,
  CheckCircle,
  Calendar,
  MapPin,
  ClipboardList,
  AlertCircle,
  User,
  Trash2,
  Clock,
} from "lucide-react";
import { MaintenanceLog } from "../utils/helpers";

interface MaintenanceLogTableProps {
  logs: MaintenanceLog[];
  loading: boolean;
  onConfirm: (id: number, logType: string) => void;
  onDelete: (id: number, logType: string) => void;
  onViewDetails: (log: MaintenanceLog) => void;
}

export default function MaintenanceLogTable({
  logs,
  loading,
  onConfirm,
  onDelete,
  onViewDetails,
}: MaintenanceLogTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date & Time
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Laboratory
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Submitted By
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Status
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {logs.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                    <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium">
                      No maintenance logs found
                    </p>
                    <p className="text-sm">
                      No logs match the selected filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr
                  key={`${log.log_type}-${log.id}`}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50/50 dark:bg-gray-700/20"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col">
                      <span className="font-medium">{log.date}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                    {log.laboratory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {log.user_first_name} {log.user_last_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {log.user_role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border w-fit ${
                          log.status === "Confirmed"
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
                        }`}
                      >
                        {log.status === "Confirmed" ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {log.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        Type: {log.checklist_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDetails(log)}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-500 rounded-lg transition-all duration-200 border border-indigo-600 dark:border-indigo-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {log.status !== "Confirmed" && (
                        <button
                          onClick={() => onConfirm(log.id, log.log_type)}
                          className="inline-flex items-center justify-center p-2 text-green-600 hover:text-white hover:bg-green-600 dark:text-green-400 dark:hover:bg-green-500 rounded-lg transition-all duration-200 border border-green-600 dark:border-green-400"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(log.id, log.log_type)}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:bg-red-500 rounded-lg transition-all duration-200 border border-red-600 dark:border-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
