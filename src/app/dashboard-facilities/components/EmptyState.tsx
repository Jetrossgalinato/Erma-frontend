/**
 * EmptyState Component
 *
 * Displays empty state when no facilities exist
 */

import React from "react";
import { Building } from "lucide-react";

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        No facilities found
      </p>
    </div>
  );
};

export default EmptyState;
