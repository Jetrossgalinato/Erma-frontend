"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import {
  fetchDoneNotifications,
  fetchRequestNotifications,
  fetchReturnNotifications,
  type DoneNotification,
  type RequestNotification,
  type ReturnNotification,
} from "@/app/dashboard-request/utils/helpers";
import type { PersonalNotification } from "./types";

type MinimalUser = {
  role?: string;
} | null;

type UseNavbarNotificationsArgs = {
  isAuthenticated: boolean;
  user: MinimalUser;
  approvedAccRole: string | null;
  isSuperAdmin: boolean;
  apiBaseUrl: string;
  push: (href: string) => void;
};

export function useNavbarNotifications({
  isAuthenticated,
  user,
  approvedAccRole,
  isSuperAdmin,
  apiBaseUrl,
  push,
}: UseNavbarNotificationsArgs) {
  const [notifications, setNotifications] = useState<PersonalNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingAccountRequestsCount, setPendingAccountRequestsCount] =
    useState(0);

  const [returnNotifications, setReturnNotifications] = useState<
    ReturnNotification[]
  >([]);
  const [returnNotificationsCount, setReturnNotificationsCount] = useState(0);

  const [doneNotifications, setDoneNotifications] = useState<
    DoneNotification[]
  >([]);
  const [doneNotificationsCount, setDoneNotificationsCount] = useState(0);

  const [requestNotifications, setRequestNotifications] = useState<
    RequestNotification[]
  >([]);
  const [requestNotificationsCount, setRequestNotificationsCount] = useState(0);

  const [activeNotificationTab, setActiveNotificationTab] = useState<
    "general" | "returns" | "done" | "requests"
  >("general");

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

  const isAdminOrSuperAdmin =
    currentRole === "Super Admin" || currentRole === "Admin";

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${apiBaseUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      let filteredData = data || [];
      if (approvedAccRole === "Lab Technician") {
        filteredData = filteredData.filter((notif: PersonalNotification) => {
          if (notif.title.includes("Maintenance")) {
            return true;
          }
          return true;
        });
      }

      setNotifications(filteredData);
      const unread = filteredData.filter(
        (notif: PersonalNotification) => !notif.is_read,
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [isAuthenticated, apiBaseUrl, approvedAccRole]);

  const fetchReturnNotificationsData = useCallback(async () => {
    if (!isAuthenticated || !isAdminOrSuperAdmin) return;

    try {
      const data = await fetchReturnNotifications();
      const uniqueData = data
        ? Array.from(new Map(data.map((item) => [item.id, item])).values())
        : [];
      setReturnNotifications(uniqueData);
      setReturnNotificationsCount(uniqueData.length);
    } catch (error) {
      console.error("Error fetching return notifications:", error);
    }
  }, [isAuthenticated, isAdminOrSuperAdmin]);

  const fetchDoneNotificationsData = useCallback(async () => {
    if (!isAuthenticated || !isAdminOrSuperAdmin) return;

    try {
      const data = await fetchDoneNotifications();
      const uniqueData = data
        ? Array.from(new Map(data.map((item) => [item.id, item])).values())
        : [];
      setDoneNotifications(uniqueData);
      setDoneNotificationsCount(uniqueData.length);
    } catch (error) {
      console.error("Error fetching done notifications:", error);
    }
  }, [isAuthenticated, isAdminOrSuperAdmin]);

  const fetchRequestNotificationsData = useCallback(async () => {
    if (!isAuthenticated || !isAdminOrSuperAdmin) return;

    try {
      const data = await fetchRequestNotifications();
      const uniqueData = data
        ? Array.from(
            new Map(
              data.map((item) => [`${item.request_type}-${item.id}`, item]),
            ).values(),
          )
        : [];
      setRequestNotifications(uniqueData);
      setRequestNotificationsCount(uniqueData.length);
    } catch (error) {
      console.error("Error fetching request notifications:", error);
    }
  }, [isAuthenticated, isAdminOrSuperAdmin]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;

    const looksLikeJwt = (value: string) =>
      /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);

    const cleanRawToken = (value: string) =>
      value
        .trim()
        .replace(/^Bearer\s+/i, "")
        .replace(/^"|"$/g, "")
        .replace(/^'|'$/g, "");

    const rawAuthToken = localStorage.getItem("authToken");
    const rawLegacyToken = localStorage.getItem("token");
    const cleanedAuthToken = rawAuthToken ? cleanRawToken(rawAuthToken) : null;
    const cleanedLegacyToken = rawLegacyToken
      ? cleanRawToken(rawLegacyToken)
      : null;

    const cleanToken =
      (cleanedAuthToken && looksLikeJwt(cleanedAuthToken)
        ? cleanedAuthToken
        : null) ||
      (cleanedLegacyToken && looksLikeJwt(cleanedLegacyToken)
        ? cleanedLegacyToken
        : null);

    if (!cleanToken) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          "WebSocket skipped: missing/invalid auth token (expected JWT).",
        );
      }
      return;
    }

    const baseUrl = apiBaseUrl || "http://localhost:8000";
    const wsUrl = (() => {
      try {
        const url = new URL(baseUrl);
        const shouldUseSecureWs =
          url.protocol === "https:" || window.location.protocol === "https:";
        url.protocol = shouldUseSecureWs ? "wss:" : "ws:";
        return url.toString().replace(/\/$/, "");
      } catch {
        return baseUrl
          .replace(/^http(s)?/, (match, isHttps) => (isHttps ? "wss" : "ws"))
          .replace(/\/$/, "");
      }
    })();

    fetchNotifications();
    fetchReturnNotificationsData();
    fetchDoneNotificationsData();
    fetchRequestNotificationsData();

    let ws: WebSocket | undefined;
    let wsReconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    let initialConnectTimer: ReturnType<typeof setTimeout> | undefined;
    let isActive = true;
    let hasWarned = false;

    const connectWebSocket = () => {
      if (!isActive) return;

      const wsEndpoint = `${wsUrl}/api/ws/notifications?token=${encodeURIComponent(cleanToken)}`;
      const wsSafeEndpoint = `${wsUrl}/api/ws/notifications`;
      ws = new WebSocket(wsEndpoint);

      ws.onopen = () => {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.debug("WebSocket connected.", { endpoint: wsSafeEndpoint });
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.personalNotifications) {
            let filteredData = data.personalNotifications || [];
            if (approvedAccRole === "Lab Technician") {
              filteredData = filteredData.filter(
                (notif: PersonalNotification) => {
                  if (notif.title.includes("Maintenance")) {
                    return true;
                  }
                  return true;
                },
              );
            }
            setNotifications(filteredData);
            const unread = filteredData.filter(
              (notif: PersonalNotification) => !notif.is_read,
            ).length;
            setUnreadCount(unread);
          }

          if (data.returnNotifications) {
            const uniqueData = Array.from(
              new Map(
                data.returnNotifications.map((item: any) => [item.id, item]),
              ).values(),
            );
            setReturnNotifications(uniqueData as any);
            setReturnNotificationsCount(uniqueData.length);
          }

          if (data.doneNotifications) {
            const uniqueData = Array.from(
              new Map(
                data.doneNotifications.map((item: any) => [item.id, item]),
              ).values(),
            );
            setDoneNotifications(uniqueData as any);
            setDoneNotificationsCount(uniqueData.length);
          }

          if (data.pendingRequests) {
            const uniqueData = Array.from(
              new Map(
                data.pendingRequests.map((item: any) => [
                  `${item.request_type}-${item.id}`,
                  item,
                ]),
              ).values(),
            );
            setRequestNotifications(uniqueData as any);
            setRequestNotificationsCount(uniqueData.length);
          }

          if (data.accountRequests && isSuperAdmin) {
            const pendingCount = data.accountRequests.filter(
              (req: any) => req.status === "Pending",
            ).length;
            setPendingAccountRequestsCount(pendingCount);
          }
        } catch (err) {
          console.error("Error parsing websocket message:", err);
        }
      };

      ws.onerror = () => {
        if (!hasWarned && process.env.NODE_ENV !== "production") {
          hasWarned = true;
          // eslint-disable-next-line no-console
          console.debug(
            "WebSocket error (details will appear in close event).",
          );
        }
      };

      ws.onclose = (event) => {
        if (!isActive) return;

        if (process.env.NODE_ENV !== "production") {
          const isNormalClose = event.code === 1000 || event.code === 1005;
          // eslint-disable-next-line no-console
          (isNormalClose ? console.debug : console.warn)("WebSocket closed.", {
            endpoint: wsSafeEndpoint,
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
        }
        if (event.code === 1008) {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn("WebSocket closed (auth/policy). Not reconnecting.", {
              code: event.code,
              reason: event.reason,
            });
          }
          return;
        }
        wsReconnectTimeout = setTimeout(connectWebSocket, 5000);
      };
    };

    // In React Strict Mode (dev), effects mount/unmount twice.
    // Deferring the first connection avoids creating a socket that gets
    // immediately closed during the dev-only lifecycle cycle.
    initialConnectTimer = setTimeout(connectWebSocket, 0);

    return () => {
      isActive = false;
      if (initialConnectTimer) clearTimeout(initialConnectTimer);
      if (wsReconnectTimeout) clearTimeout(wsReconnectTimeout);
      ws?.close();
    };
  }, [
    apiBaseUrl,
    approvedAccRole,
    fetchDoneNotificationsData,
    fetchNotifications,
    fetchRequestNotificationsData,
    fetchReturnNotificationsData,
    isAuthenticated,
    isSuperAdmin,
  ]);

  const fetchAccountRequests = useCallback(async () => {
    if (!isAuthenticated || !isSuperAdmin) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${apiBaseUrl}/api/account-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const pendingCount = data.filter(
        (req: any) => req.status === "Pending",
      ).length;
      setPendingAccountRequestsCount(pendingCount);
    } catch (error) {
      console.error("Error fetching account requests:", error);
    }
  }, [apiBaseUrl, isAuthenticated, isSuperAdmin]);

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchAccountRequests();
    }
  }, [fetchAccountRequests, isAuthenticated, isSuperAdmin]);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch(
          `${apiBaseUrl}/api/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === notificationId ? { ...notif, is_read: true } : notif,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        fetchNotifications();
      }
    },
    [apiBaseUrl, fetchNotifications],
  );

  const clearAllNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${apiBaseUrl}/api/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      fetchNotifications();
    }
  }, [apiBaseUrl, fetchNotifications, isAuthenticated]);

  const handleNotificationClick = useCallback(
    async (
      notificationId: string,
      notificationTitle: string,
      onAfterMarkRead?: () => void,
    ) => {
      await markNotificationAsRead(notificationId);
      onAfterMarkRead?.();

      const title = notificationTitle.toLowerCase();

      if (isAdminOrSuperAdmin) {
        if (
          title.includes("return") ||
          title.includes("borrowed") ||
          title.includes("borrowing")
        ) {
          push("/dashboard-request?tab=borrowing");
        } else if (
          title.includes("booking") ||
          title.includes("facility") ||
          title.includes("done")
        ) {
          push("/dashboard-request?tab=booking");
        } else if (
          title.includes("acquiring") ||
          title.includes("supply") ||
          title.includes("supplies")
        ) {
          push("/dashboard-request?tab=acquiring");
        } else {
          push("/dashboard-request");
        }
      } else {
        if (
          title.includes("return") ||
          title.includes("borrowed") ||
          title.includes("borrowing")
        ) {
          push("/my-requests?tab=borrowing");
        } else if (
          title.includes("booking") ||
          title.includes("facility") ||
          title.includes("done")
        ) {
          push("/my-requests?tab=booking");
        } else if (
          title.includes("acquiring") ||
          title.includes("supply") ||
          title.includes("supplies")
        ) {
          push("/my-requests?tab=acquiring");
        } else if (title.includes("approved") || title.includes("rejected")) {
          push("/my-requests");
        } else {
          push("/my-requests");
        }
      }
    },
    [isAdminOrSuperAdmin, markNotificationAsRead, push],
  );

  return {
    currentRole,
    isAdminOrSuperAdmin,
    notifications,
    unreadCount,
    pendingAccountRequestsCount,
    returnNotifications,
    returnNotificationsCount,
    doneNotifications,
    doneNotificationsCount,
    requestNotifications,
    requestNotificationsCount,
    activeNotificationTab,
    setActiveNotificationTab,
    handleNotificationClick,
    markNotificationAsRead,
    clearAllNotifications,
  };
}
