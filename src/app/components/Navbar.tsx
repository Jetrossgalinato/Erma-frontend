import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-semibold text-gray-800">MyApp</div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6 text-gray-600">
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
