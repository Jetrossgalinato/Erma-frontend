"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import Loader from "./Loader";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/",
  "/home",
  "/equipment",
  "/facilities",
  "/supplies",
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login");
      } else if (
        isAuthenticated &&
        (pathname === "/login" || pathname === "/register")
      ) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

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

  return <>{children}</>;
}
