"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FacilityEquipmentData {
  facility: string;
  count: number;
}

export default function EquipmentCountPerFacilityChart() {
  const [data, setData] = useState<FacilityEquipmentData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEquipmentCounts = async () => {
      const { data: facilities, error: facilitiesError } = await supabase
        .from("facilities")
        .select("id, name");

      if (facilitiesError) {
        console.error("Error fetching facilities:", facilitiesError);
        setLoading(false);
        return;
      }

      const { data: equipment, error: equipmentError } = await supabase
        .from("equipments")
        .select("facility_id");

      if (equipmentError) {
        console.error("Error fetching equipment:", equipmentError);
        setLoading(false);
        return;
      }

      const equipmentCount: Record<number, number> = {};
      equipment.forEach((item) => {
        equipmentCount[item.facility_id] =
          (equipmentCount[item.facility_id] || 0) + 1;
      });

      const formattedData: FacilityEquipmentData[] = facilities.map((fac) => ({
        facility: fac.name.trim() || "Unnamed Facility",
        count: equipmentCount[fac.id] || 0,
      }));

      setData(formattedData);
      setLoading(false);
    };

    fetchEquipmentCounts();
  }, [supabase]);

  if (loading)
    return (
      <p className="text-gray-500 dark:text-gray-400 italic">
        Loading equipment count chart...
      </p>
    );

  const maxCount = Math.max(...data.map((d) => d.count), 1); // avoid divide by zero

  // Function to create a darker orange based on percentage
  const getBarColor = (count: number) => {
    const intensity = count / maxCount; // 0 to 1
    // Base orange: #fdcb5fff → Darker: #f18500
    const r = Math.round(247 - (247 - 241) * intensity); // R: 247 → 241
    const g = Math.round(177 - (177 - 133) * intensity); // G: 177 → 133
    const b = Math.round(25 - (25 - 0) * intensity); // B: 25 → 0
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 tracking-tight">
        Equipment Count per Facility
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          barSize={Math.max(20, Math.min(40, 300 / data.length))}
          margin={{ left: -120, right: 20, top: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="facility"
            tick={{ fill: "#4b5563", fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={220}
            interval={0}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 20)}...` : value
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#000",
              fontSize: "13px",
            }}
            itemStyle={{ color: "#f18500ff", fontWeight: 600 }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
