/**
 * EditModal Component
 *
 * Modal for editing an existing facility
 */

import React from "react";
import { Facility } from "../utils/helpers";

interface EditModalProps {
  facility: Facility;
  onSave: () => void;
  onCancel: () => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  facility,
  onSave,
  onCancel,
  onChange,
}) => {
  return (
    <div className="fixed inset-0 z-50 text-black dark:text-white flex items-center justify-center p-4">
      <div
        className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
        onClick={onCancel}
      ></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-2xl w-full z-50">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Edit Facility: {facility.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={facility.name || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Facility Type
              </label>
              <input
                type="text"
                name="facility_type"
                value={facility.facility_type || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Floor Level
              </label>
              <input
                type="text"
                name="floor_level"
                value={facility.floor_level || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={facility.status || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                rows={3}
                value={facility.remarks || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes or remarks..."
              />
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-center gap-3 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 dark:bg-blue-700 text-base font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            onClick={onSave}
          >
            Save Changes
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
