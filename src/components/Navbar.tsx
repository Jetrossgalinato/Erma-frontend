"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import { useAuthStore } from "@/store";
import { useAlert } from "@/contexts/AlertContext";

import DesktopNavLinks from "@/components/navbar/DesktopNavLinks";
import MobileNavMenu from "@/components/navbar/MobileNavMenu";
import { useNavbarUserData } from "@/components/navbar/useNavbarUserData";
import { useNavbarNotifications } from "@/components/navbar/useNavbarNotifications";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();
  const { showAlert } = useAlert();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);

  const {
    userData,
    approvedAccRole,
    currentRole,
    isSuperAdmin,
    isFaculty,
    getInitial,
    clearUserData,
  } = useNavbarUserData(user);

  const push = useCallback((href: string) => router.push(href), [router]);

  const notifications = useNavbarNotifications({
    isAuthenticated,
    user,
    approvedAccRole,
    isSuperAdmin,
    apiBaseUrl: API_BASE_URL,
    push,
  });

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const toggleResources = () => {
    setIsResourcesOpen((prev) => !prev);
    setIsAvatarDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
  };

  const toggleAvatarDropdown = () => {
    setIsAvatarDropdownOpen((prev) => !prev);
    setIsResourcesOpen(false);
    setIsNotificationDropdownOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen((prev) => !prev);
    setIsResourcesOpen(false);
    setIsAvatarDropdownOpen(false);
  };

  const handleLogout = () => {
    logoutFromStore();
    clearUserData();
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
    router.prefetch("/dashboard-request");
    router.prefetch("/my-requests");
    router.prefetch("/profile");
    router.prefetch("/login");
  }, [router]);

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

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const closeResources = useCallback(() => setIsResourcesOpen(false), []);
  const closeNotificationDropdown = useCallback(
    () => setIsNotificationDropdownOpen(false),
    [],
  );

  const onNotificationClick = useCallback(
    async (id: string, title: string) => {
      await notifications.handleNotificationClick(id, title, () => {
        closeNotificationDropdown();
      });
    },
    [notifications, closeNotificationDropdown],
  );

  return (
    <nav className="w-full bg-white shadow-sm px-6 md:py-1 flex justify-between items-center relative">
      <div className="flex items-center pl-4 md:pl-40 w-full md:w-auto justify-start">
        <Image
          src="/images/logocircle.png"
          alt="Logo"
          width={80}
          height={80}
          className="h-15 w-15 md:h-20 md:w-20 object-contain"
          priority
        />
      </div>

      <DesktopNavLinks
        pathname={pathname}
        isAuthenticated={isAuthenticated}
        isSuperAdmin={isSuperAdmin}
        currentRole={currentRole}
        isFaculty={isFaculty}
        userData={userData}
        getInitial={getInitial}
        isResourcesOpen={isResourcesOpen}
        toggleResources={toggleResources}
        isAvatarDropdownOpen={isAvatarDropdownOpen}
        toggleAvatarDropdown={toggleAvatarDropdown}
        isNotificationDropdownOpen={isNotificationDropdownOpen}
        toggleNotificationDropdown={toggleNotificationDropdown}
        closeNotificationDropdown={closeNotificationDropdown}
        handleLogout={handleLogout}
        pendingAccountRequestsCount={notifications.pendingAccountRequestsCount}
        notifications={notifications.notifications}
        unreadCount={notifications.unreadCount}
        clearAllNotifications={notifications.clearAllNotifications}
        onNotificationClick={onNotificationClick}
        returnNotifications={notifications.returnNotifications}
        returnNotificationsCount={notifications.returnNotificationsCount}
        doneNotifications={notifications.doneNotifications}
        doneNotificationsCount={notifications.doneNotificationsCount}
        requestNotifications={notifications.requestNotifications}
        requestNotificationsCount={notifications.requestNotificationsCount}
        activeNotificationTab={notifications.activeNotificationTab}
        setActiveNotificationTab={notifications.setActiveNotificationTab}
      />

      <button
        className="md:hidden text-gray-600 px-4"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <MobileNavMenu
        isOpen={isOpen}
        pathname={pathname}
        isAuthenticated={isAuthenticated}
        isSuperAdmin={isSuperAdmin}
        currentRole={currentRole}
        isFaculty={isFaculty}
        getInitial={getInitial}
        isResourcesOpen={isResourcesOpen}
        toggleResources={toggleResources}
        closeResources={closeResources}
        isAvatarDropdownOpen={isAvatarDropdownOpen}
        toggleAvatarDropdown={toggleAvatarDropdown}
        isNotificationDropdownOpen={isNotificationDropdownOpen}
        toggleNotificationDropdown={toggleNotificationDropdown}
        closeMenu={closeMenu}
        handleLogout={handleLogout}
        notifications={notifications.notifications}
        unreadCount={notifications.unreadCount}
        clearAllNotifications={notifications.clearAllNotifications}
        markNotificationAsRead={notifications.markNotificationAsRead}
        returnNotifications={notifications.returnNotifications}
        returnNotificationsCount={notifications.returnNotificationsCount}
        doneNotifications={notifications.doneNotifications}
        doneNotificationsCount={notifications.doneNotificationsCount}
        requestNotifications={notifications.requestNotifications}
        requestNotificationsCount={notifications.requestNotificationsCount}
      />
    </nav>
  );
};

export default Navbar;
