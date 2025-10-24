/**
 * Request Type Selector Component
 * Dropdown to switch between borrowing, booking, and acquiring requests
 */

interface RequestTypeSelectorProps {
  currentType: "borrowing" | "booking" | "acquiring";
  onChange: (type: "borrowing" | "booking" | "acquiring") => void;
}

export default function RequestTypeSelector({
  currentType,
  onChange,
}: RequestTypeSelectorProps) {
  return (
    <div className="relative inline-block text-left">
      <select
        value={currentType}
        onChange={(e) =>
          onChange(e.target.value as "borrowing" | "booking" | "acquiring")
        }
        className="block w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="borrowing">Borrowing Requests</option>
        <option value="booking">Booking Requests</option>
        <option value="acquiring">Acquiring Requests</option>
      </select>
    </div>
  );
}
