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
    const fetchEquipmentCounts = async () => {
      const { data: equipment, error } = await supabase
        .from("equipments")
        .select("person_liable");

      if (error) {
        console.error("Error fetching equipment:", error);
        setLoading(false);
        return;
      }

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
        .sort((a, b) => b.count - a.count);

      setData(formattedData);
      setLoading(false);
    };

    fetchEquipmentCounts();
  }, [supabase]);

  if (loading)
    return (
      <p className="text-gray-500 dark:text-gray-400 italic">
        Loading equipment count per person chart...
      </p>
    );

  const lightOrange = "#f7a563ff"; // pastel light orange

  // Dynamic colors based on theme
  const textColor = isDarkMode ? "#e5e7eb" : "#4b5563";
  const gridColor = isDarkMode ? "#374151" : "#f0f0f0";
  const tooltipBg = isDarkMode ? "#374151" : "#ffffff";
  const tooltipBorder = isDarkMode ? "#4b5563" : "#e5e7eb";
  const tooltipTextColor = isDarkMode ? "#e5e7eb" : "#000";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 tracking-tight">
        Equipment Count per Person Liable
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
            dataKey="person"
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
            itemStyle={{ color: "#f8951c", fontWeight: 600 }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={800}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={lightOrange} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
