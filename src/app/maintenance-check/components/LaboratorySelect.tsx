import React from "react";
import { Facility } from "../../facilities/utils/helpers";

interface LaboratorySelectProps {
  laboratory: string;
  setLaboratory: (value: string) => void;
  facilities: Facility[];
}

const LaboratorySelect: React.FC<LaboratorySelectProps> = ({
  laboratory,
  setLaboratory,
  facilities,
}) => {
  return (
    <div className="w-1/3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Laboratory Name
      </label>
      <select
        value={laboratory}
        onChange={(e) => setLaboratory(e.target.value)}
        className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-transparent dark:text-white px-3 py-2 border"
      >
        <option value="" disabled className="text-gray-500">
          Select Laboratory
        </option>
        {facilities.map((facility) => (
          <option
            key={facility.facility_id}
            value={facility.facility_name}
            className="text-gray-900 dark:text-gray-900"
          >
            {facility.facility_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LaboratorySelect;
