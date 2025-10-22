/**
 * EmptyState Component
 *
 * Displays when there are no supplies in the system
 */

import React from "react";
import { Package } from "lucide-react";

const EmptyState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Package className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Supplies Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Get started by adding your first supply item
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
