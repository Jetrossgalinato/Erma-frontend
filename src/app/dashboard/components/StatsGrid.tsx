/**
 * Stats Grid Component
 *
 * Displays the main statistics cards in a grid layout
 */

import { DashboardStats } from "../utils/helpers";
import {
  Users,
  Clock,
  Monitor,
  Building,
  Package,
  TrendingUp,
  Calendar,
  Grid3X3,
} from "lucide-react";
import { StatCardsGrid } from "@/components/StatCards";

interface StatsGridProps {
  stats: DashboardStats | null;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const statsArray = [
    {
      title: "Total Users",
      value: stats?.total_users ?? null,
      bgColor: "bg-purple-500",
      icon: Users,
    },
    {
      title: "Pending Requests",
      value: stats?.pending_requests ?? null,
      bgColor: "bg-yellow-500",
      icon: Clock,
    },
    {
      title: "Total Equipments",
      value: stats?.total_equipment ?? null,
      bgColor: "bg-blue-500",
      icon: Monitor,
    },
    {
      title: "Active Facilities",
      value: stats?.active_facilities ?? null,
      bgColor: "bg-green-500",
      icon: Building,
    },
    {
      title: "Total Supplies",
      value: stats?.total_supplies ?? null,
      bgColor: "bg-indigo-500",
      icon: Package,
    },
    {
      title: "Borrowed (Last 7 Days)",
      value: stats?.borrowed_last_7_days ?? null,
      bgColor: "bg-orange-500",
      icon: TrendingUp,
    },
    {
      title: "Borrowed Today",
      value: stats?.borrowed_today ?? null,
      bgColor: "bg-red-500",
      icon: Calendar,
    },
    {
      title: "Equipment Categories",
      value: stats?.total_equipment_categories ?? null,
      bgColor: "bg-teal-500",
      icon: Grid3X3,
    },
  ];

  return <StatCardsGrid stats={statsArray} />;
}
