import { RotateCcw, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  requestType: "borrowing" | "booking" | "acquiring";
  selectedCount: number;
  onMarkReturned?: () => void;
  onMarkDone?: () => void;
  onDelete: () => void;
}

export default function ActionButtons({
  requestType,
  selectedCount,
  onMarkReturned,
  onMarkDone,
  onDelete,
}: ActionButtonsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
      {requestType === "borrowing" && onMarkReturned && (
        <button
          onClick={onMarkReturned}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Mark as Returned ({selectedCount})
        </button>
      )}
      {requestType === "booking" && onMarkDone && (
        <button
          onClick={onMarkDone}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Mark as Done ({selectedCount})
        </button>
      )}
      <button
        onClick={onDelete}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete ({selectedCount})
      </button>
    </div>
  );
}
