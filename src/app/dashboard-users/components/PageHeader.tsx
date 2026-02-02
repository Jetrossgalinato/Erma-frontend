import { Search } from "lucide-react";

interface PageHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function PageHeader({
  searchQuery,
  onSearchChange,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          User Management
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage and view all account requests from users in the system
        </p>
      </div>

      <div className="relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all"
        />
      </div>
    </div>
  );
}
