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

interface AvailabilityData {
  status: string;
  count: number;
}

export default function EquipmentAvailabilityChart() {
  const [data, setData] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAvailabilityCounts = async () => {
      const { data: equipment, error } = await supabase
        .from("equipments")
        .select("availability");

      if (error) {
        console.error("Error fetching equipment availability:", error);
        setLoading(false);
        return;
      }

      // Initialize all statuses so labels always appear even if 0
      const statusCount: Record<string, number> = {
        Available: 0,
        "For Disposal": 0,
        Disposed: 0,
      };

      equipment.forEach((item) => {
        const status = item.availability?.trim() as keyof typeof statusCount;
        if (status in statusCount) {
          statusCount[status] += 1;
        }
      });

      const formattedData: AvailabilityData[] = Object.entries(statusCount).map(
        ([status, count]) => ({
          status,
          count,
        })
      );

      setData(formattedData);
      setLoading(false);
    };

    fetchAvailabilityCounts();
  }, [supabase]);

  if (loading)
    return (
      <p className="text-gray-500 italic">
        Loading equipment availability chart...
      </p>
    );

  // Assign fixed colors for each status
  const statusColors: Record<string, string> = {
    Available: "#a5d6a7", // soft green
    "For Disposal": "#fff59d", // light yellow
    Disposed: "#ef9a9a", // light red
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight">
        Equipment Availability Status
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          barSize={50}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="status"
            tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
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
            itemStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={statusColors[entry.status] || "#ccc"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
