import { Search } from "lucide-react";

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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-1">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {requestStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div className="md:col-span-1">
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="md:col-span-1">
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Requested At Filter */}
        <div className="md:col-span-1">
          <select
            value={selectedRequestedAt}
            onChange={(e) => onRequestedAtChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {requestedAtOptions.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
