import { RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading your profile...",
}: LoadingStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="text-center">
        <div className="relative">
          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-orange-500 mb-2 sm:mb-4 animate-spin" />
        </div>
        <p className="text-slate-600 mt-4 sm:mt-6 text-sm sm:text-lg font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}
