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

interface PersonEquipmentData {
  person: string;
  count: number;
}

export default function EquipmentCountPerPersonLiableChart() {
  const [data, setData] = useState<PersonEquipmentData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEquipmentCounts = async () => {
      const { data: equipment, error } = await supabase
        .from("equipments")
        .select("person_liable");

      if (error) {
        console.error("Error fetching equipment:", error);
        setLoading(false);
        return;
      }

      // Count occurrences of each person liable
      const personCount: Record<string, number> = {};
      equipment.forEach((item) => {
        const person = item.person_liable?.trim() || "Unassigned";
        personCount[person] = (personCount[person] || 0) + 1;
      });

      const formattedData: PersonEquipmentData[] = Object.entries(personCount)
        .map(([person, count]) => ({
          person,
          count,
        }))
        .sort((a, b) => b.count - a.count); // Optional: sort by count

      setData(formattedData);
      setLoading(false);
    };

    fetchEquipmentCounts();
  }, [supabase]);

  if (loading)
    return (
      <p className="text-gray-500 italic">
        Loading equipment count per person chart...
      </p>
    );

  // For dynamic bar shading
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const getBarColor = (count: number) => {
    const intensity = count / maxCount; // 0 → light, 1 → dark
    const r = Math.round(247 - (247 - 241) * intensity);
    const g = Math.round(177 - (177 - 133) * intensity);
    const b = Math.round(25 - (25 - 0) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight">
        Equipment Count per Person Liable
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
            dataKey="person"
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
