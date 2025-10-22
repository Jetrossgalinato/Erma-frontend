/**
 * ImportModal Component
 *
 * Modal for importing facilities from CSV file
 */

import React from "react";
import { Upload, Loader2 } from "lucide-react";
import { Facility } from "../utils/helpers";

interface ImportModalProps {
  importData: Partial<Facility>[];
  isProcessing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  onCancel: () => void;
  onTriggerFileSelect: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  importData,
  isProcessing,
  fileInputRef,
  onFileSelect,
  onImport,
  onCancel,
  onTriggerFileSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Import Facilities Data
            </h3>

            <div className="space-y-6">
              {/* File Upload Section */}
              <div>
                <button
                  onClick={onTriggerFileSelect}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Click to select CSV file
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    CSV file with facility data
                  </p>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={onFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview Table */}
              {importData.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Preview ({importData.length} facilities)
                    </h4>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Connection Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Facility Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Floor Level
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {importData.map((facility, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {facility.name || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {facility.connection_type || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {facility.facility_type || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {facility.floor_level || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {facility.status || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 text-green-600 dark:text-green-400 animate-spin mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Processing...
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onImport}
                disabled={importData.length === 0 || isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing
                  ? "Importing..."
                  : `Import ${importData.length} Facilities`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
