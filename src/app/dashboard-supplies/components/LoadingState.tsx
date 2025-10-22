/**
 * LoadingState Component
 *
 * Displays a loading spinner while data is being fetched
 */

import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading supplies...</p>
      </div>
    </div>
  );
};

export default LoadingState;
