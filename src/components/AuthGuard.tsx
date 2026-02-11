"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import Loader from "./Loader";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/",
  "/equipment",
  "/facilities",
  "/supplies",
];

const STAFF_ROLES = ["College Clerk", "Student Assistant", "Staff"];
const STAFF_RESTRICTED_ROUTES = [
  "/dashboard-request",
  "/dashboard-users",
  "/requests",
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initializeAuth, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      const isDashboardRoute = pathname.startsWith("/dashboard");
      const userRole = user?.role;

      // Faculty/Lecturer/Instructor - Block all dashboard access
      const isUnauthorizedForDashboard =
        isDashboardRoute &&
        (userRole === "Faculty" ||
          userRole === "Lecturer" ||
          userRole === "Instructor");

      // Staff - Block specific routes
      const isStaff = userRole && STAFF_ROLES.includes(userRole);
      const isRestrictedForStaff =
        isStaff &&
        STAFF_RESTRICTED_ROUTES.some((route) => pathname.startsWith(route));

      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login");
      } else if (
        isAuthenticated &&
        (pathname === "/login" || pathname === "/register")
      ) {
        router.push("/");
      } else if (isUnauthorizedForDashboard || isRestrictedForStaff) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isLoading, router, pathname, user]);

  if (isLoading) {
    // Determine if the current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    // For public routes, don't block rendering with a loader
    // let components handle their own loading states
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <Loader />;
  }

  // If not authenticated and trying to access protected route, don't render children
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const userRole = user?.role;

  // Check Faculty/Lecturer restriction
  const isUnauthorizedForDashboard =
    isDashboardRoute &&
    (userRole === "Faculty" ||
      userRole === "Lecturer" ||
      userRole === "Instructor");

  // Check Staff restriction
  const isStaff = userRole && STAFF_ROLES.includes(userRole);
  const isRestrictedForStaff =
    isStaff &&
    STAFF_RESTRICTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isUnauthorizedForDashboard || isRestrictedForStaff) {
    return null;
  }

  return <>{children}</>;
}
