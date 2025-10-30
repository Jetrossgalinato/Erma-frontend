"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { useAlert } from "@/contexts/AlertContext";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Navbar: React.FC = () => {
  // Use auth store
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();
  const { showAlert } = useAlert();

  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<{
    email: string;
    first_name?: string;
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

  // Track user's approved_acc_role
  const [approvedAccRole, setApprovedAccRole] = useState<string | null>(null);

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
      window.location.href = "/home";
    }, 1500);
  };

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
    const name = userData.first_name || userData.email;
    return name ? name.charAt(0).toUpperCase() : "?";
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

      // Optional: Set up polling for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, fetchNotifications]);

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
  const isPrivileged =
    approvedAccRole === "Staff" ||
    approvedAccRole === "Faculty" ||
    approvedAccRole === "Admin";
  const isFaculty = approvedAccRole === "Faculty";

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

        {/* Hide Account Requests for Staff, Faculty, Admin */}
        {isAuthenticated && !isPrivileged && (
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
                <a
                  href="/my-requests"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  <FileText size={16} />
                  My Requests
                </a>
                <a
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  <User size={16} />
                  My Profile
                </a>
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
          <a href="/login">
            <button className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors duration-300">
              Sign In
            </button>
          </a>
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
                      onClick={() => markNotificationAsRead(notification.id)}
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
          <a
            href="/home"
            className={`py-2 text-gray-700 ${
              pathname === "/home" ? "text-orange-500" : ""
            }`}
          >
            Home
          </a>

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
                <a
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
                </a>
                <a
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
                </a>
                <a
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
                </a>
              </div>
            )}
          </div>

          {/* Hide Account Requests for Staff, Faculty, Admin */}
          {isAuthenticated && !isPrivileged && (
            <a
              href="/requests"
              className={`py-2 text-gray-700 ${
                pathname === "/requests" ? "text-orange-500" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              Account Requests
            </a>
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
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      My Dashboard
                    </a>
                  )}
                  <a
                    href="/my-requests"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText size={16} />
                    My Requests
                  </a>
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={16} />
                    My Profile
                  </a>
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
            <a href="/login" className="w-full mt-2">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md w-full transition">
                Sign In
              </button>
            </a>
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
