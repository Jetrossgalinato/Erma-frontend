interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-red-400 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="text-red-800 font-semibold text-sm sm:text-base">
            Error
          </h3>
          <p className="text-red-700 mt-1 text-xs sm:text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-red-800 underline hover:text-red-900 font-medium text-xs sm:text-sm"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
