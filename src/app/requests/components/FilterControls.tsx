import { Search, ChevronDown } from "lucide-react";

interface FilterControlsProps {
  searchTerm: string;
  selectedStatus: string;
  selectedDepartment: string;
  selectedRole: string;
  selectedRequestedAt: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onRequestedAtChange: (value: string) => void;
  requestStatuses: string[];
  departments: string[];
  roleOptions: string[];
  requestedAtOptions: string[];
}

export default function FilterControls({
  searchTerm,
  selectedStatus,
  selectedDepartment,
  selectedRole,
  selectedRequestedAt,
  onSearchChange,
  onStatusChange,
  onDepartmentChange,
  onRoleChange,
  onRequestedAtChange,
  requestStatuses,
  departments,
  roleOptions,
  requestedAtOptions,
}: FilterControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search Bar */}
        <div className="md:col-span-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015]"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-1 relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015] appearance-none"
          >
            {requestStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>

        {/* Department Filter */}
        <div className="md:col-span-1 relative">
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015] appearance-none"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>

        {/* Role Filter */}
        <div className="md:col-span-1 relative">
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015] appearance-none"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>

        {/* Requested At Filter */}
        <div className="md:col-span-1 relative">
          <select
            value={selectedRequestedAt}
            onChange={(e) => onRequestedAtChange(e.target.value)}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015] appearance-none"
          >
            {requestedAtOptions.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
