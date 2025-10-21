"use client";
import { useEffect, useState, useCallback } from "react";
import { sessionTimeout, SESSION_CONFIG } from "@/utils/sessionTimeout";

export default function SessionTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    SESSION_CONFIG.WARNING_MINUTES
  );

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    alert(
      "Your session has expired due to inactivity. You will be redirected to the login page."
    );
    sessionTimeout.stop();

    // Perform logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
  }, []);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleContinueSession = useCallback(() => {
    setShowWarning(false);
    // Activity will automatically reset the timeout
  }, []);

  useEffect(() => {
    // Only initialize if user is authenticated
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (token) {
      sessionTimeout.initialize(handleLogout, handleWarning);
    }

    // Cleanup on unmount
    return () => {
      sessionTimeout.stop();
    };
  }, [handleLogout, handleWarning]);

  // Update remaining time countdown
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      const remaining = sessionTimeout.getRemainingTime();
      const minutes = Math.floor(remaining / 60000);

      setRemainingTime(minutes);

      // Auto-close warning if time is up
      if (remaining <= 0) {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  return (
    <>
      {children}

      {/* Session Timeout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Session Timeout Warning
            </h2>

            <p className="text-gray-600 text-center mb-4">
              Your session will expire in approximately{" "}
              <span className="font-bold text-orange-600">
                {remainingTime} minute{remainingTime !== 1 ? "s" : ""}
              </span>{" "}
              due to inactivity.
            </p>

            <p className="text-sm text-gray-500 text-center mb-6">
              Click &quot;Continue Session&quot; to stay logged in, or you will
              be automatically logged out.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Logout Now
              </button>
              <button
                onClick={handleContinueSession}
                className="flex-1 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Continue Session
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Session timeout: {SESSION_CONFIG.TIMEOUT_MINUTES} minutes of
              inactivity
            </p>
          </div>
        </div>
      )}
    </>
  );
}
