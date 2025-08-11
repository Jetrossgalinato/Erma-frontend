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

interface EquipmentCategoryData {
  category: string;
  count: number;
}

export default function EquipmentCategoryChart() {
  const [data, setData] = useState<EquipmentCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const { data: categories, error } = await supabase
        .from("equipments")
        .select("category");

      if (error) {
        console.error("Error fetching equipment categories:", error);
        setLoading(false);
        return;
      }

      const categoryCount: Record<string, number> = {};
      categories.forEach((item) => {
        const cat = item.category || "Uncategorized";
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const formattedData = Object.entries(categoryCount).map(
        ([category, count]) => ({
          category,
          count,
        })
      );

      setData(formattedData);
      setLoading(false);
    };

    fetchCategoryCounts();
  }, [supabase]);

  if (loading)
    return <p className="text-gray-500 italic">Loading category chart...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight">
        Equipment by Category
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
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
            dataKey="count"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
