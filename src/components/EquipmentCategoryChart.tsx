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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const supabase = createClientComponentClient();

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Initial check
    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
    return (
      <p className="text-gray-500 dark:text-gray-400 italic">
        Loading category chart...
      </p>
    );

  // Dynamic colors based on theme
  const textColor = isDarkMode ? "#e5e7eb" : "#4b5563";
  const gridColor = isDarkMode ? "#374151" : "#f0f0f0";
  const tooltipBg = isDarkMode ? "#374151" : "#ffffff";
  const tooltipBorder = isDarkMode ? "#4b5563" : "#e5e7eb";
  const tooltipTextColor = isDarkMode ? "#e5e7eb" : "#000";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 tracking-tight">
        Equipment by Category
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "8px",
              padding: "8px 12px",
              color: tooltipTextColor,
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
