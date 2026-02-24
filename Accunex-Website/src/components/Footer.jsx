import { Link } from 'react-router-dom';
import { TrendingUp, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold">ACCUNEX</span>
            </div>
            <p className="text-gray-400 text-sm">
              Complete business management solution for modern enterprises.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-teal-400 transition text-sm">
                Home
              </Link>
              <Link to="/about" className="block text-gray-400 hover:text-teal-400 transition text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-teal-400 transition text-sm">
                Contact
              </Link>
              <Link to="/login" className="block text-gray-400 hover:text-teal-400 transition text-sm">
                Login
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Inventory Management</p>
              <p>Sales Tracking</p>
              <p>Financial Reports</p>
              <p>Staff Management</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>hemantxverma07@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+91 8357071540</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 Accunex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
