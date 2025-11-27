import React from "react";
import { Upload } from "lucide-react";
import Image from "next/image";
import { type Equipment, type Facility } from "../utils/helpers";

type EditModalProps = {
  isOpen: boolean;
  equipment: Equipment | null;
  facilities: Facility[];
  editImageFile: File | null;
  editImagePreview: string | null;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSave: () => void;
  onCancel: () => void;
  editImageInputRef: React.RefObject<HTMLInputElement | null>;
  onImageClick: (imageUrl: string, equipmentName: string) => void;
};

export default function EditModal({
  isOpen,
  equipment,
  facilities,
  editImageFile,
  editImagePreview,
  onChange,
  onImageUpload,
  onRemoveImage,
  onSave,
  onCancel,
  editImageInputRef,
  onImageClick,
}: EditModalProps) {
  if (!isOpen || !equipment) return null;

  const clearEditImageSelection = () => {
    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 text-black dark:text-white flex items-center justify-center p-4">
      <div
        className="fixed inset-0 backdrop-blur-sm bg-opacity-50"
        onClick={onCancel}
      ></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] z-50 flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-200 dark:border-gray-700">
            Edit Equipment: {equipment.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={equipment.name || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PO Number
              </label>
              <input
                type="text"
                name="po_number"
                value={equipment.po_number || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit Number
              </label>
              <input
                type="text"
                name="unit_number"
                value={equipment.unit_number || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                name="brand_name"
                value={equipment.brand_name || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={equipment.category || ""}
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
                value={equipment.status || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="Working">Working</option>
                <option value="In Use">In Use</option>
                <option value="For Repair">For Repair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Availability
              </label>
              <select
                name="availability"
                value={equipment.availability || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select availability</option>
                <option value="available">Available</option>
                <option value="for_disposal">For Disposal</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Acquired
              </label>
              <input
                type="date"
                name="date_acquire"
                value={equipment.date_acquire?.split("T")[0] || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={equipment.supplier || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="text"
                name="amount"
                value={equipment.amount || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Life
              </label>
              <input
                type="text"
                name="estimated_life"
                value={equipment.estimated_life || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Number
              </label>
              <input
                type="text"
                name="item_number"
                value={equipment.item_number || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Control Number
              </label>
              <input
                type="text"
                name="control_number"
                value={equipment.control_number || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="serial_number"
                value={equipment.serial_number || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Number
              </label>
              <input
                type="text"
                name="property_number"
                value={equipment.property_number || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Person Liable
              </label>
              <input
                type="text"
                name="person_liable"
                value={equipment.person_liable || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Facility
              </label>
              <select
                name="facility_id"
                value={equipment.facility_id || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select facility</option>
                {Array.isArray(facilities) &&
                  facilities.map((facility) => (
                    <option
                      key={facility.facility_id}
                      value={facility.facility_id}
                    >
                      {facility.facility_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image
              </label>
              <div className="space-y-3">
                {equipment?.image && !editImagePreview && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Current Image:
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image
                        src={equipment.image}
                        alt="Current equipment"
                        className="w-16 h-16 rounded border object-cover cursor-pointer hover:scale-105 hover:shadow-md transition-all"
                        width={64}
                        height={64}
                        onClick={() =>
                          onImageClick(equipment.image!, equipment.name)
                        }
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={onRemoveImage}
                        className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded"
                      >
                        Remove Current Image
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => editImageInputRef.current?.click()}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {equipment?.image ? "Change Image" : "Add Image"}
                    </button>
                    <input
                      type="file"
                      ref={editImageInputRef}
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={onImageUpload}
                      className="hidden"
                    />
                    {editImageFile && (
                      <button
                        type="button"
                        onClick={clearEditImageSelection}
                        className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {editImageFile && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      New image: {editImageFile.name}
                    </div>
                  )}

                  {editImagePreview && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Preview:
                      </div>
                      <Image
                        src={editImagePreview}
                        alt="Preview"
                        className="w-16 h-16 rounded border object-cover cursor-pointer hover:scale-105 hover:shadow-md transition-all"
                        width={64}
                        height={64}
                        onClick={() =>
                          onImageClick(
                            editImagePreview,
                            `${equipment.name} (Preview)`
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={equipment.description || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <input
                type="text"
                name="remarks"
                value={equipment.remarks || ""}
                onChange={onChange}
                className="w-full px-3 py-2 text-sm text-black dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
}
