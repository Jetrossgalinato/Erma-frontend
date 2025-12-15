import React from "react";

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  fullScreen = true,
  className = "",
}) => {
  const baseClasses =
    "flex items-center justify-center bg-white dark:bg-gray-900";
  const positionClasses = fullScreen
    ? "fixed inset-0 z-50"
    : "w-full h-full min-h-[200px]";

  return (
    <div className={`${baseClasses} ${positionClasses} ${className}`}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        {/* Inner pulsing circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default Loader;
