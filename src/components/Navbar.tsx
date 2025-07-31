import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="w-full bg-white shadow-sm px-6 py-1 flex justify-between items-center">
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
      <div className="hidden md:flex pr-78 gap-6 text-gray-600">
        <a href="#" className="hover:text-black transition">
          Home
        </a>
        <a href="#" className="hover:text-black transition">
          About
        </a>
        <a href="#" className="hover:text-black transition">
          Contact
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
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-start px-6 py-4 md:hidden">
          <a href="#" className="py-2 text-gray-700">
            Home
          </a>
          <a href="#" className="py-2 text-gray-700">
            About
          </a>
          <a href="#" className="py-2 text-gray-700">
            Contact
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
