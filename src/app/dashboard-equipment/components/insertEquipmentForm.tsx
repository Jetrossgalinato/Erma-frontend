import React from "react";
import { X } from "lucide-react";
import { type Equipment, type Facility } from "../utils/helpers";

type InsertEquipmentFormProps = {
  isOpen: boolean;
  newEquipment: Partial<Equipment>;
  facilities: Facility[];
  selectedImageFile: File | null;
  imagePreview: string | null;
  onChange: (
    field: keyof Equipment,
    value: string | number | undefined
  ) => void;
  onImageSelect: () => void;
  onImageClear: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function InsertEquipmentForm({
  isOpen,
  newEquipment,
  facilities,
  selectedImageFile,
  imagePreview,
  onChange,
  onImageSelect,
  onImageClear,
  onSave,
  onCancel,
}: InsertEquipmentFormProps) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Add new row to equipments
          </h4>
          <button
            onClick={onCancel}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newEquipment.name || ""}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Equipment name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              PO Number
            </label>
            <input
              type="text"
              value={newEquipment.po_number || ""}
              onChange={(e) => onChange("po_number", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="PO Number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit Number
            </label>
            <input
              type="text"
              value={newEquipment.unit_number || ""}
              onChange={(e) => onChange("unit_number", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Unit Number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brand Name
            </label>
            <input
              type="text"
              value={newEquipment.brand_name || ""}
              onChange={(e) => onChange("brand_name", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Brand Name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={newEquipment.category || ""}
              onChange={(e) => onChange("category", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Category"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={newEquipment.status || ""}
              onChange={(e) => onChange("status", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select status</option>
              <option value="Working">Working</option>
              <option value="In Use">In Use</option>
              <option value="For Repair">For Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Availability
            </label>
            <select
              value={newEquipment.availability || ""}
              onChange={(e) => onChange("availability", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select availability</option>
              <option value="Available">Available</option>
              <option value="For Disposal">For Disposal</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Acquired
            </label>
            <input
              type="date"
              value={newEquipment.date_acquire || ""}
              onChange={(e) => onChange("date_acquire", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supplier
            </label>
            <input
              type="text"
              value={newEquipment.supplier || ""}
              onChange={(e) => onChange("supplier", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Supplier"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="text"
              value={newEquipment.amount || ""}
              onChange={(e) => onChange("amount", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Amount"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Life
            </label>
            <input
              type="text"
              value={newEquipment.estimated_life || ""}
              onChange={(e) => onChange("estimated_life", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Estimated Life"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Number
            </label>
            <input
              type="text"
              value={newEquipment.item_number || ""}
              onChange={(e) => onChange("item_number", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Item Number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Control Number
            </label>
            <input
              type="text"
              value={newEquipment.control_number || ""}
              onChange={(e) => onChange("control_number", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Control Number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              value={newEquipment.serial_number || ""}
              onChange={(e) => onChange("serial_number", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Serial Number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Number
            </label>
            <input
              type="text"
              value={newEquipment.property_number || ""}
              onChange={(e) => onChange("property_number", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Property Number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Person Liable
            </label>
            <input
              type="text"
              value={newEquipment.person_liable || ""}
              onChange={(e) => onChange("person_liable", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Person Liable"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Facility
            </label>
            <select
              value={newEquipment.facility_id || ""}
              onChange={(e) =>
                onChange(
                  "facility_id",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select facility</option>
              {facilities.map((facility) => (
                <option key={facility.facility_id} value={facility.facility_id}>
                  {facility.facility_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onImageSelect}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Choose Image
                </button>
                {selectedImageFile && (
                  <button
                    type="button"
                    onClick={onImageClear}
                    className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              {selectedImageFile && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Selected: {selectedImageFile.name}
                </div>
              )}

              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded border object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newEquipment.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Description"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remarks
            </label>
            <textarea
              value={newEquipment.remarks || ""}
              onChange={(e) => onChange("remarks", e.target.value)}
              className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Remarks"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
