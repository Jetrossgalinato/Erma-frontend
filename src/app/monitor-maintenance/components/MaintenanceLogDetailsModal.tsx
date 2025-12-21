import React from "react";
import {
  X,
  ClipboardList,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { MaintenanceLog, ChecklistItem } from "../utils/helpers";

interface MaintenanceLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: MaintenanceLog | null;
  onConfirm: (id: number, logType: string) => void;
  onReject: (id: number, logType: string) => void;
}

interface TechChecklistItem {
  task: string;
  status: boolean;
  remarks: string;
}

interface TechChecklistSection {
  title: string;
  items: TechChecklistItem[];
}

interface TechChecklistData {
  type: string;
  sections: TechChecklistSection[];
}

export default function MaintenanceLogDetailsModal({
  isOpen,
  onClose,
  log,
  onConfirm,
  onReject,
}: MaintenanceLogDetailsModalProps) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Maintenance Report Details
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Laboratory
                </h3>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {log.laboratory}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  Date
                </h3>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {log.date}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-500" />
                Maintenance Checklist
              </h3>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                {(() => {
                  try {
                    const parsedData = JSON.parse(log.checklist_data);

                    // Check if it's the technician format (has sections)
                    if (
                      parsedData.sections &&
                      Array.isArray(parsedData.sections)
                    ) {
                      const techData = parsedData as TechChecklistData;
                      return (
                        <div className="space-y-6">
                          {techData.sections.map((section, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
                            >
                              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                {section.title}
                              </h4>
                              <ul className="space-y-3">
                                {section.items.map((item, iIdx) => (
                                  <li
                                    key={iIdx}
                                    className="text-sm flex justify-between items-start gap-4"
                                  >
                                    <div className="flex-1">
                                      <span className="text-gray-600 dark:text-gray-300 block">
                                        {item.task}
                                      </span>
                                      {item.remarks && (
                                        <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                          Note: {item.remarks}
                                        </p>
                                      )}
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                        item.status
                                          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                                          : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700"
                                      }`}
                                    >
                                      {item.status ? "Check" : "Issue"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    const checklist = parsedData as Record<
                      string,
                      ChecklistItem
                    >;
                    return (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <ul className="space-y-3">
                          {Object.entries(checklist).map(([item, data]) => (
                            <li
                              key={item}
                              className="text-sm flex justify-between items-start gap-4"
                            >
                              <div className="flex-1">
                                <span className="text-gray-600 dark:text-gray-300 block">
                                  {item}
                                </span>
                                {data.remarks && (
                                  <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                    Note: {data.remarks}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                  data.status === "Check"
                                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                                    : data.status === "Issue"
                                    ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700"
                                    : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700"
                                }`}
                              >
                                {data.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  } catch {
                    return <p>Error parsing checklist data</p>;
                  }
                })()}
              </div>
            </div>
            {log.additional_concerns && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 dark:text-amber-400 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Additional Concerns
                </h3>
                <p className="text-amber-800 dark:text-amber-300">
                  {log.additional_concerns}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {log.status !== "Confirmed" && log.status !== "Rejected" && (
              <>
                <button
                  onClick={() => {
                    onConfirm(log.id, log.log_type);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Report
                </button>
                <button
                  onClick={() => {
                    onReject(log.id, log.log_type);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Report
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
