import React from "react";
import { checklistItems } from "../utils/checklistData";

interface DailyChecklistTableProps {
  checklist: Record<string, { status: string; remarks: string }>;
  onStatusChange: (item: string, status: string) => void;
  onRemarksChange: (item: string, remarks: string) => void;
}

const DailyChecklistTable: React.FC<DailyChecklistTableProps> = ({
  checklist,
  onStatusChange,
  onRemarksChange,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 w-1/2"
            >
              Task
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 w-1/4"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Remarks
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(checklistItems).map(([category, items]) => (
            <React.Fragment key={category}>
              <tr className="bg-gray-50">
                <td
                  colSpan={3}
                  className="px-6 py-2 text-sm font-bold text-gray-900 border-b border-gray-300"
                >
                  {category}
                </td>
              </tr>
              {items.map((item) => (
                <tr key={item}>
                  <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-300">
                    {item}
                  </td>
                  <td className="px-6 py-4 text-center border-r border-gray-300">
                    <div className="flex justify-center space-x-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${item}`}
                          value="Check"
                          checked={checklist[item]?.status === "Check"}
                          onChange={() => onStatusChange(item, "Check")}
                          className="form-radio h-4 w-4 text-green-600"
                        />
                        <span className="ml-1 text-xs">✓</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${item}`}
                          value="Issue"
                          checked={checklist[item]?.status === "Issue"}
                          onChange={() => onStatusChange(item, "Issue")}
                          className="form-radio h-4 w-4 text-red-600"
                        />
                        <span className="ml-1 text-xs">✕</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${item}`}
                          value="N/A"
                          checked={checklist[item]?.status === "N/A"}
                          onChange={() => onStatusChange(item, "N/A")}
                          className="form-radio h-4 w-4 text-gray-600"
                        />
                        <span className="ml-1 text-xs">N/A</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={checklist[item]?.remarks || ""}
                      onChange={(e) => onRemarksChange(item, e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm px-2 py-1 border"
                      placeholder="Add remarks..."
                    />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyChecklistTable;
