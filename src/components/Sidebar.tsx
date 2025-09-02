"use client"; // Needed if this is in /app directory

import React, { useState, useEffect } from "react";
import {
  Home,
  Monitor,
  Building,
  Package,
  FileText,
  Activity,
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type SectionKey =
  | "requests"
  | "supplies"
  | "monitoring"
  | "userManagement"
  | "filamentShield";

interface MenuItemData {
  icon: LucideIcon;
  label: string;
  count: number | null;
  path?: string;
}

interface MenuItemProps extends MenuItemData {
  isSubItem?: boolean;
}

interface SectionHeaderProps {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const SidebarMenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  count,
  isSubItem = false,
  path,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const active = path && pathname === path;

  return (
    <div
      onClick={() => path && router.push(path)}
      className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
        active
          ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500"
          : "text-gray-600"
      } ${isSubItem ? "pl-10" : ""}`}
    >
      <div className="flex items-center space-x-3">
        <Icon
          size={16}
          className={active ? "text-orange-500" : "text-gray-400"}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== null && (
        <span className="text-xs bg-gray-200 text-orange-500 px-2 py-1 rounded-full min-w-[20px] text-center">
          {count}
        </span>
      )}
    </div>
  );
};

const SidebarSectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  isExpanded,
  onToggle,
}) => (
  <div
    className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
    onClick={onToggle}
  >
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </span>
    {isExpanded ? (
      <ChevronDown size={14} className="text-gray-400" />
    ) : (
      <ChevronRight size={14} className="text-gray-400" />
    )}
  </div>
);

const Sidebar: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    requests: true,
    supplies: true,
    monitoring: true,
    userManagement: true,
    filamentShield: true,
  });

  const [equipmentCount, setEquipmentCount] = useState<number>(0);
  const [facilityCount, setFacilityCount] = useState<number>(0);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClientComponentClient();
  const [supplyCount, setSupplyCount] = useState<number>(0);
  const [equipmentLogsCount, setEquipmentLogsCount] = useState<number>(0);
  const [facilityLogsCount, setFacilityLogsCount] = useState<number>(0);

  // Fetch equipment count from Supabase
  useEffect(() => {
    const fetchEquipmentCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from("equipments")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching equipment count:", error);
          setEquipmentCount(0);
        } else {
          setEquipmentCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching equipment count:", error);
        setEquipmentCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentCount();

    // Optional: Set up real-time subscription to update count when equipment is added/removed
    const subscription = supabase
      .channel("equipments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "equipments",
        },
        () => {
          fetchEquipmentCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch facility count from Supabase
  useEffect(() => {
    const fetchFacilityCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from("facilities")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching facility count:", error);
          setFacilityCount(0);
        } else {
          setFacilityCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching facility count:", error);
        setFacilityCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityCount();

    // Optional: Set up real-time subscription to update count when facility is added/removed
    const subscription = supabase
      .channel("facilities_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "facilities",
        },
        () => {
          fetchFacilityCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const tables = ["borrowing", "booking", "acquiring"];
        let total = 0;

        for (const table of tables) {
          const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });

          if (!error) total += count || 0;
        }

        setRequestCount(total);
      } catch (error) {
        console.error("Error fetching request count:", error);
        setRequestCount(0);
      }
    };

    fetchRequestCount();

    // Optional: real-time update if any table changes
    const channels = ["borrowing", "booking", "acquiring"].map((table) =>
      supabase
        .channel(`${table}_changes`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => {
          fetchRequestCount();
        })
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => ch.unsubscribe());
    };
  }, [supabase]);

  // Fetch supply count from Supabase
  useEffect(() => {
    const fetchSupplyCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from("supplies")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching supply count:", error);
          setSupplyCount(0);
        } else {
          setSupplyCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching supply count:", error);
        setSupplyCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplyCount();

    // Optional: Set up real-time subscription to update count when supply is added/removed
    const subscription = supabase
      .channel("supplies_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supplies",
        },
        () => {
          fetchSupplyCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch equipment logs count from Supabase
  useEffect(() => {
    const fetchEquipmentLogsCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from("equipment_logs")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching equipment logs count:", error);
          setEquipmentLogsCount(0);
        } else {
          setEquipmentLogsCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching equipment logs count:", error);
        setEquipmentLogsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentLogsCount();

    // Optional: Set up real-time subscription to update count when equipment logs are added/removed
    const subscription = supabase
      .channel("equipment_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "equipment_logs",
        },
        () => {
          fetchEquipmentLogsCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch facility logs count from Supabase
  useEffect(() => {
    const fetchFacilityLogsCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from("facility_logs")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching facility logs count:", error);
          setFacilityLogsCount(0);
        } else {
          setFacilityLogsCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching facility logs count:", error);
        setFacilityLogsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilityLogsCount();

    // Optional: Set up real-time subscription to update count when facility logs are added/removed
    const subscription = supabase
      .channel("facility_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "facility_logs",
        },
        () => {
          fetchFacilityLogsCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuItems: MenuItemData[] = [
    { icon: Home, label: "Dashboard", count: null, path: "/dashboard" },
    {
      icon: Monitor,
      label: "Equipments",
      count: loading ? null : equipmentCount,
      path: "/dashboard-equipment",
    },
    {
      icon: Building,
      label: "Facilities",
      count: loading ? null : facilityCount,
      path: "/dashboard-facilities",
    },
    {
      icon: Package,
      label: "Supplies",
      count: loading ? null : supplyCount,
      path: "/dashboard-supplies",
    },
  ];

  const requestItems: MenuItemData[] = [
    {
      icon: FileText,
      label: "Request List",
      count: loading ? null : requestCount,
      path: "/dashboard-request",
    },
  ];

  const monitoringItems: MenuItemData[] = [
    {
      icon: Monitor,
      label: "Equipment Monitoring",
      count: loading ? null : equipmentLogsCount,
      path: "/monitor-equipment",
    },
    {
      icon: Building,
      label: "Facility Monitoring",
      count: loading ? null : facilityLogsCount,
      path: "/monitor-facilities",
    },
    {
      icon: Activity,
      label: "Stock Monitoring",
      count: 0,
      path: "/monitoring/stock",
    },
  ];

  const userManagementItems: MenuItemData[] = [
    { icon: Users, label: "Users", count: 1, path: "/users" },
  ];

  const filamentShieldItems: MenuItemData[] = [
    { icon: Shield, label: "Roles", count: 4, path: "/roles" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="py-4 pt-25">
        {/* Main Menu */}
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index} {...item} />
          ))}
        </div>

        {/* Requests */}
        <div className="mt-6">
          <SidebarSectionHeader
            label="Requests"
            isExpanded={expandedSections.requests}
            onToggle={() => toggleSection("requests")}
          />
          {expandedSections.requests && (
            <div className="space-y-1">
              {requestItems.map((item, index) => (
                <SidebarMenuItem key={index} {...item} isSubItem />
              ))}
            </div>
          )}
        </div>

        {/* Monitoring */}
        <div className="mt-4">
          <SidebarSectionHeader
            label="Monitoring History"
            isExpanded={expandedSections.monitoring}
            onToggle={() => toggleSection("monitoring")}
          />
          {expandedSections.monitoring && (
            <div className="space-y-1">
              {monitoringItems.map((item, index) => (
                <SidebarMenuItem key={index} {...item} isSubItem />
              ))}
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="mt-4">
          <SidebarSectionHeader
            label="User Management"
            isExpanded={expandedSections.userManagement}
            onToggle={() => toggleSection("userManagement")}
          />
          {expandedSections.userManagement && (
            <div className="space-y-1">
              {userManagementItems.map((item, index) => (
                <SidebarMenuItem key={index} {...item} isSubItem />
              ))}
            </div>
          )}
        </div>

        {/* Filament Shield */}
        <div className="mt-4">
          <SidebarSectionHeader
            label="Filament Shield"
            isExpanded={expandedSections.filamentShield}
            onToggle={() => toggleSection("filamentShield")}
          />
          {expandedSections.filamentShield && (
            <div className="space-y-1">
              {filamentShieldItems.map((item, index) => (
                <SidebarMenuItem key={index} {...item} isSubItem />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
