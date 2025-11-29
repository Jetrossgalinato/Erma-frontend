import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoClose) {
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / 50);
          return newProgress > 0 ? newProgress : 0;
        });
      }, 50);

      // Auto close timer
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose();
        }, 300); // Match exit animation duration
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match exit animation duration
  };
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-orange-600" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          text: "text-green-800 dark:text-green-200",
          title: "text-green-900 dark:text-green-100",
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-800 dark:text-red-200",
          title: "text-red-900 dark:text-red-100",
        };
      case "warning":
        return {
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-800",
          text: "text-orange-800 dark:text-orange-200",
          title: "text-orange-900 dark:text-orange-100",
        };
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-200",
          title: "text-blue-900 dark:text-blue-100",
        };
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 dark:bg-green-500";
      case "error":
        return "bg-red-600 dark:bg-red-500";
      case "warning":
        return "bg-orange-600 dark:bg-orange-500";
      case "info":
        return "bg-blue-600 dark:bg-blue-500";
    }
  };

  const colors = getColors();

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-md w-full sm:w-96 transition-all duration-300 ease-out ${
        isExiting
          ? "translate-x-[120%] opacity-0"
          : "translate-x-0 opacity-100 animate-in slide-in-from-right-full"
      }`}
    >
      <div
        className={`${colors.bg} ${colors.border} border-2 rounded-lg shadow-xl overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1">
              {title && (
                <h3 className={`text-lg font-semibold mb-2 ${colors.title}`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm ${colors.text}`}>{message}</p>
            </div>
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ${colors.text} hover:opacity-70 transition-opacity`}
              aria-label="Close alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        {autoClose && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all ease-linear ${getProgressBarColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
