import React from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { Supply, Facility, getStockStatus } from "../utils/helpers";
import { useAlert } from "@/contexts/AlertContext";

interface ExportFileProps {
  supplies: Supply[];
  facilities: Facility[];
  onExportComplete?: () => void;
}

const ExportFile: React.FC<ExportFileProps> = ({ 
  supplies,
  facilities,
  onExportComplete,
}) => {
  const { showAlert } = useAlert();

  const handleExportClick = () => {
    if (supplies.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Description",
      "Category",
      "Quantity",
      "Stock Unit",
      "Stocking Point",
      "Status",
      "Facility",
      "Remarks",
    ];

    const csvContent = [
      headers.join(","),
      ...supplies.map((supply) => {
        const facilityName =
          supply.facilities?.facility_name ||
          supply.facilities?.name ||
          facilities.find((f) => f.facility_id === supply.facility_id)
            ?.facility_name ||
          "-";
        const status = getStockStatus(
          supply.quantity,
          supply.stocking_point,
        ).status;
        return [
          supply.id,
          `"${supply.name || ""}"`,
          `"${supply.description || ""}"`,
          `"${supply.category || ""}"`,
          `"${supply.quantity || ""}"`,
          `"${supply.stock_unit || ""}"`,
          `"${supply.stocking_point || ""}"`,
          `"${status}"`,
          `"${facilityName}"`,
          `"${supply.remarks || ""}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `supplies_export_${new Date().toISOString().split("T")[0]}.csv`,
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
    if (supplies.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const data = supplies.map((supply) => {
      const facilityName =
        supply.facilities?.facility_name ||
        supply.facilities?.name ||
        facilities.find((f) => f.facility_id === supply.facility_id)
          ?.facility_name ||
        "-";
      const status = getStockStatus(
        supply.quantity,
        supply.stocking_point,
      ).status;
      return {
        ID: supply.id,
        Name: supply.name,
        Description: supply.description,
        Category: supply.category,
        Quantity: supply.quantity,
        "Stock Unit": supply.stock_unit,
        "Stocking Point": supply.stocking_point,
        Status: status,
        Facility: facilityName,
        Remarks: supply.remarks,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplies");

    // Auto-adjust column width
    const wscols = [
      { wch: 5 }, // ID
      { wch: 20 }, // Name
      { wch: 30 }, // Description
      { wch: 15 }, // Category
      { wch: 10 }, // Quantity
      { wch: 15 }, // Stock Unit
      { wch: 15 }, // Stocking Point
      { wch: 15 }, // Status
      { wch: 20 }, // Facility
      { wch: 20 }, // Remarks
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(
      workbook,
      `supplies_export_${new Date().toISOString().split("T")[0]}.xlsx`,
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
