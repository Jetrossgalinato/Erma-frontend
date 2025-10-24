import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({
  selectedCount,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
        onClick={onCancel}
      ></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-sm w-full z-50">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Delete Selected Users
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete <strong>{selectedCount}</strong>{" "}
                user record{selectedCount !== 1 ? "s" : ""}? This action cannot
                be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-center gap-3">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-700 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
