import React from "react";
import { ChecklistSection } from "../utils/types";

interface ChecklistTableProps {
  sections: ChecklistSection[];
  onStatusChange: (
    sectionIndex: number,
    itemIndex: number,
    checked: boolean
  ) => void;
  onRemarksChange: (
    sectionIndex: number,
    itemIndex: number,
    value: string
  ) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({
  sections,
  onStatusChange,
  onRemarksChange,
}) => {
  return (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {section.title}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3"
                  >
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {section.items.map((item, itemIndex) => (
                  <tr key={itemIndex}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {item.task}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.status}
                        onChange={(e) =>
                          onStatusChange(
                            sectionIndex,
                            itemIndex,
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) =>
                          onRemarksChange(
                            sectionIndex,
                            itemIndex,
                            e.target.value
                          )
                        }
                        className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-transparent dark:text-white px-2 py-1 border"
                        placeholder="Add remarks..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChecklistTable;
