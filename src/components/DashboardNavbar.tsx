"use client";

import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  Home,
  Search,
  Palette,
} from "lucide-react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Session } from "@supabase/supabase-js";

const DashboardNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const supabase = createClientComponentClient();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleAvatarDropdown = () =>
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAvatarDropdownOpen(false);
    alert("You have been logged out successfully.");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
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

      {/* Desktop Search Bar and Avatar */}
      <div className="hidden md:flex pr-40 items-center gap-4">
        {session && (
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </form>
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
          {session && (
            <form onSubmit={handleSearch} className="w-full mb-4">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </form>
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
