import { ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  return (
    <div className="w-full bg-white border-b border-neutral-200 px-12 py-4 flex justify-end items-center shadow-sm">

      {/* Right */}
      <div className="flex items-center gap-8">

        {/* Profile Section */}
        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <span className="text-sm text-neutral-700 group-hover:text-teal-600 transition">
              {user?.name || "User"}
            </span>

            <ChevronDown
              size={16}
              className="text-neutral-500 group-hover:text-teal-600 transition"
            />
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-50">
              <div
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className="px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer transition flex items-center gap-2"
              >
                <User size={16} />
                View Profile
              </div>

              <div
                onClick={handleLogout}
                className="px-4 py-3 text-sm hover:bg-rose-50 cursor-pointer text-rose-600 transition flex items-center gap-2 border-t border-neutral-200"
              >
                <LogOut size={16} />
                Logout
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;
