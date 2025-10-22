import { RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading your profile...",
}: LoadingStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="relative">
          <RefreshCw className="w-8 h-8 mx-auto text-orange-500 mb-4 animate-spin" />
        </div>
        <p className="text-slate-600 mt-6 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}
