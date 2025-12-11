"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Monitor,
  Building,
  Package,
  FileText,
  Activity,
  Users,
  ChevronDown,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  fetchSidebarCounts,
  fetchUserRole,
  type SidebarCounts,
} from "./utils/sidebarHelpers";

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
  const pathname = usePathname();
  const active = path && pathname === path;

  const content = (
    <>
      <div className="flex items-center space-x-3">
        <Icon
          size={16}
          className={
            active
              ? "text-orange-500 dark:text-orange-400"
              : "text-gray-400 dark:text-gray-500"
          }
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== null && (
        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-orange-500 dark:text-orange-400 px-2 py-1 rounded-full min-w-[20px] text-center">
          {count}
        </span>
      )}
    </>
  );

  const className = \`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors \${
    active
      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-r-2 border-orange-500"
      : "text-gray-600 dark:text-gray-300"
  } \${isSubItem ? "pl-10" : ""}\`;

  if (path) {
    return (
      <Link href={path} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

const SidebarSectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  isExpanded,
  onToggle,
}) => (
  <div
    className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    onClick={onToggle}
  >
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
    </span>
    {isExpanded ? (
      <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
    ) : (
      <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
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

  const [counts, setCounts] = useState<SidebarCounts>({
    equipments: 0,
    facilities: 0,
    supplies: 0,
    requests: 0,
    equipment_logs: 0,
    facility_logs: 0,
    supply_logs: 0,
    users: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [approvedAccRole, setApprovedAccRole] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Fetch user role
  useEffect(() => {
    const loadUserRole = async () => {
      if (!isAuthenticated) {
        setApprovedAccRole(null);
        return;
      }

      try {
        const roleData = await fetchUserRole();
        setApprovedAccRole(roleData.approved_acc_role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setApprovedAccRole(null);
      }
    };

    loadUserRole();
  }, [isAuthenticated]);

  // Fetch all sidebar counts
  useEffect(() => {
    const loadCounts = async (isInitialLoad = false) => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // Only show loading state on initial load to prevent blinking
        if (isInitialLoad) {
          setLoading(true);
        }
        const countsData = await fetchSidebarCounts();

        // Only update state if counts have actually changed to prevent unnecessary re-renders
        setCounts((prevCounts) => {
          const hasChanged = Object.keys(countsData).some(
            (key) =>
              countsData[key as keyof SidebarCounts] !==
              prevCounts[key as keyof SidebarCounts]
          );
          return hasChanged ? countsData : prevCounts;
        });
      } catch (error) {
        console.error("Error fetching sidebar counts:", error);
        // Keep existing counts on error
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    // Initial load with loading state
    loadCounts(true);

    // Refresh counts every 2 seconds without showing loading state
    const interval = setInterval(() => loadCounts(false), 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
      count: loading ? null : counts.equipments,
      path: "/dashboard-equipment",
    },
    {
      icon: Building,
      label: "Facilities",
      count: loading ? null : counts.facilities,
      path: "/dashboard-facilities",
    },
    {
      icon: Package,
      label: "Supplies",
      count: loading ? null : counts.supplies,
      path: "/dashboard-supplies",
    },
  ];

  const requestItems: MenuItemData[] = [
    {
      icon: FileText,
      label: "Request List",
      count: loading ? null : counts.requests,
      path: "/dashboard-request",
    },
  ];

  const monitoringItems: MenuItemData[] = [
    {
      icon: Monitor,
      label: "Equipment Logs",
      count: loading ? null : counts.equipment_logs,
      path: "/monitor-equipment",
    },
    {
      icon: Building,
      label: "Facility Logs",
      count: loading ? null : counts.facility_logs,
      path: "/monitor-facilities",
    },
    {
      icon: Activity,
      label: "Supply Logs",
      count: loading ? null : counts.supply_logs,
      path: "/monitor-supplies",
    },
  ];

  const userManagementItems: MenuItemData[] = [
    {
      icon: Users,
      label: "Users",
      count: loading ? null : counts.users,
      path: "/dashboard-users",
    },
  ];

  // Staff should NOT see Requests & User Management
  const isStaff = approvedAccRole === "Staff";

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
      <div className="py-4 pt-25">
        {/* Main Menu */}
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index} {...item} />
          ))}
        </div>

        {/* Requests (hide for Staff) */}
        {!isStaff && (
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
        )}

        {/* Monitoring */}
        <div className="mt-4">
          <SidebarSectionHeader
            label="Transaction Logs"
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

        {/* User Management (hide for Staff) */}
        {!isStaff && (
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
        )}
      </div>
    </div>
  );
};

export default Sidebar;
