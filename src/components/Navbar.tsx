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
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useAlert } from "@/contexts/AlertContext";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";

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
    is_read: boolean;
    created_at: string;
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track user's approved_acc_role - Initialize immediately from store
  const [approvedAccRole, setApprovedAccRole] = useState<string | null>(
    user?.role || null
  );

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
      router.push("/home");
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
        setNotifications(data || []);
        const unread = (data || []).filter(
          (notif: Notification) => !notif.is_read
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Defer notification fetch to avoid blocking critical page load
      const timer = setTimeout(() => {
        fetchNotifications();
      }, 1500); // Wait 1.5s after authentication to fetch notifications

      // Set up polling for notifications every 2 seconds
      const interval = setInterval(fetchNotifications, 2000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleNotificationClick = async (
    notificationId: string,
    notificationTitle: string
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
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
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

  // Utility for checking if user is Staff/Faculty/Admin
  // Use user.role directly from store for immediate access, fallback to state, then localStorage
  const rawRole =
    user?.role ||
    approvedAccRole ||
    (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);
  const currentRole = rawRole ? mapRoleToSystemRole(rawRole) : null;
  const isSuperAdmin = currentRole === "Super Admin";
  const isFaculty = currentRole === "Faculty";

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
          href="/home"
          className={`hover:text-black transition-colors duration-300 ${
            pathname === "/home" ? "text-orange-500" : ""
          }`}
        >
          Home
        </a>

        <div className="relative dropdown-container">
          <button
            onClick={toggleResources}
            className={`flex items-center gap-1 hover:text-black transition-colors duration-300 ${
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
                Equipments
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
            className={`hover:text-black transition-colors duration-300 ${
              pathname === "/requests" ? "text-orange-500" : ""
            }`}
          >
            Account Requests
          </a>
        )}

        {isAuthenticated ? (
          <div className="relative dropdown-container">
            <button
              onClick={toggleAvatarDropdown}
              className="w-10 h-10 flex items-center justify-center cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow hover:shadow-md transition duration-300"
            >
              {getInitial()}
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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[300px] max-h-[400px] overflow-y-auto z-50">
                <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-800 flex justify-between items-center">
                  <span>Notifications</span>
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
                          notification.title
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
                        {new Date(notification.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
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
            href="/home"
            className={`py-2 text-gray-700 ${
              pathname === "/home" ? "text-orange-500" : ""
            }`}
          >
            Home
          </Link>

          <div className="w-full">
            <button
              onClick={toggleResources}
              className={`flex items-center justify-between w-full py-2 text-gray-700 ${
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
                  Equipments
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
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationDropdownOpen && (
                <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg min-w-[280px] max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-800 flex justify-between items-center">
                    <span>Notifications</span>
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
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
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
                            notification.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    ))
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
