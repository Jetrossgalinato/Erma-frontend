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

      // Count per category
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
    return <p className="text-gray-500">Loading category chart...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg text-gray-800 font-bold mb-4">
        Equipment by Category
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
