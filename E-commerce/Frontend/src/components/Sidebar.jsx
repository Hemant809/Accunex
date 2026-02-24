import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileBarChart,
  Users,
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  console.log("Sidebar - User object:", user);
  console.log("Sidebar - Shop data:", user?.shop);

  const businessName = user?.shop?.name || "Your Business";
  const userRole = user?.role || "staff";

  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-neutral-700 hover:bg-neutral-100 hover:text-teal-600";

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
    <div className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-neutral-200 p-6 flex flex-col overflow-y-auto">

      {/* Business Info */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 rounded-xl shadow-lg">
          <h1 className="text-lg font-bold text-white tracking-wide truncate">
            {businessName}
          </h1>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-white/20 text-white border border-white/30">
            {userRole.toUpperCase()} PANEL
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-2 flex-1">

        {menuItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}

      </div>

      <div className="pt-6 border-t border-neutral-200 text-xs text-neutral-500">
        © {new Date().getFullYear()} {businessName}
      </div>

    </div>
  );
}
