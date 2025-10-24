/**
 * Empty State Component
 * Displays when no requests are found
 */

import { FileText } from "lucide-react";

interface EmptyStateProps {
  message: string;
  description: string;
}

export default function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        {message}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
