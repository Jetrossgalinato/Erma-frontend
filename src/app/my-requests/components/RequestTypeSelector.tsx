import { ChevronDown } from "lucide-react";

interface RequestTypeSelectorProps {
  currentType: "borrowing" | "booking" | "acquiring";
  onChange: (type: "borrowing" | "booking" | "acquiring") => void;
}

export default function RequestTypeSelector({
  currentType,
  onChange,
}: RequestTypeSelectorProps) {
  const getTypeName = (type: "borrowing" | "booking" | "acquiring") => {
    switch (type) {
      case "borrowing":
        return "Borrowing Requests";
      case "booking":
        return "Booking Requests";
      case "acquiring":
        return "Acquiring Requests";
    }
  };

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <select
        value={currentType}
        onChange={(e) =>
          onChange(e.target.value as "borrowing" | "booking" | "acquiring")
        }
        className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base font-medium cursor-pointer hover:border-gray-400 transition-colors w-full"
      >
        <option value="borrowing">Borrowing Requests</option>
        <option value="booking">Booking Requests</option>
        <option value="acquiring">Acquiring Requests</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
