"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Alert from "@/components/Alert";

interface AlertState {
  type: "success" | "error" | "warning" | "info";
  message: string;
  title?: string;
}

interface AlertContextType {
  showAlert: (alert: AlertState) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = (alertData: AlertState) => {
    setAlert(alertData);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          title={alert.title}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
