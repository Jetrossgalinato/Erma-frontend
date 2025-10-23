import { X } from "lucide-react";

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function SuccessMessage({
  message,
  onDismiss,
}: SuccessMessageProps) {
  return (
    <div className="mb-4 sm:mb-6 md:mb-8 bg-green-50 border-l-4 border-green-400 rounded-lg p-3 sm:p-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mr-2 sm:mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-green-800 font-medium text-sm sm:text-base">
            {message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-green-600 hover:text-green-800 transition-colors ml-2 sm:ml-4 flex-shrink-0"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
