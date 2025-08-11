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

interface EquipmentStatusData {
  status: string;
  count: number;
}

export default function EquipmentStatusChart() {
  const [data, setData] = useState<EquipmentStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStatusCounts = async () => {
      const { data: statuses, error } = await supabase
        .from("equipments")
        .select("status");

      if (error) {
        console.error("Error fetching equipment statuses:", error);
        setLoading(false);
        return;
      }

      const statusCount: Record<string, number> = {
        Working: 0,
        "In Use": 0,
        "For Repair": 0,
      };

      statuses.forEach((item) => {
        const stat =
          item.status && statusCount[item.status] !== undefined
            ? item.status
            : "Working"; // default if unknown
        statusCount[stat] = (statusCount[stat] || 0) + 1;
      });

      const formattedData = Object.entries(statusCount).map(
        ([status, count]) => ({
          status,
          count,
        })
      );

      setData(formattedData);
      setLoading(false);
    };

    fetchStatusCounts();
  }, [supabase]);

  if (loading)
    return <p className="text-gray-500 italic">Loading status chart...</p>;

  // Define colors for each status
  const statusColors: Record<string, string> = {
    Working: "#10B981", // teal green
    "In Use": "#FF8C00", // dark orange
    "For Repair": "#DC2626", // red
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight">
        Equipment Status Overview
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={50}>
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="status"
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
          <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.status}`}
                fill={statusColors[entry.status] || "#9CA3AF"} // gray fallback
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
