import React from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { useAlert } from "@/contexts/AlertContext";
import { Facility } from "../utils/helpers";

interface ExportFileProps {
  facilities: Facility[];
  onExportComplete?: () => void;
}

const ExportFile: React.FC<ExportFileProps> = ({ 
  facilities,
  onExportComplete,
}) => {
  const { showAlert } = useAlert();

  const handleExportClick = () => {
    if (facilities.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Type",
      "Floor Level",
      "Capacity",
      "Cooling Tools",
      "Connection Type",
      "Building",
      "Status",
      "Remarks",
    ];

    const csvContent = [
      headers.join(","),
      ...facilities.map((facility) =>
        [
          facility.facility_id,
          `"${facility.facility_name || ""}"`,
          `"${facility.facility_type || ""}"`,
          `"${facility.floor_level || ""}"`,
          `"${facility.capacity || ""}"`,
          `"${facility.cooling_tools || ""}"`,
          `"${facility.connection_type || ""}"`,
          `"${facility.building || ""}"`,
          `"${facility.status || ""}"`,
          `"${facility.remarks || ""}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `facilities_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onExportComplete) onExportComplete();
    showAlert({
      type: "success",
      message: "Data exported successfully!",
    });
  };

  const handleExportExcelClick = () => {
    if (facilities.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const data = facilities.map((facility) => ({
      ID: facility.facility_id,
      Name: facility.facility_name,
      Type: facility.facility_type,
      "Floor Level": facility.floor_level,
      Capacity: facility.capacity,
      "Cooling Tools": facility.cooling_tools,
      "Connection Type": facility.connection_type,
      Building: facility.building,
      Status: facility.status,
      Remarks: facility.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facilities");

    // Auto-adjust column width
    const wscols = [
      { wch: 5 }, // ID
      { wch: 20 }, // Name
      { wch: 15 }, // Type
      { wch: 15 }, // Floor Level
      { wch: 10 }, // Capacity
      { wch: 15 }, // Cooling Tools
      { wch: 15 }, // Connection Type
      { wch: 15 }, // Building
      { wch: 10 }, // Status
      { wch: 20 }, // Remarks
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(
      workbook,
      `facilities_export_${new Date().toISOString().split("T")[0]}.xlsx`,
    );

    if (onExportComplete) onExportComplete();
    showAlert({
      type: "success",
      message: "Data exported to Excel successfully!",
    });
  };

  return (
    <>
      <button
        onClick={handleExportClick}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <Upload className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
        Export Data to CSV File
      </button>
      <button
        onClick={handleExportExcelClick}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <Upload className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
        Export Data to Excel File
      </button>
    </>
  );
};

export default ExportFile;
