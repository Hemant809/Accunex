import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileBarChart,
  Users,
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  console.log("Sidebar - User object:", user);
  console.log("Sidebar - Shop data:", user?.shop);

  const businessName = user?.shop?.name || "Your Business";
  const userRole = user?.role || "staff";

  const linkClass =
    "flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 text-neutral-700 hover:bg-neutral-100 hover:text-teal-600 text-sm sm:text-base";

  const activeClass =
    "bg-teal-50 text-teal-600 border border-teal-100";

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={18} />,
      roles: ["admin", "accountant", "staff"],
    },
    {
      name: "Products",
      path: "/products",
      icon: <Package size={18} />,
      roles: ["admin", "accountant", "staff"],
    },
    {
      name: "Purchase",
      path: "/purchase",
      icon: <Truck size={18} />,
      roles: ["admin", "accountant", "staff"],
    },
    {
      name: "Sales",
      path: "/sales",
      icon: <ShoppingCart size={18} />,
      roles: ["admin", "accountant", "staff"],
    },
    {
      name: "Receipt",
      path: "/receipt",
      icon: <ArrowDownCircle size={18} />,
      roles: ["admin", "accountant"],
    },
    {
      name: "Payment",
      path: "/payment",
      icon: <ArrowUpCircle size={18} />,
      roles: ["admin", "accountant"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileBarChart size={18} />,
      roles: ["admin", "accountant"],
    },
    {
      name: "Staff",
      path: "/staff",
      icon: <Users size={18} />,
      roles: ["admin", "accountant"],
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-teal-600 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 sm:w-72 bg-white border-r border-neutral-200 p-4 sm:p-6 flex flex-col overflow-y-auto z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

      {/* Business Info */}
      <div className="mb-6 sm:mb-10">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
            {businessName}
          </h1>
          <span className="inline-block mt-1.5 sm:mt-2 text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 text-white border border-white/30">
            {userRole.toUpperCase()} PANEL
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-1.5 sm:space-y-2 flex-1">

        {menuItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}

      </div>

      <div className="pt-4 sm:pt-6 border-t border-neutral-200 text-xs text-neutral-500">
        © {new Date().getFullYear()} {businessName}
      </div>

    </div>
    </>
  );
}
