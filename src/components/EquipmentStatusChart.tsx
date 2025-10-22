"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchEquipmentByStatus } from "@/app/dashboard/utils/helpers";
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
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<EquipmentStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    const loadStatusData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const statusData = await fetchEquipmentByStatus();
        setData(statusData);
      } catch (err) {
        console.error("Error fetching equipment statuses:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load status data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatusData();
  }, [isAuthenticated]);

  if (loading)
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 italic">
          Loading status chart...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
      </div>
    );

  // Define colors for each status
  const statusColors: Record<string, string> = {
    Working: "#10B981", // teal green
    "In Use": "#FF8C00", // dark orange
    "For Repair": "#DC2626", // red
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
        Equipment Status Overview
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={50}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="status"
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
