import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isAllowed: boolean;
  redirectPath?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAllowed,
  redirectPath = "/unauthorized",
  children,
  isLoading = false,
}) => {
  if (isLoading) {
    return null;
  }

  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
