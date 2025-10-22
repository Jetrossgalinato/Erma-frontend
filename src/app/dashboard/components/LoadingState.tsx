/**
 * Loading State Component
 *
 * Displays a loading skeleton for the dashboard
 */

export default function LoadingState() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-64 h-full" />
      <div className="flex-1 flex flex-col">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 w-full" />
        <div className="flex-1 p-6">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 mb-4 rounded" />
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-64 rounded" />
        </div>
      </div>
    </div>
  );
}
