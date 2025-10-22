"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  Home,
  Palette,
  Bell,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

type Notification = {
  id: string;
  title: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const DashboardNavbar: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleAvatarDropdown = () => {
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen);
    setIsNotificationDropdownOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsAvatarDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAvatarDropdownOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.add("light");
    } else if (newTheme === "system") {
      // Check system preference and apply accordingly
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.add(prefersDark ? "dark" : "light");
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    setIsAvatarDropdownOpen(false);
  };

  useEffect(() => {
    // Load theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to light theme
      setTheme("light");
      localStorage.setItem("theme", "light");
      applyTheme("light");
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const currentTheme = localStorage.getItem("theme");
      if (currentTheme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
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
    if (!user) return "?";
    const name = user.email;
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("http://localhost:8000/api/notifications", {
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
      fetchNotifications();

      // Optional: Set up polling for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, fetchNotifications]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `http://localhost:8000/api/notifications/${notificationId}/read`,
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

      const response = await fetch("http://localhost:8000/api/notifications", {
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
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6 md:py-1 flex justify-between items-center relative">
      <div className="flex items-center pl-40">
        <Image
          src="/images/logocircle.png"
          alt="Logo"
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
        />
      </div>

      {/* Desktop Avatar Only */}
      <div className="hidden md:flex pr-40 items-center gap-4">
        {isAuthenticated && user ? (
          <>
            {/* User Avatar */}
            <div className="relative dropdown-container">
              <button
                onClick={toggleAvatarDropdown}
                className="w-10 h-10 flex items-center justify-center cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow hover:shadow-md transition duration-300"
              >
                {getInitial()}
              </button>

              {isAvatarDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[180px] z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette size={16} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Theme
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleThemeChange("light")}
                        className={`px-3 py-1 text-xs rounded ${
                          theme === "light"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } transition`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => handleThemeChange("dark")}
                        className={`px-3 py-1 text-xs rounded ${
                          theme === "dark"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } transition`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => handleThemeChange("system")}
                        className={`px-3 py-1 text-xs rounded ${
                          theme === "system"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        } transition`}
                      >
                        System
                      </button>
                    </div>
                  </div>
                  <a
                    href="/home"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition"
                  >
                    <Home size={16} />
                    Back to Home
                  </a>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition"
                  >
                    <User size={16} />
                    My Profile
                  </a>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center cursor-pointer gap-2 w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative dropdown-container">
              <button
                onClick={toggleNotificationDropdown}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full cursor-pointer transition-colors duration-300"
              >
                <Bell size={25} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[300px] max-h-[400px] overflow-y-auto z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200 flex justify-between items-center">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.is_read
                            ? "bg-orange-50 dark:bg-orange-900/20"
                            : ""
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {notification.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
          </>
        ) : (
          <a href="/login">
            <button className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors duration-300">
              Sign In
            </button>
          </a>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-600 dark:text-gray-400"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-md flex flex-col items-start px-6 py-4 md:hidden z-50">
          {isAuthenticated && user ? (
            <>
              {/* Notification Section for Mobile */}
              <div className="relative dropdown-container w-full mb-4">
                <button
                  onClick={toggleNotificationDropdown}
                  className="relative flex items-center py-2 text-gray-700 dark:text-gray-300"
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
                  <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[280px] max-h-[300px] overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200 flex justify-between items-center">
                      <span>Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer ${
                            !notification.is_read
                              ? "bg-orange-50 dark:bg-orange-900/20"
                              : ""
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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

              {/* User Avatar for Mobile */}
              <div className="relative dropdown-container w-full mt-2">
                <button
                  onClick={toggleAvatarDropdown}
                  className="w-10 h-10 flex items-center justify-center cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow transition"
                >
                  {getInitial()}
                </button>

                {isAvatarDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[180px] z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette size={16} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Theme
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleThemeChange("light")}
                          className={`px-3 py-1 text-xs rounded ${
                            theme === "light"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          } transition`}
                        >
                          Light
                        </button>
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className={`px-3 py-1 text-xs rounded ${
                            theme === "dark"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          } transition`}
                        >
                          Dark
                        </button>
                        <button
                          onClick={() => handleThemeChange("system")}
                          className={`px-3 py-1 text-xs rounded ${
                            theme === "system"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          } transition`}
                        >
                          System
                        </button>
                      </div>
                    </div>
                    <a
                      href="/home"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition"
                    >
                      <Home size={16} />
                      Back to Home
                    </a>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition"
                    >
                      <LayoutDashboard size={16} />
                      My Dashboard
                    </a>
                    <a
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition"
                    >
                      <User size={16} />
                      My Profile
                    </a>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center cursor-pointer gap-2 w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <a href="/login" className="w-full mt-2">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md w-full transition">
                Sign In
              </button>
            </a>
          )}
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
