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
      <p className="text-gray-500 dark:text-gray-400 italic">
        Loading equipment availability chart...
      </p>
    );

  // Assign fixed colors for each status
  const statusColors: Record<string, string> = {
    Available: "#a5d6a7", // soft green
    "For Disposal": "#fff59d", // light yellow
    Disposed: "#ef9a9a", // light red
  };

  // Dynamic colors based on theme
  const textColor = isDarkMode ? "#e5e7eb" : "#4b5563";
  const gridColor = isDarkMode ? "#374151" : "#f0f0f0";
  const tooltipBg = isDarkMode ? "#374151" : "#ffffff";
  const tooltipBorder = isDarkMode ? "#4b5563" : "#e5e7eb";
  const tooltipTextColor = isDarkMode ? "#e5e7eb" : "#000";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 tracking-tight">
        Equipment Availability Status
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          barSize={50}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="status"
            tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
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
