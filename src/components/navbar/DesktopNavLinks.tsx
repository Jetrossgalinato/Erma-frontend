"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  User,
} from "lucide-react";
import type {
  DoneNotification,
  RequestNotification,
  ReturnNotification,
} from "@/app/dashboard-request/utils/helpers";
import type { NavbarUserData, PersonalNotification } from "./types";

type DesktopNavLinksProps = {
  pathname: string;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  currentRole: string | null;
  isFaculty: boolean;
  userData: NavbarUserData | null;
  getInitial: () => string;

  isResourcesOpen: boolean;
  toggleResources: () => void;

  isAvatarDropdownOpen: boolean;
  toggleAvatarDropdown: () => void;

  isNotificationDropdownOpen: boolean;
  toggleNotificationDropdown: () => void;
  closeNotificationDropdown: () => void;

  handleLogout: () => void;

  pendingAccountRequestsCount: number;

  notifications: PersonalNotification[];
  unreadCount: number;
  clearAllNotifications: () => void;
  onNotificationClick: (id: string, title: string) => void;

  returnNotifications: ReturnNotification[];
  returnNotificationsCount: number;
  doneNotifications: DoneNotification[];
  doneNotificationsCount: number;
  requestNotifications: RequestNotification[];
  requestNotificationsCount: number;

  activeNotificationTab: "general" | "returns" | "done" | "requests";
  setActiveNotificationTab: (
    tab: "general" | "returns" | "done" | "requests",
  ) => void;
};

export default function DesktopNavLinks({
  pathname,
  isAuthenticated,
  isSuperAdmin,
  currentRole,
  isFaculty,
  userData,
  getInitial,
  isResourcesOpen,
  toggleResources,
  isAvatarDropdownOpen,
  toggleAvatarDropdown,
  isNotificationDropdownOpen,
  toggleNotificationDropdown,
  closeNotificationDropdown,
  handleLogout,
  pendingAccountRequestsCount,
  notifications,
  unreadCount,
  clearAllNotifications,
  onNotificationClick,
  returnNotifications,
  returnNotificationsCount,
  doneNotifications,
  doneNotificationsCount,
  requestNotifications,
  requestNotificationsCount,
  activeNotificationTab,
  setActiveNotificationTab,
}: DesktopNavLinksProps) {
  const router = useRouter();

  const totalBadgeCount =
    unreadCount +
    returnNotificationsCount +
    doneNotificationsCount +
    requestNotificationsCount;

  return (
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
            {totalBadgeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalBadgeCount > 99 ? "99+" : totalBadgeCount}
              </span>
            )}
          </button>

          {isNotificationDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[350px] max-h-[450px] overflow-hidden z-50">
              {isSuperAdmin || currentRole === "Admin" ? (
                <>
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
                                onNotificationClick(
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
                                closeNotificationDropdown();
                                router.push("/dashboard-request?tab=borrowing");
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
                                closeNotificationDropdown();
                                router.push("/dashboard-request?tab=borrowing");
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
                                closeNotificationDropdown();
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
                                closeNotificationDropdown();
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
                              key={`${notification.request_type}-${notification.id}`}
                              onClick={() => {
                                closeNotificationDropdown();
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
                                      : notification.request_type === "booking"
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
                                      notification.request_type === "borrowing"
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
                                closeNotificationDropdown();
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
                          onNotificationClick(
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
  );
}
