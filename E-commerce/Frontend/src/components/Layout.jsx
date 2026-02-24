import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-72">

        {/* Navbar */}
        <div className="sticky top-0 z-40">
          <Navbar />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default Layout;
