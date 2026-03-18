"use client";

import { useEffect, useMemo, useState } from "react";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import type { NavbarUserData } from "./types";

type MinimalUser = {
  email: string;
  role?: string;
} | null;

export function useNavbarUserData(user: MinimalUser) {
  const [userData, setUserData] = useState<NavbarUserData | null>(null);
  const [approvedAccRole, setApprovedAccRole] = useState<string | null>(
    user?.role || null,
  );

  useEffect(() => {
    if (user) {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setApprovedAccRole(parsedUserData.acc_role || user.role || null);
          return;
        } catch {
          // Fall through to store-based data
        }
      }

      setUserData({
        email: user.email,
        first_name: undefined,
        acc_role: user.role,
      });
      setApprovedAccRole(user.role || null);
    } else {
      setUserData(null);
      setApprovedAccRole(null);
    }
  }, [user]);

  const rawRole = useMemo(() => {
    return (
      user?.role ||
      approvedAccRole ||
      (typeof window !== "undefined" ? localStorage.getItem("userRole") : null)
    );
  }, [user?.role, approvedAccRole]);

  const currentRole = useMemo(() => {
    return rawRole ? mapRoleToSystemRole(rawRole) : null;
  }, [rawRole]);

  const isSuperAdmin = currentRole === "Super Admin";
  const isFaculty = currentRole === "Faculty";

  const getInitial = () => {
    if (!userData) return "?";

    const firstName = userData.first_name;
    const lastName = userData.last_name;

    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    if (userData.email) {
      return userData.email.substring(0, 2).toUpperCase();
    }

    return "?";
  };

  const clearUserData = () => {
    setUserData(null);
    setApprovedAccRole(null);
  };

  return {
    userData,
    approvedAccRole,
    rawRole,
    currentRole,
    isSuperAdmin,
    isFaculty,
    getInitial,
    clearUserData,
  };
}
