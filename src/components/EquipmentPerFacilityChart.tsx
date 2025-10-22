"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchEquipmentPerFacility } from "@/app/dashboard/utils/helpers";
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
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<FacilityEquipmentData[]>([]);
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
    const loadFacilityData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const facilityData = await fetchEquipmentPerFacility();

        const formattedData: FacilityEquipmentData[] = facilityData.map(
          (item) => ({
            facility: item.facility_name || "Unnamed Facility",
            count: item.equipment_count,
          })
        );

        setData(formattedData);
      } catch (err) {
        console.error("Error fetching equipment per facility:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load facility data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFacilityData();
  }, [isAuthenticated]);

  if (loading)
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 italic">
          Loading facility chart...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
      </div>
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

  // Dynamic colors based on theme
  const textColor = isDarkMode ? "#e5e7eb" : "#4b5563";
  const gridColor = isDarkMode ? "#374151" : "#f0f0f0";
  const tooltipBg = isDarkMode ? "#374151" : "#ffffff";
  const tooltipBorder = isDarkMode ? "#4b5563" : "#e5e7eb";
  const tooltipTextColor = isDarkMode ? "#e5e7eb" : "#000";

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
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="facility"
            tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
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
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "8px",
              padding: "8px 12px",
              color: tooltipTextColor,
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
