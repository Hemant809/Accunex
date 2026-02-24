import { Link } from 'react-router-dom';
import { TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">ACCUNEX</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-teal-600 font-medium transition">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-teal-600 font-medium transition">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-teal-600 font-medium transition">
              Contact
            </Link>
            <Link
              to="/login"
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-teal-800 transition font-medium"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-teal-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-teal-600 font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-teal-600 font-medium"
            >
              Contact
            </Link>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2 rounded-lg text-center font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
