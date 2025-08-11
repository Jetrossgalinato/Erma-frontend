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
} from "recharts";

interface FacilityEquipmentData {
  facility_name: string | null;
  equipment_count: number | null;
}

// Define the expected structure from the RPC response
interface RpcFacilityEquipmentData {
  facility_name: string | null;
  equipment_count: number | null;
}

export default function EquipmentPerFacilityChart() {
  const [data, setData] = useState<FacilityEquipmentData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFacilityData = async () => {
      // Use type assertion instead of generics to avoid constraint issues
      const { data: rpcData, error } = await supabase.rpc(
        "get_equipment_per_facility"
      );

      if (error) {
        console.error("Error fetching equipment per facility:", error);
        setLoading(false);
        return;
      }

      // Type assert the response data and map with proper typing
      const typedData = rpcData as RpcFacilityEquipmentData[] | null;
      const formattedData: FacilityEquipmentData[] =
        typedData?.map((row: RpcFacilityEquipmentData) => ({
          facility_name: row.facility_name ?? "Unknown Facility",
          equipment_count: row.equipment_count ?? 0,
        })) ?? [];

      setData(formattedData);
      setLoading(false);
    };

    fetchFacilityData();
  }, [supabase]);

  if (loading) {
    return <p className="text-gray-500 italic">Loading facility chart...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight">
        Equipment Count per Facility
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={50}>
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="facility_name"
            tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
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
            itemStyle={{ color: "#FF8C00", fontWeight: 600 }}
          />
          <Bar
            dataKey="equipment_count"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
