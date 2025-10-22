/**
 * Charts Section Component
 *
 * Displays all dashboard charts in a vertical layout
 */

import EquipmentCountPerPersonLiableChart from "@/components/EquipmentCountPerPersonLiableChart";
import EquipmentCategoryChart from "@/components/EquipmentCategoryChart";
import EquipmentStatusChart from "@/components/EquipmentStatusChart";
import EquipmentPerFacilityChart from "@/components/EquipmentPerFacilityChart";
import EquipmentAvailabilityChart from "@/components/EquipmentAvailabilityChart";

export default function ChartsSection() {
  return (
    <>
      {/* Equipment per person liable chart */}
      <div className="mb-8">
        <EquipmentCountPerPersonLiableChart />
      </div>

      {/* Equipment Categories Chart */}
      <div className="mb-8">
        <EquipmentCategoryChart />
      </div>

      {/* Equipment Status Chart */}
      <div className="mb-8">
        <EquipmentStatusChart />
      </div>

      {/* Equipment Per Facility Chart */}
      <div className="mb-8">
        <EquipmentPerFacilityChart />
      </div>

      {/* Equipment Availability Chart */}
      <div className="mb-8">
        <EquipmentAvailabilityChart />
      </div>
    </>
  );
}
