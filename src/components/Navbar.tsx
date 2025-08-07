"use client";

import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Session } from "@supabase/supabase-js";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClientComponentClient();
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleResources = () => setIsResourcesOpen(!isResourcesOpen);
  const toggleAvatarDropdown = () =>
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAvatarDropdownOpen(false);
    alert("You have been logged out successfully.");
    window.location.href = "/home";
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setIsResourcesOpen(false);
        setIsAvatarDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitial = () => {
    const name = session?.user?.user_metadata?.name || session?.user?.email;
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <nav className="w-full bg-white shadow-sm px-6 md:py-1 flex justify-between items-center relative">
      <div className="flex items-center pl-40">
        <Image
          src="/images/logocircle.png"
          alt="Logo"
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
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
            </div>
          )}
        </div>

        {session && (
          <a
            href="/requests"
            className={`hover:text-black transition-colors duration-300 ${
              pathname === "/requests" ? "text-orange-500" : ""
            }`}
          >
            Account Requests
          </a>
        )}

        {session ? (
          <div className="relative dropdown-container">
            <button
              onClick={toggleAvatarDropdown}
              className="w-10 h-10 flex items-center justify-center cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow hover:shadow-md transition duration-300"
            >
              {getInitial()}
            </button>

            {isAvatarDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] z-50">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  <LayoutDashboard size={16} />
                  My Dashboard
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
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-600"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-start px-6 py-4 md:hidden z-50">
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
            >
              Resources
              <ChevronDown size={16} />
            </button>
            {isResourcesOpen && (
              <div className="pl-4 flex flex-col">
                <a
                  href="/equipment"
                  className={`py-1 text-gray-600 ${
                    pathname.startsWith("/equipment") ? "text-orange-500" : ""
                  }`}
                >
                  Equipment
                </a>
                <a
                  href="/facilities"
                  className={`py-1 text-gray-600 ${
                    pathname.startsWith("/facilities") ? "text-orange-500" : ""
                  }`}
                >
                  Facilities
                </a>
              </div>
            )}
          </div>

          {session && (
            <a
              href="/requests"
              className={`py-2 text-gray-700 ${
                pathname === "/requests" ? "text-orange-500" : ""
              }`}
            >
              Account Requests
            </a>
          )}

          {session ? (
            <div className="relative dropdown-container w-full mt-2">
              <button
                onClick={toggleAvatarDropdown}
                className="w-10 h-10 flex items-center justify-center cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow transition"
              >
                {getInitial()}
              </button>

              {isAvatarDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] z-50">
                  <a
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
                  >
                    <LayoutDashboard size={16} />
                    My Dashboard
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
