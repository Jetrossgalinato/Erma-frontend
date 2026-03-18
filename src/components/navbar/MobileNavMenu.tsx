"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import type {
  DoneNotification,
  RequestNotification,
  ReturnNotification,
} from "@/app/dashboard-request/utils/helpers";
import type { PersonalNotification } from "./types";

type MobileNavMenuProps = {
  isOpen: boolean;
  pathname: string;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  currentRole: string | null;
  isFaculty: boolean;
  getInitial: () => string;

  isResourcesOpen: boolean;
  toggleResources: () => void;
  closeResources: () => void;

  isAvatarDropdownOpen: boolean;
  toggleAvatarDropdown: () => void;

  isNotificationDropdownOpen: boolean;
  toggleNotificationDropdown: () => void;

  closeMenu: () => void;

  handleLogout: () => void;

  notifications: PersonalNotification[];
  unreadCount: number;
  clearAllNotifications: () => void;
  markNotificationAsRead: (id: string) => void;

  returnNotificationsCount: number;
  doneNotificationsCount: number;
  requestNotificationsCount: number;

  // These arrays aren’t rendered on mobile, but are kept for badge parity.
  returnNotifications: ReturnNotification[];
  doneNotifications: DoneNotification[];
  requestNotifications: RequestNotification[];
};

export default function MobileNavMenu({
  isOpen,
  pathname,
  isAuthenticated,
  isSuperAdmin,
  currentRole,
  isFaculty,
  getInitial,
  isResourcesOpen,
  toggleResources,
  closeResources,
  isAvatarDropdownOpen,
  toggleAvatarDropdown,
  isNotificationDropdownOpen,
  toggleNotificationDropdown,
  closeMenu,
  handleLogout,
  notifications,
  unreadCount,
  clearAllNotifications,
  markNotificationAsRead,
  returnNotificationsCount,
  doneNotificationsCount,
  requestNotificationsCount,
}: MobileNavMenuProps) {
  if (!isOpen) return null;

  const totalBadgeCount =
    unreadCount +
    returnNotificationsCount +
    doneNotificationsCount +
    requestNotificationsCount;

  return (
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
        {(isResourcesOpen || isOpen) && (
          <div className="pl-4 flex flex-col">
            <Link
              href="/equipment"
              className={`py-1 text-gray-600 ${
                pathname.startsWith("/equipment") ? "text-orange-500" : ""
              }`}
              onClick={() => {
                closeMenu();
                closeResources();
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
                closeMenu();
                closeResources();
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
                closeMenu();
                closeResources();
              }}
            >
              Supplies
            </Link>
          </div>
        )}
      </div>

      {isAuthenticated && isSuperAdmin && (
        <Link
          href="/requests"
          className={`py-2 text-gray-700 ${
            pathname === "/requests" ? "text-orange-500" : ""
          }`}
          onClick={closeMenu}
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
              {!isFaculty && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                  onClick={closeMenu}
                >
                  <LayoutDashboard size={16} />
                  My Dashboard
                </Link>
              )}
              <Link
                href="/my-requests"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                onClick={closeMenu}
              >
                <FileText size={16} />
                My Requests
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                onClick={closeMenu}
              >
                <User size={16} />
                My Profile
              </Link>
              <hr className="border-gray-200" />
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
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
            {totalBadgeCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalBadgeCount > 99 ? "99+" : totalBadgeCount}
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
                        {new Date(notification.created_at).toLocaleDateString()}
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
  );
}
