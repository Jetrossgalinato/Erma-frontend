import React, { useState } from "react";
import {
  Home,
  Monitor,
  Building,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  Activity,
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

// Types
type SectionKey =
  | "borrowing"
  | "supplies"
  | "monitoring"
  | "userManagement"
  | "filamentShield";

interface MenuItemData {
  icon: LucideIcon;
  label: string;
  count: number | null;
  active?: boolean;
}

interface MenuItemProps extends MenuItemData {
  isSubItem?: boolean;
}

interface SectionHeaderProps {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
}

// Components
const SidebarMenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  count,
  active = false,
  isSubItem = false,
}) => (
  <div
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
      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full min-w-[20px] text-center">
        {count}
      </span>
    )}
  </div>
);

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

// Main Component
const Sidebar: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    borrowing: true,
    supplies: true,
    monitoring: true,
    userManagement: true,
    filamentShield: true,
  });

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuItems: MenuItemData[] = [
    { icon: Home, label: "Dashboard", count: null, active: true },
    { icon: Monitor, label: "Equipment", count: 0 },
    { icon: Building, label: "Facilities", count: 0 },
  ];

  const borrowingItems: MenuItemData[] = [
    { icon: FileText, label: "Request List", count: 0 },
    { icon: ShoppingCart, label: "Borrowed Items", count: 0 },
  ];

  const suppliesItems: MenuItemData[] = [
    { icon: Package, label: "Supplies And Materials", count: 0 },
    { icon: Truck, label: "Supplies Cart", count: 0 },
  ];

  const monitoringItems: MenuItemData[] = [
    { icon: Monitor, label: "Equipment Monitoring", count: 0 },
    { icon: Building, label: "Facility Monitoring", count: 0 },
    { icon: Activity, label: "Stock Monitoring", count: 0 },
  ];

  const userManagementItems: MenuItemData[] = [
    { icon: Users, label: "Users", count: 1 },
  ];

  const filamentShieldItems: MenuItemData[] = [
    { icon: Shield, label: "Roles", count: 4 },
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

        {/* Borrowing */}
        <div className="mt-6">
          <SidebarSectionHeader
            label="Borrowing"
            isExpanded={expandedSections.borrowing}
            onToggle={() => toggleSection("borrowing")}
          />
          {expandedSections.borrowing && (
            <div className="space-y-1">
              {borrowingItems.map((item, index) => (
                <SidebarMenuItem key={index} {...item} isSubItem />
              ))}
            </div>
          )}
        </div>

        {/* Supplies */}
        <div className="mt-4">
          <SidebarSectionHeader
            label="Supplies And Materials"
            isExpanded={expandedSections.supplies}
            onToggle={() => toggleSection("supplies")}
          />
          {expandedSections.supplies && (
            <div className="space-y-1">
              {suppliesItems.map((item, index) => (
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
