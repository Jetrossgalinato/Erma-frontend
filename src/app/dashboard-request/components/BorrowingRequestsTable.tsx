/**
 * Borrowing Requests Table Component
 * Displays borrowing requests with selection and status indicators
 */

import { BorrowingRequest } from "../utils/helpers";
import { formatDate, formatTime, getStatusColor } from "../utils/helpers";

interface BorrowingRequestsTableProps {
  requests: BorrowingRequest[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
}

export default function BorrowingRequestsTable({
  requests,
  selectedIds,
  onToggleSelection,
  onSelectAll,
}: BorrowingRequestsTableProps) {
  const allSelected =
    requests.length > 0 && selectedIds.length === requests.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < requests.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(requests.map((r) => r.id));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Borrower
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Equipment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Purpose
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Return Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Receiver
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {requests.map((request) => (
            <tr
              key={request.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                selectedIds.includes(request.id)
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(request.id)}
                  onChange={() => onToggleSelection(request.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                {request.borrower_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                {request.equipment_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate border-r border-gray-200 dark:border-gray-700">
                {request.purpose}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                <div>{formatDate(request.start_date)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {formatTime(request.start_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                <div>{formatDate(request.end_date)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {formatTime(request.end_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    request.request_status
                  )}`}
                >
                  {request.request_status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                {request.return_status ? (
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      request.return_status
                    )}`}
                  >
                    {request.return_status}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    Not returned
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {request.return_notification?.receiver_name || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
