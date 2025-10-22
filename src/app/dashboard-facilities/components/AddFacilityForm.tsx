/**
 * AddFacilityForm Component
 *
 * Form for adding a new facility
 */

import React from "react";
import { X } from "lucide-react";
import { FacilityFormData } from "../utils/helpers";

interface AddFacilityFormProps {
  facility: Partial<FacilityFormData>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AddFacilityForm: React.FC<AddFacilityFormProps> = ({
  facility,
  onChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Add New Facility
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Facility Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="facility_name"
            value={facility.facility_name || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter facility name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Connection Type
          </label>
          <input
            type="text"
            name="connection_type"
            value={facility.connection_type || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Wi-Fi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Facility Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="facility_type"
            value={facility.facility_type || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Computer Laboratory"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Floor Level <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="floor_level"
            value={facility.floor_level || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., 1st Floor"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Capacity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="capacity"
            value={facility.capacity || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter capacity"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cooling Tools
          </label>
          <input
            type="text"
            name="cooling_tools"
            value={facility.cooling_tools || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Aircon"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Building
          </label>
          <input
            type="text"
            name="building"
            value={facility.building || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., HIRAYA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={facility.status || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Status</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Remarks
          </label>
          <textarea
            name="remarks"
            rows={2}
            value={facility.remarks || ""}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Additional notes or remarks..."
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Add Facility
        </button>
      </div>
    </div>
  );
};

export default AddFacilityForm;
