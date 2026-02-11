"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  LogOut,
  FileText,
  Bell,
  Package,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useAlert } from "@/contexts/AlertContext";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import {
  ReturnNotification,
  DoneNotification,
  RequestNotification,
  fetchReturnNotifications,
  fetchDoneNotifications,
  fetchRequestNotifications,
} from "@/app/dashboard-request/utils/helpers";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Navbar: React.FC = () => {
  // Use auth store
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<{
    email: string;
    first_name?: string;
    last_name?: string;
    acc_role?: string;
  } | null>(null);
  const pathname = usePathname();

  type Notification = {
    id: string;
    title: string;
    user_id: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingAccountRequestsCount, setPendingAccountRequestsCount] =
    useState(0);

  // Return Notifications State
  const [returnNotifications, setReturnNotifications] = useState<
    ReturnNotification[]
  >([]);
  const [returnNotificationsCount, setReturnNotificationsCount] = useState(0);

  // Done Notifications State
  const [doneNotifications, setDoneNotifications] = useState<
    DoneNotification[]
  >([]);
  const [doneNotificationsCount, setDoneNotificationsCount] = useState(0);

  // Request Notifications State
  const [requestNotifications, setRequestNotifications] = useState<
    RequestNotification[]
  >([]);
  const [requestNotificationsCount, setRequestNotificationsCount] = useState(0);

  const [activeNotificationTab, setActiveNotificationTab] = useState<
    "general" | "returns" | "done" | "requests"
  >("general");

  // Track user's approved_acc_role - Initialize immediately from store
  const [approvedAccRole, setApprovedAccRole] = useState<string | null>(
    user?.role || null,
  );

  // Utility for checking if user is Staff/Faculty/Admin
  // Use user.role directly from store for immediate access, fallback to state, then localStorage
  const rawRole =
    user?.role ||
    approvedAccRole ||
    (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);
  const currentRole = rawRole ? mapRoleToSystemRole(rawRole) : null;
  const isSuperAdmin = currentRole === "Super Admin";
  const isFaculty = currentRole === "Faculty";
  const isStudentAssistant = rawRole?.toLowerCase() === "student assistant";
  const isLabTechnician = rawRole === "Lab Technician";

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleResources = () => {
    setIsResourcesOpen(!isResourcesOpen);
    setIsAvatarDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
  };

  const toggleAvatarDropdown = () => {
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen);
    setIsResourcesOpen(false);
    setIsNotificationDropdownOpen(false);
  };

  const handleLogout = () => {
    logoutFromStore();
    setUserData(null);
    setIsAvatarDropdownOpen(false);
    showAlert({
      type: "success",
      message: "You have been logged out successfully.",
    });
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  useEffect(() => {
    // Prefetch common pages for faster navigation
    router.prefetch("/dashboard-request");
    router.prefetch("/my-requests");
    router.prefetch("/profile");
    router.prefetch("/login");
  }, [router]);

  useEffect(() => {
    // Sync userData from store when user changes
    if (user) {
      // Fetch additional user data if needed from localStorage
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setApprovedAccRole(parsedUserData.acc_role || user.role || null);
        } catch {
          // If parsing fails, use user from store
          setUserData({
            email: user.email,
            first_name: undefined,
            acc_role: user.role,
          });
          setApprovedAccRole(user.role || null);
        }
      } else {
        setUserData({
          email: user.email,
          first_name: undefined,
          acc_role: user.role,
        });
        setApprovedAccRole(user.role || null);
      }
    } else {
      setUserData(null);
      setApprovedAccRole(null);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setIsResourcesOpen(false);
        setIsAvatarDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitial = () => {
    if (!userData) return "?";

    // Get first and last name initials
    const firstName = userData.first_name;
    const lastName = userData.last_name;

    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    } else if (userData.email) {
      return userData.email.substring(0, 2).toUpperCase();
    }

    return "?";
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsResourcesOpen(false);
    setIsAvatarDropdownOpen(false);
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Call FastAPI endpoint to get notifications
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Filter notifications for Lab Technician
        let filteredData = data || [];
        if (approvedAccRole === "Lab Technician") {
          filteredData = filteredData.filter((notif: Notification) => {
            // If it's a maintenance notification, show if it's a confirmation (type="success") or rejection (type="info" or "error")
            // The backend sends "info" for rejection in maintenance.py, but let's be permissive
            if (notif.title.includes("Maintenance")) {
              return true;
            }
            return true;
          });
        }

        setNotifications(filteredData);
        const unread = filteredData.filter(
          (notif: Notification) => !notif.is_read,
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [isAuthenticated, approvedAccRole]);

  const fetchReturnNotificationsData = useCallback(async () => {
    const rawRole =
      user?.role ||
      approvedAccRole ||
      (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);
    const currentRole = rawRole ? mapRoleToSystemRole(rawRole) : null;
    const isAdminOrSuperAdmin =
      currentRole === "Super Admin" || currentRole === "Admin";

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
  }, [isAuthenticated, user, approvedAccRole]);

  const fetchDoneNotificationsData = useCallback(async () => {
    const rawRole =
      user?.role ||
      approvedAccRole ||
      (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);
    const currentRole = rawRole ? mapRoleToSystemRole(rawRole) : null;
    const isAdminOrSuperAdmin =
      currentRole === "Super Admin" || currentRole === "Admin";

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
  }, [isAuthenticated, user, approvedAccRole]);

  const fetchRequestNotificationsData = useCallback(async () => {
    const rawRole =
      user?.role ||
      approvedAccRole ||
      (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);
    const currentRole = rawRole ? mapRoleToSystemRole(rawRole) : null;
    const isAdminOrSuperAdmin =
      currentRole === "Super Admin" || currentRole === "Admin";

    if (!isAuthenticated || !isAdminOrSuperAdmin) return;

    try {
      const data = await fetchRequestNotifications();
      // Deduplicate request notifications by ID to prevent key errors
      const uniqueData = data
        ? Array.from(new Map(data.map((item) => [item.id, item])).values())
        : [];
      setRequestNotifications(uniqueData);
      setRequestNotificationsCount(uniqueData.length);
    } catch (error) {
      console.error("Error fetching request notifications:", error);
    }
  }, [isAuthenticated, user, approvedAccRole]);

  useEffect(() => {
    if (isAuthenticated) {
      // Defer notification fetch to avoid blocking critical page load
      const timer = setTimeout(() => {
        fetchNotifications();
        fetchReturnNotificationsData();
        fetchDoneNotificationsData();
        fetchRequestNotificationsData();
      }, 1500); // Wait 1.5s after authentication to fetch notifications

      // Set up polling for notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchReturnNotificationsData();
        fetchDoneNotificationsData();
        fetchRequestNotificationsData();
      }, 30000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [
    isAuthenticated,
    fetchNotifications,
    fetchReturnNotificationsData,
    fetchDoneNotificationsData,
    fetchRequestNotificationsData,
  ]);

  const fetchAccountRequests = useCallback(async () => {
    if (!isAuthenticated || !isSuperAdmin) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/account-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const pendingCount = data.filter(
          (req: any) => req.status === "Pending",
        ).length;
        setPendingAccountRequestsCount(pendingCount);
      }
    } catch (error) {
      console.error("Error fetching account requests:", error);
    }
  }, [isAuthenticated, isSuperAdmin]);

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchAccountRequests();
      const interval = setInterval(fetchAccountRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isSuperAdmin, fetchAccountRequests]);

  const handleNotificationClick = async (
    notificationId: string,
    notificationTitle: string,
  ) => {
    // Mark as read
    await markNotificationAsRead(notificationId);

    // Close dropdown
    setIsNotificationDropdownOpen(false);

    // Check user role for navigation
    const rawRole =
      user?.role ||
      approvedAccRole ||
      (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);
    const currentRole = rawRole ? mapRoleToSystemRole(rawRole) : null;
    const isAdminOrSuperAdmin =
      currentRole === "Super Admin" || currentRole === "Admin";

    // Navigate based on notification type and user role
    const title = notificationTitle.toLowerCase();

    if (isAdminOrSuperAdmin) {
      // Admin/Super Admin users go to dashboard-request
      if (
        title.includes("return") ||
        title.includes("borrowed") ||
        title.includes("borrowing")
      ) {
        router.push("/dashboard-request?tab=borrowing");
      } else if (
        title.includes("booking") ||
        title.includes("facility") ||
        title.includes("done")
      ) {
        router.push("/dashboard-request?tab=booking");
      } else if (
        title.includes("acquiring") ||
        title.includes("supply") ||
        title.includes("supplies")
      ) {
        router.push("/dashboard-request?tab=acquiring");
      } else {
        router.push("/dashboard-request");
      }
    } else {
      // Regular users go to my-requests
      if (
        title.includes("return") ||
        title.includes("borrowed") ||
        title.includes("borrowing")
      ) {
        router.push("/my-requests?tab=borrowing");
      } else if (
        title.includes("booking") ||
        title.includes("facility") ||
        title.includes("done")
      ) {
        router.push("/my-requests?tab=booking");
      } else if (
        title.includes("acquiring") ||
        title.includes("supply") ||
        title.includes("supplies")
      ) {
        router.push("/my-requests?tab=acquiring");
      } else if (title.includes("approved") || title.includes("rejected")) {
        router.push("/my-requests");
      } else {
        router.push("/my-requests");
      }
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
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
  };

  const clearAllNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
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
  };

  return (
    <nav className="w-full bg-white shadow-sm px-6 md:py-1 flex justify-between items-center relative">
      {/* Logo: Left-aligned with padding on all screens */}
      <div className="flex items-center pl-4 md:pl-40 w-full md:w-auto justify-start">
        <Image
          src="/images/logocircle.png"
          alt="Logo"
          width={80}
          height={80}
          className="h-15 w-15 md:h-20 md:w-20 object-contain"
        />
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex pr-40 gap-6 text-gray-600 items-center">
        <a
          href="/"
          className={`hover:text-black transition-colors duration-300 ${
            pathname === "/" ? "text-orange-500" : ""
          }`}
        >
          Home
        </a>

        <div className="relative dropdown-container">
          <button
            onClick={toggleResources}
            className={`flex items-center gap-1 cursor-pointer hover:text-black transition-colors duration-300 ${
              pathname.startsWith("/equipment") ||
              pathname.startsWith("/facilities")
                ? "text-orange-500"
                : ""
            }`}
          >
            Resources
            <ChevronDown size={16} />
          </button>

          {isResourcesOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[120px] z-50">
              <a
                href="/equipment"
                className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-300 ${
                  pathname.startsWith("/equipment") ? "text-orange-500" : ""
                }`}
              >
                Equipment
              </a>
              <a
                href="/facilities"
                className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-300 ${
                  pathname.startsWith("/facilities") ? "text-orange-500" : ""
                }`}
              >
                Facilities
              </a>
              <a
                href="/supplies"
                className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-300 ${
                  pathname.startsWith("/supplies") ? "text-orange-500" : ""
                }`}
              >
                Supplies
              </a>
            </div>
          )}
        </div>

        {/* Account Requests - Only for Super Admin */}
        {isAuthenticated && isSuperAdmin && (
          <a
            href="/requests"
            className={`relative hover:text-black transition-colors duration-300 ${
              pathname === "/requests" ? "text-orange-500" : ""
            }`}
          >
            Account Requests
            {pendingAccountRequestsCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex items-center justify-center">
                {pendingAccountRequestsCount > 99
                  ? "99+"
                  : pendingAccountRequestsCount}
              </span>
            )}
          </a>
        )}

        {isAuthenticated ? (
          <div className="relative dropdown-container">
            <button
              onClick={toggleAvatarDropdown}
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-orange-500 group-hover:bg-orange-600 text-white font-semibold rounded-full shadow group-hover:shadow-md transition duration-300">
                {getInitial()}
              </div>

              {userData?.first_name && userData?.last_name && (
                <span className="text-gray-700 font-medium hidden md:block group-hover:text-black transition-colors">
                  {userData.first_name} {userData.last_name}
                </span>
              )}
            </button>

            {isAvatarDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] z-50">
                {/* Hide My Dashboard for Faculty */}
                {!isFaculty && (
                  <a
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                  >
                    <LayoutDashboard size={16} />
                    My Dashboard
                  </a>
                )}
                <Link
                  href="/my-requests"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  <FileText size={16} />
                  My Requests
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  <User size={16} />
                  My Profile
                </Link>
                <hr className="border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors duration-300">
              Sign In
            </button>
          </Link>
        )}

        {isAuthenticated && (
          <div className="relative dropdown-container">
            <button
              onClick={toggleNotificationDropdown}
              className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-full cursor-pointer transition-colors duration-300"
            >
              <Bell size={25} />
              {(unreadCount > 0 ||
                returnNotificationsCount > 0 ||
                doneNotificationsCount > 0 ||
                requestNotificationsCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount +
                    returnNotificationsCount +
                    doneNotificationsCount +
                    requestNotificationsCount >
                  99
                    ? "99+"
                    : unreadCount +
                      returnNotificationsCount +
                      doneNotificationsCount +
                      requestNotificationsCount}
                </span>
              )}
            </button>

            {isNotificationDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[350px] max-h-[450px] overflow-hidden z-50">
                {isSuperAdmin || currentRole === "Admin" ? (
                  <>
                    {/* Tabs for Admins */}
                    <div className="flex border-b border-gray-200">
                      <button
                        onClick={() => setActiveNotificationTab("general")}
                        className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
                          activeNotificationTab === "general"
                            ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <Bell size={14} />
                          <span className="text-[10px]">General</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[9px] rounded-full px-1 py-0.5">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveNotificationTab("returns")}
                        className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
                          activeNotificationTab === "returns"
                            ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <Package size={14} />
                          <span className="text-[10px]">Returns</span>
                          {returnNotificationsCount > 0 && (
                            <span className="bg-orange-500 text-white text-[9px] rounded-full px-1 py-0.5">
                              {returnNotificationsCount > 99
                                ? "99+"
                                : returnNotificationsCount}
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveNotificationTab("done")}
                        className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
                          activeNotificationTab === "done"
                            ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <LayoutDashboard size={14} />
                          <span className="text-[10px]">Done</span>
                          {doneNotificationsCount > 0 && (
                            <span className="bg-blue-500 text-white text-[9px] rounded-full px-1 py-0.5">
                              {doneNotificationsCount > 99
                                ? "99+"
                                : doneNotificationsCount}
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveNotificationTab("requests")}
                        className={`relative flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
                          activeNotificationTab === "requests"
                            ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <ClipboardList size={14} />
                          <span className="text-[10px]">Requests</span>
                        </div>
                        {requestNotificationsCount > 0 && (
                          <span className="absolute top-1 right-1 bg-purple-500 text-white text-[9px] rounded-full px-1.5 py-0.5 min-w-[16px] flex items-center justify-center">
                            {requestNotificationsCount > 99
                              ? "99+"
                              : requestNotificationsCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[350px] overflow-y-auto">
                      {activeNotificationTab === "general" ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <span className="text-sm font-semibold text-gray-800">
                              General Notifications
                            </span>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className="text-xs text-red-600 hover:text-red-800 hover:underline"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-gray-500 text-center">
                              <Bell
                                className="mx-auto mb-2 opacity-50"
                                size={32}
                              />
                              <p>No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() =>
                                  handleNotificationClick(
                                    notification.id,
                                    notification.title,
                                  )
                                }
                                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.is_read ? "bg-orange-50" : ""
                                }`}
                              >
                                <div className="text-sm font-medium text-gray-800">
                                  {notification.title}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(
                                    notification.created_at,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ))
                          )}
                        </>
                      ) : activeNotificationTab === "returns" ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-white">
                            <span className="text-sm font-semibold text-gray-800">
                              Return Notifications
                            </span>
                          </div>
                          {returnNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-gray-500 text-center">
                              <Package
                                className="mx-auto mb-2 opacity-50"
                                size={32}
                              />
                              <p>No return notifications</p>
                            </div>
                          ) : (
                            returnNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => {
                                  setIsNotificationDropdownOpen(false);
                                  router.push(
                                    "/dashboard-request?tab=borrowing",
                                  );
                                }}
                                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">
                                      {notification.borrower_name}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      Returned:{" "}
                                      <span className="font-medium">
                                        {notification.equipment_name}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {notification.message}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(
                                        notification.created_at,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      notification.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {notification.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                          {returnNotifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                              <button
                                onClick={() => {
                                  setIsNotificationDropdownOpen(false);
                                  router.push(
                                    "/dashboard-request?tab=borrowing",
                                  );
                                }}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                View All Returns →
                              </button>
                            </div>
                          )}
                        </>
                      ) : activeNotificationTab === "done" ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-white">
                            <span className="text-sm font-semibold text-gray-800">
                              Done Notifications
                            </span>
                          </div>
                          {doneNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-gray-500 text-center">
                              <LayoutDashboard
                                className="mx-auto mb-2 opacity-50"
                                size={32}
                              />
                              <p>No done notifications</p>
                            </div>
                          ) : (
                            doneNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => {
                                  setIsNotificationDropdownOpen(false);
                                  router.push("/dashboard-request?tab=booking");
                                }}
                                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">
                                      {notification.booker_name}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      Facility:{" "}
                                      <span className="font-medium">
                                        {notification.facility_name}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {notification.message}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(
                                        notification.created_at,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      notification.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {notification.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                          {doneNotifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                              <button
                                onClick={() => {
                                  setIsNotificationDropdownOpen(false);
                                  router.push("/dashboard-request?tab=booking");
                                }}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                View All Done →
                              </button>
                            </div>
                          )}
                        </>
                      ) : activeNotificationTab === "requests" ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-white">
                            <span className="text-sm font-semibold text-gray-800">
                              New Requests
                            </span>
                          </div>
                          {requestNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-gray-500 text-center">
                              <ClipboardList
                                className="mx-auto mb-2 opacity-50"
                                size={32}
                              />
                              <p>No pending requests</p>
                            </div>
                          ) : (
                            requestNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => {
                                  setIsNotificationDropdownOpen(false);
                                  // Navigate to the correct tab based on request type
                                  router.push(
                                    `/dashboard-request?tab=${notification.request_type}`,
                                  );
                                }}
                                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">
                                      {notification.requester_name}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {notification.request_type === "borrowing"
                                        ? "Equipment: "
                                        : notification.request_type ===
                                            "booking"
                                          ? "Facility: "
                                          : "Supply: "}
                                      <span className="font-medium">
                                        {notification.item_name}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Purpose: {notification.purpose}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(
                                        notification.created_at,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        notification.request_type ===
                                        "borrowing"
                                          ? "bg-orange-100 text-orange-800"
                                          : notification.request_type ===
                                              "booking"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-purple-100 text-purple-800"
                                      }`}
                                    >
                                      {notification.request_type}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                      {notification.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          {requestNotifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                              <button
                                onClick={() => {
                                  setIsNotificationDropdownOpen(false);
                                  router.push("/dashboard-request");
                                }}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                View All Requests →
                              </button>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-800 flex justify-between items-center">
                      <span>Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs cursor-pointer text-red-600 hover:text-red-800 hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() =>
                            handleNotificationClick(
                              notification.id,
                              notification.title,
                            )
                          }
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.is_read ? "bg-orange-50" : ""
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(
                              notification.created_at,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-600 px-4"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 text-sm md:text-lg w-full bg-white shadow-md flex flex-col items-start px-6 py-4 md:hidden z-50">
          <Link
            href="/"
            className={`py-2 text-gray-700 ${
              pathname === "/" ? "text-orange-500" : ""
            }`}
          >
            Home
          </Link>

          <div className="w-full">
            <button
              onClick={toggleResources}
              className={`flex items-center cursor-pointer justify-between w-full py-2 text-gray-700 ${
                pathname.startsWith("/equipment") ||
                pathname.startsWith("/facilities")
                  ? "text-orange-500"
                  : ""
              }`}
              type="button"
            >
              Resources
              <ChevronDown size={16} />
            </button>
            {/* MODIFIED: Make dropdown options always clickable on mobile */}
            {(isResourcesOpen || isOpen) && (
              <div className="pl-4 flex flex-col">
                <Link
                  href="/equipment"
                  className={`py-1 text-gray-600 ${
                    pathname.startsWith("/equipment") ? "text-orange-500" : ""
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    setIsResourcesOpen(false);
                  }}
                >
                  Equipment
                </Link>
                <Link
                  href="/facilities"
                  className={`py-1 text-gray-600 ${
                    pathname.startsWith("/facilities") ? "text-orange-500" : ""
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    setIsResourcesOpen(false);
                  }}
                >
                  Facilities
                </Link>
                <Link
                  href="/supplies"
                  className={`py-1 text-gray-600 ${
                    pathname.startsWith("/supplies") ? "text-orange-500" : ""
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    setIsResourcesOpen(false);
                  }}
                >
                  Supplies
                </Link>
              </div>
            )}
          </div>

          {/* Account Requests - Only for Super Admin */}
          {isAuthenticated && isSuperAdmin && (
            <Link
              href="/requests"
              className={`py-2 text-gray-700 ${
                pathname === "/requests" ? "text-orange-500" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              Account Requests
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative dropdown-container w-full mt-2">
              <button
                onClick={toggleAvatarDropdown}
                className="w-10 h-10 flex items-center justify-center cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow transition"
              >
                {getInitial()}
              </button>

              {isAvatarDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] z-50">
                  {/* Hide My Dashboard for Faculty */}
                  {!isFaculty && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      My Dashboard
                    </Link>
                  )}
                  <Link
                    href="/my-requests"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText size={16} />
                    My Requests
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <hr className="border-gray-200" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center cursor-pointer gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="w-full mt-2">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md w-full transition">
                Sign In
              </button>
            </Link>
          )}

          {isAuthenticated && (
            <div className="relative dropdown-container w-full">
              <button
                onClick={toggleNotificationDropdown}
                className="relative flex items-center py-2 text-gray-700"
              >
                <Bell size={20} className="mr-2" />
                Notifications
                {(unreadCount > 0 ||
                  returnNotificationsCount > 0 ||
                  doneNotificationsCount > 0 ||
                  requestNotificationsCount > 0) && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount +
                      returnNotificationsCount +
                      doneNotificationsCount +
                      requestNotificationsCount >
                    99
                      ? "99+"
                      : unreadCount +
                        returnNotificationsCount +
                        doneNotificationsCount +
                        requestNotificationsCount}
                  </span>
                )}
              </button>

              {isNotificationDropdownOpen && (
                <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg min-w-[280px] max-h-[300px] overflow-y-auto">
                  {/* Simplified Mobile View - Just show General for now, or could expand. 
                      User only asked for notification on Navbar, usually implies desktop/primary nav. 
                      We'll keep mobile simple but correct the badge. 
                      Actually, let's at least show a message if they have admin notifications to check desktop or go to dashboard.
                  */}
                  <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-800 flex justify-between items-center">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs cursor-pointer text-red-600 hover:text-red-800 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 &&
                  returnNotificationsCount === 0 &&
                  doneNotificationsCount === 0 &&
                  requestNotificationsCount === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No notifications yet
                    </div>
                  ) : (
                    <>
                      {/* Show summary of admin notifications if any */}
                      {(isSuperAdmin || currentRole === "Admin") &&
                        (returnNotificationsCount > 0 ||
                          doneNotificationsCount > 0 ||
                          requestNotificationsCount > 0) && (
                          <div className="px-4 py-2 bg-orange-50 border-b border-orange-100 text-xs text-orange-800">
                            You have{" "}
                            {returnNotificationsCount +
                              doneNotificationsCount +
                              requestNotificationsCount}{" "}
                            pending requests.
                            <br />
                            <Link
                              href="/dashboard-request"
                              className="underline font-bold"
                            >
                              Go to Dashboard Requests
                            </Link>
                          </div>
                        )}

                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${
                            !notification.is_read ? "bg-orange-50" : ""
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(
                              notification.created_at,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
