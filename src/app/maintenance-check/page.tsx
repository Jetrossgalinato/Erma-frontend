"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type ChecklistType = "Daily" | "Weekly" | "Monthly";

interface ChecklistItem {
  task: string;
  status: boolean;
  remarks: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

const MaintenanceCheckPage = () => {
  const [selectedType, setSelectedType] = useState<ChecklistType>("Daily");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Data for checklists
  const dailyChecklist: ChecklistSection[] = [
    {
      title: "General maintenance",
      items: [
        {
          task: "Ensure lab is clean and organized (verification only; cleaning handled by SA, Review CCTV Camera)",
          status: false,
          remarks: "",
        },
        {
          task: "Check if chairs and tables are properly arranged and undamaged",
          status: false,
          remarks: "",
        },
        { task: "Inspect whiteboard and markers", status: false, remarks: "" },
        {
          task: "Ensure fire extinguisher is accessible and not expired",
          status: false,
          remarks: "",
        },
        {
          task: "Verify emergency lamps and signages are visible and functional",
          status: false,
          remarks: "",
        },
      ],
    },
    {
      title: "Computer Systems",
      items: [
        {
          task: "Power on computers and check if they boot properly",
          status: false,
          remarks: "",
        },
        {
          task: "Test keyboard, mouse, and monitor for each computer",
          status: false,
          remarks: "",
        },
        {
          task: "Verify network connectivity for all computers",
          status: false,
          remarks: "",
        },
        {
          task: "Ensure printer, scanner, and other peripherals are functional",
          status: false,
          remarks: "",
        },
      ],
    },
    {
      title: "Electrical and Networking",
      items: [
        {
          task: "Check air-conditioning unit functionality",
          status: false,
          remarks: "",
        },
        {
          task: "Ensure TV is operational and remote is working",
          status: false,
          remarks: "",
        },
        {
          task: "Test lighting and ensure all bulbs are functional",
          status: false,
          remarks: "",
        },
        {
          task: "Inspect electrical outlets and extension wires for any damage",
          status: false,
          remarks: "",
        },
        {
          task: "Ensure all routers and network switches are operational",
          status: false,
          remarks: "",
        },
      ],
    },
    {
      title: "Security and Safety",
      items: [
        {
          task: "Check windows and doors for proper locking",
          status: false,
          remarks: "",
        },
        {
          task: "Inspect medicine kit and restock if necessary",
          status: false,
          remarks: "",
        },
        { task: "Report any issues immediately", status: false, remarks: "" },
        { task: "Review CCTV Camera", status: false, remarks: "" },
      ],
    },
  ];

  const weeklyChecklist: ChecklistSection[] = [
    {
      title: "Computer Systems",
      items: [
        {
          task: "Perform antivirus scan on all computers",
          status: false,
          remarks: "",
        },
        {
          task: "Check for and install software updates",
          status: false,
          remarks: "",
        },
        {
          task: "Run disk cleanup and defragmentation (if applicable)",
          status: false,
          remarks: "",
        },
        {
          task: "Deep clean computer keyboards, monitors, and mice",
          status: false,
          remarks: "",
        },
        { task: "Dust off CPU fans and vents", status: false, remarks: "" },
      ],
    },
    {
      title: "Electrical and Networking",
      items: [
        {
          task: "Inspect network stability and check for slowdowns",
          status: false,
          remarks: "",
        },
        {
          task: "Test all electrical sockets and report any issues",
          status: false,
          remarks: "",
        },
        {
          task: "Inspect circuit breakers for any irregularities",
          status: false,
          remarks: "",
        },
        {
          task: "Ensure air-conditioning filters are clean",
          status: false,
          remarks: "",
        },
      ],
    },
    {
      title: "Security and Safety",
      items: [
        {
          task: "Verify that all signages are still visible and intact",
          status: false,
          remarks: "",
        },
        {
          task: "Restock missing items in the medicine kit",
          status: false,
          remarks: "",
        },
        {
          task: "Ensure all security cameras (if available) are working",
          status: false,
          remarks: "",
        },
      ],
    },
  ];

  const monthlyChecklist: ChecklistSection[] = [
    {
      title: "Computer Systems",
      items: [
        {
          task: "Conduct a full system backup for all important data",
          status: false,
          remarks: "",
        },
        {
          task: "Inspect and clean power supply units for computers",
          status: false,
          remarks: "",
        },
        {
          task: "Replace worn-out peripherals (keyboards, mice, etc.)",
          status: false,
          remarks: "",
        },
        {
          task: "Verify all software licenses and renew if necessary",
          status: false,
          remarks: "",
        },
      ],
    },
    {
      title: "Electrical and Networking",
      items: [
        {
          task: "Inspect air-conditioning unit filters and clean or replace",
          status: false,
          remarks: "",
        },
        {
          task: "Ensure all routers, switches, and access points are working well",
          status: false,
          remarks: "",
        },
        {
          task: "Inspect surge protectors and replace faulty ones",
          status: false,
          remarks: "",
        },
        {
          task: "Test emergency lamps and replace batteries if needed",
          status: false,
          remarks: "",
        },
      ],
    },
    {
      title: "General Lab Maintenance",
      items: [
        {
          task: "Perform deep cleaning of floors, furniture, and all surfaces",
          status: false,
          remarks: "",
        },
        {
          task: "Inspect all doors and windows for security issues",
          status: false,
          remarks: "",
        },
        {
          task: "Conduct a full inventory check using ERMA",
          status: false,
          remarks: "",
        },
        {
          task: "Ensure all computer cables are properly arranged and secured",
          status: false,
          remarks: "",
        },
        {
          task: "Prepare a detailed report on equipment conditions and issues",
          status: false,
          remarks: "",
        },
      ],
    },
  ];

  const getChecklist = () => {
    switch (selectedType) {
      case "Daily":
        return dailyChecklist;
      case "Weekly":
        return weeklyChecklist;
      case "Monthly":
        return monthlyChecklist;
      default:
        return dailyChecklist;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Maintenance Checklist
          </h1>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <span>{selectedType} Maintenance</span>
              <ChevronDown size={16} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  {(["Daily", "Weekly", "Monthly"] as ChecklistType[]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setIsDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedType === type
                            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {type} Maintenance
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {selectedType} Preventive Maintenance Checklist
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Directions: Update the status by marking check if the task is
                performed, or if an issue is found. Add remarks if necessary.
              </p>
            </div>

            <div className="space-y-8">
              {getChecklist().map((section, sectionIndex) => (
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
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-transparent dark:text-white"
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

            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                List any additional concerns or issues found
              </label>
              <textarea
                rows={4}
                className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Enter additional concerns here..."
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCheckPage;
