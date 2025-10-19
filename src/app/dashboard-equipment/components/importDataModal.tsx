import React from "react";
import { Upload } from "lucide-react";

type Equipment = {
  id: number;
  po_number?: string;
  unit_number?: string;
  brand_name?: string;
  description?: string;
  category?: string;
  status?: string;
  date_acquired?: string;
  supplier?: string;
  amount?: string;
  estimated_life?: string;
  item_number?: string;
  property_number?: string;
  control_number?: string;
  serial_number?: string;
  person_liable?: string;
  remarks?: string;
  updated_at?: string;
  name: string;
  facility_id?: number;
  availability?: string;
  created_at: string;
  image?: string;
};

type ImportDataModalProps = {
  isOpen: boolean;
  selectedFile: File | null;
  importData: Partial<Equipment>[];
  isProcessing: boolean;
  onClose: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function ImportDataModal({
  isOpen,
  selectedFile,
  importData,
  isProcessing,
  onClose,
  onFileSelect,
  onImport,
  fileInputRef,
}: ImportDataModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Import Equipment Data
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Upload file
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {selectedFile
                      ? selectedFile.name
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    CSV files (.csv) up to 10MB
                  </p>
                </div>
              </div>

              {importData.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preview
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {importData.length} row
                      {importData.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                              Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                              Category
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                              Status
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                              Brand
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {importData.map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                {item.name || "-"}
                              </td>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                {item.category || "-"}
                              </td>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                {item.status || "-"}
                              </td>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                {item.brand_name || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 dark:border-green-400 border-t-transparent"></div>
                  <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                    Processing equipment data...
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
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
                  : `Import ${importData.length} Equipment${
                      importData.length !== 1 ? "s" : ""
                    }`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
