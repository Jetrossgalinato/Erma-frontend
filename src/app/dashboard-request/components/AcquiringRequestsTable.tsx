/**
 * Acquiring Requests Table Component
 * Displays supply acquisition requests with selection and status indicators
 */

import { AcquiringRequest } from "../utils/helpers";
import { formatDate, formatTime, getStatusColor } from "../utils/helpers";

interface AcquiringRequestsTableProps {
  requests: AcquiringRequest[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
}

export default function AcquiringRequestsTable({
  requests,
  selectedIds,
  onToggleSelection,
  onSelectAll,
}: AcquiringRequestsTableProps) {
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
              Requester
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Supply
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Facility
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Purpose
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
              Request Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
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
                {request.acquirer_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                {request.supply_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {request.facility_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 text-center border-r border-gray-200 dark:border-gray-700">
                {request.quantity}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate border-r border-gray-200 dark:border-gray-700">
                {request.purpose}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                <div>{formatDate(request.created_at)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {formatTime(request.created_at)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
