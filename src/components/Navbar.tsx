"use client";

import React, { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Session } from "@supabase/supabase-js";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClientComponentClient();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleResources = () => setIsResourcesOpen(!isResourcesOpen);
  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
    setIsOpen(false);
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

  const getInitial = () => {
    const name = session?.user?.user_metadata?.name || session?.user?.email;
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <nav className="w-full bg-white shadow-sm px-6 md:py-1 flex justify-between items-center relative">
      <div className="flex items-center pl-78">
        <Image
          src="/images/logocircle.png"
          alt="Logo"
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
        />
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex pr-60 gap-6 text-gray-600 items-center">
        <a
          href="home"
          onClick={() => handleLinkClick("Home")}
          className={`hover:text-black transition ${
            activeLink === "Home" ? "text-orange-500" : ""
          }`}
        >
          Home
        </a>

        <div className="relative">
          <button
            onClick={toggleResources}
            className={`flex items-center gap-1 hover:text-black transition ${
              activeLink === "Resources" ? "text-orange-500" : ""
            }`}
          >
            Resources
            <ChevronDown size={16} />
          </button>

          {isResourcesOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[120px] z-50">
              <a
                href="#"
                onClick={() => handleLinkClick("Equipment")}
                className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition ${
                  activeLink === "Equipment" ? "text-orange-500" : ""
                }`}
              >
                Equipment
              </a>
              <a
                href="#"
                onClick={() => handleLinkClick("Facilities")}
                className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition ${
                  activeLink === "Facilities" ? "text-orange-500" : ""
                }`}
              >
                Facilities
              </a>
            </div>
          )}
        </div>

        <a
          href="#"
          onClick={() => handleLinkClick("Requests List")}
          className={`hover:text-black transition ${
            activeLink === "Requests List" ? "text-orange-500" : ""
          }`}
        >
          Requests List
        </a>

        {/* Avatar or Sign In */}
        {session ? (
          <div className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white font-semibold rounded-full shadow">
            {getInitial()}
          </div>
        ) : (
          <a href="/login">
            <button
              onClick={() => handleLinkClick("Sign In")}
              className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors duration-300"
            >
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
            href="home"
            onClick={() => handleLinkClick("Home")}
            className={`py-2 text-gray-700 ${
              activeLink === "Home" ? "text-orange-500" : ""
            }`}
          >
            Home
          </a>

          <div className="w-full">
            <button
              onClick={toggleResources}
              className={`flex items-center justify-between w-full py-2 text-gray-700 ${
                activeLink === "Resources" ? "text-orange-500" : ""
              }`}
            >
              Resources
              <ChevronDown size={16} />
            </button>
            {isResourcesOpen && (
              <div className="pl-4 flex flex-col">
                <a
                  href="#"
                  onClick={() => handleLinkClick("Equipment")}
                  className={`py-1 text-gray-600 ${
                    activeLink === "Equipment" ? "text-orange-500" : ""
                  }`}
                >
                  Equipment
                </a>
                <a
                  href="#"
                  onClick={() => handleLinkClick("Facilities")}
                  className={`py-1 text-gray-600 ${
                    activeLink === "Facilities" ? "text-orange-500" : ""
                  }`}
                >
                  Facilities
                </a>
              </div>
            )}
          </div>

          <a
            href="#"
            onClick={() => handleLinkClick("Requests List")}
            className={`py-2 text-gray-700 ${
              activeLink === "Requests List" ? "text-orange-500" : ""
            }`}
          >
            Requests List
          </a>

          {/* Mobile Avatar or Sign In */}
          {session ? (
            <div className="w-10 h-10 mt-2 flex items-center justify-center bg-orange-500 text-white font-semibold rounded-full shadow">
              {getInitial()}
            </div>
          ) : (
            <a href="/login" className="w-full mt-2">
              <button
                onClick={() => handleLinkClick("Sign In")}
                className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors duration-300 w-full"
              >
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
