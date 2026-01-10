/**
 * ImportModal Component
 *
 * Modal for importing supplies from CSV file
 */

import React from "react";
import { Upload, Loader2, X } from "lucide-react";
import { Supply } from "../utils/helpers";

interface ImportModalProps {
  importData: Partial<Supply>[];
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Import Supplies Data
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Upload a CSV file with supply data
                </p>
                <button
                  onClick={onTriggerFileSelect}
                  disabled={isProcessing}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Select CSV File
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  CSV format: name, category, quantity, stocking_point,
                  stock_unit, facility_id, description, remarks
                </p>
              </div>

              {importData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Preview ({importData.length} supplies)
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Category
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {importData.map((supply, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                              {supply.name || "—"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {supply.category || "—"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {supply.quantity ?? "—"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {supply.stock_unit || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={onImport}
                disabled={importData.length === 0 || isProcessing}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="inline-block animate-spin h-4 w-4 mr-2" />
                    Importing...
                  </>
                ) : (
                  `Import ${importData.length} Supplies`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept=".csv"
        className="hidden"
      />
    </div>
  );
};

export default ImportModal;
