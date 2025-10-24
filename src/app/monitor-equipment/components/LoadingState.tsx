"use client";

import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-orange-600 dark:text-orange-400 animate-spin" />
      <span className="ml-3 text-gray-600 dark:text-gray-400">
        Loading logs...
      </span>
    </div>
  );
}
