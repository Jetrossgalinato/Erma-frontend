import { formatDate, getStatusColor } from "../utils/helpers";
import type { Borrowing } from "../utils/helpers";

interface BorrowingTableProps {
  requests: Borrowing[];
  selectedIds: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: number, checked: boolean) => void;
}

const getEndDateColorClass = (dateString: string) => {
  const endDate = new Date(dateString);
  const now = new Date();

  if (endDate < now) {
    return "text-red-600 font-medium";
  }

  // Calculate difference in hours
  const diffMs = endDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 24) {
    return "text-yellow-600 font-medium";
  }

  return "text-green-600 font-medium";
};

export default function BorrowingTable({
  requests,
  selectedIds,
  onSelectAll,
  onSelectOne,
}: BorrowingTableProps) {
  const allSelected =
    requests.length > 0 && selectedIds.length === requests.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < requests.length;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 sm:px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th
              scope="col"
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Equipment
            </th>
            <th
              scope="col"
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Quantity
            </th>
            <th
              scope="col"
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date Borrowed
            </th>
            <th
              scope="col"
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              End Date
            </th>
            <th
              scope="col"
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Return Status
            </th>
            <th
              scope="col"
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Purpose
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(request.id)}
                  onChange={(e) => onSelectOne(request.id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                {request.equipment_name}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                {request.quantity}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                {formatDate(request.borrow_date)}
              </td>
              <td
                className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm ${getEndDateColorClass(
                  request.end_date
                )}`}
              >
                {formatDate(request.end_date)}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    request.return_status ?? "Not returned"
                  )}`}
                >
                  {request.return_status ?? "Not returned"}
                </span>
              </td>
              <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                {request.purpose}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
