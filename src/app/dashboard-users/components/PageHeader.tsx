import { RefreshCw } from "lucide-react";

export default function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        Users Management
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Manage and view all account requests from users in the system
      </p>
    </div>
  );
}
