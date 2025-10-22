/**
 * LoadingState Component
 *
 * Displays loading spinner
 */

import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
      <span className="ml-2 text-gray-600 dark:text-gray-400">
        Loading facilities...
      </span>
    </div>
  );
};

export default LoadingState;
