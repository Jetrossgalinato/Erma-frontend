import { RotateCcw, Trash2, Repeat } from "lucide-react";
import Link from "next/link";

interface ActionButtonsProps {
  requestType: "borrowing" | "booking" | "acquiring";
  selectedCount: number;
  onMarkReturned?: () => void;
  onMarkDone?: () => void;
  onDelete: () => void;
  disableMarkAction?: boolean;
}

export default function ActionButtons({
  requestType,
  selectedCount,
  onMarkReturned,
  onMarkDone,
  onDelete,
  disableMarkAction = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
      {requestType === "borrowing" && onMarkReturned && (
        <button
          onClick={onMarkReturned}
          disabled={selectedCount === 0 || disableMarkAction}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <RotateCcw className="w-4 h-4" />
          Mark as Returned ({selectedCount})
        </button>
      )}
      {requestType === "booking" && onMarkDone && (
        <button
          onClick={onMarkDone}
          disabled={selectedCount === 0 || disableMarkAction}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
        >
          <RotateCcw className="w-4 h-4" />
          Mark as Done ({selectedCount})
        </button>
      )}
      <button
        onClick={onDelete}
        disabled={selectedCount === 0}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
      >
        <Trash2 className="w-4 h-4" />
        Delete ({selectedCount})
      </button>

      {requestType === "borrowing" && (
        <Link
          href="/equipment"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Repeat className="w-4 h-4" />
          Borrow again
        </Link>
      )}
    </div>
  );
}
