import React from "react";
import { Facility } from "../../facilities/utils/helpers";

interface DailyLaboratorySelectProps {
  laboratory: string;
  setLaboratory: (value: string) => void;
  facilities: Facility[];
}

const DailyLaboratorySelect: React.FC<DailyLaboratorySelectProps> = ({
  laboratory,
  setLaboratory,
  facilities,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Assigned Laboratory
      </label>
      <select
        required
        value={laboratory}
        onChange={(e) => setLaboratory(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white"
      >
        <option value="" disabled>
          Select Laboratory
        </option>
        {facilities.map((facility) => (
          <option key={facility.facility_id} value={facility.facility_name}>
            {facility.facility_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DailyLaboratorySelect;
