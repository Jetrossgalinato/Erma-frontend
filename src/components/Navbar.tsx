import React, { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home"); // Track active link

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleResources = () => setIsResourcesOpen(!isResourcesOpen);
  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
    setIsOpen(false); // Close mobile menu when link is clicked
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

        {/* Resources Dropdown */}
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

        {/* Sign In Button */}
        <a href="login">
          <button
            onClick={() => handleLinkClick("Sign In")}
            className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            Sign In
          </button>
        </a>
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

          {/* Mobile Resources Dropdown */}
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

          {/* Mobile Sign In Button */}
          <a href="login">
            <button
              onClick={() => handleLinkClick("Sign In")}
              className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors duration-300 mt-2 w-full"
            >
              Sign In
            </button>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
