import React from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { useAlert } from "@/contexts/AlertContext";
import { Equipment, Facility } from "../utils/helpers";

interface ExportFileProps {
  equipments: Equipment[];
  facilities: Facility[];
  onActionComplete: () => void;
}

export default function ExportFile({
  equipments,
  facilities,
  onActionComplete,
}: ExportFileProps) {
  const { showAlert } = useAlert();

  const handleExportClick = () => {
    if (equipments.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const headers = [
      "ID",
      "Name",
      "PO Number",
      "Unit Number",
      "Brand",
      "Category",
      "Status",
      "Availability",
      "Date Acquired",
      "Supplier",
      "Amount",
      "Estimated Life",
      "Item Number",
      "Control Number",
      "Serial Number",
      "Property Number",
      "Person Liable",
      "Facility",
      "Description",
      "Remarks",
    ];

    const csvContent = [
      headers.join(","),
      ...equipments.map((eq) => {
        const facilityName =
          facilities.find((f) => f.facility_id === eq.facility_id)
            ?.facility_name || "-";
        return [
          eq.id,
          `"${eq.name || ""}"`,
          `"${eq.po_number || ""}"`,
          `"${eq.unit_number || ""}"`,
          `"${eq.brand_name || ""}"`,
          `"${eq.category || ""}"`,
          `"${eq.status || ""}"`,
          `"${eq.availability || ""}"`,
          `"${eq.date_acquire || ""}"`,
          `"${eq.supplier || ""}"`,
          `"${eq.amount || ""}"`,
          `"${eq.estimated_life || ""}"`,
          `"${eq.item_number || ""}"`,
          `"${eq.control_number || ""}"`,
          `"${eq.serial_number || ""}"`,
          `"${eq.property_number || ""}"`,
          `"${eq.person_liable || ""}"`,
          `"${facilityName}"`,
          `"${eq.description || ""}"`,
          `"${eq.remarks || ""}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `equipments_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onActionComplete();
    showAlert({
      type: "success",
      message: "Data exported successfully!",
    });
  };

  const handleExportExcelClick = () => {
    if (equipments.length === 0) {
      showAlert({
        type: "info",
        message: "No data to export.",
      });
      return;
    }

    const data = equipments.map((eq) => {
      const facilityName =
        facilities.find((f) => f.facility_id === eq.facility_id)
          ?.facility_name || "-";
      return {
        ID: eq.id,
        Name: eq.name,
        "PO Number": eq.po_number,
        "Unit Number": eq.unit_number,
        Brand: eq.brand_name,
        Category: eq.category,
        Status: eq.status,
        Availability: eq.availability,
        "Date Acquired": eq.date_acquire,
        Supplier: eq.supplier,
        Amount: eq.amount,
        "Estimated Life": eq.estimated_life,
        "Item Number": eq.item_number,
        "Control Number": eq.control_number,
        "Serial Number": eq.serial_number,
        "Property Number": eq.property_number,
        "Person Liable": eq.person_liable,
        Facility: facilityName,
        Description: eq.description,
        Remarks: eq.remarks,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipments");

    // Auto-adjust column width
    const wscols = [
      { wch: 5 }, // ID
      { wch: 20 }, // Name
      { wch: 15 }, // PO Number
      { wch: 15 }, // Unit Number
      { wch: 15 }, // Brand
      { wch: 15 }, // Category
      { wch: 10 }, // Status
      { wch: 15 }, // Availability
      { wch: 15 }, // Date Acquired
      { wch: 15 }, // Supplier
      { wch: 10 }, // Amount
      { wch: 15 }, // Est. Life
      { wch: 15 }, // Item Number
      { wch: 15 }, // Control Number
      { wch: 15 }, // Serial Number
      { wch: 15 }, // Property Number
      { wch: 20 }, // Person Liable
      { wch: 20 }, // Facility
      { wch: 30 }, // Description
      { wch: 20 }, // Remarks
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(
      workbook,
      `equipments_export_${new Date().toISOString().split("T")[0]}.xlsx`,
    );

    onActionComplete();
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
}
