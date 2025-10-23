import { RefreshCw } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 text-sm">Loading requests...</p>
    </div>
  );
}
