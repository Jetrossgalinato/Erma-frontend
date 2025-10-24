import React from "react";
import { Equipment } from "../utils/helpers";

interface EquipmentDetailsModalProps {
  isOpen: boolean;
  equipment: Equipment | null;
  onClose: () => void;
}

export default function EquipmentDetailsModal({
  isOpen,
  equipment,
  onClose,
}: EquipmentDetailsModalProps) {
  if (!isOpen || !equipment) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-xs sm:max-w-xl p-3 sm:p-6 relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>
        <h2 className="text-lg sm:text-2xl text-gray-800 font-semibold mb-2 sm:mb-4">
          {equipment.name}
        </h2>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
          <p>
            <strong>PO Number:</strong> {equipment.po_number || "N/A"}
          </p>
          <p>
            <strong>Unit Number:</strong> {equipment.unit_number || "N/A"}
          </p>
          <p>
            <strong>Brand Name:</strong> {equipment.brand_name || "N/A"}
          </p>
          <p>
            <strong>Description:</strong> {equipment.description || "N/A"}
          </p>
          <p>
            <strong>Supplier:</strong> {equipment.supplier || "N/A"}
          </p>
          <p>
            <strong>Amount:</strong> {equipment.amount || "N/A"}
          </p>
          <p>
            <strong>Estimated Life:</strong> {equipment.estimated_life || "N/A"}
          </p>
          <p>
            <strong>Item Number:</strong> {equipment.item_number || "N/A"}
          </p>
          <p>
            <strong>Property Number:</strong>{" "}
            {equipment.property_number || "N/A"}
          </p>
          <p>
            <strong>Control Number:</strong> {equipment.control_number || "N/A"}
          </p>
          <p>
            <strong>Facility:</strong>{" "}
            {equipment.facility_name || equipment.facility || "N/A"}
          </p>
          <p>
            <strong>Person Liable:</strong> {equipment.person_liable || "N/A"}
          </p>
          <p>
            <strong>Remarks:</strong> {equipment.remarks || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
