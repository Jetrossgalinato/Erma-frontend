"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize authentication on mount
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
