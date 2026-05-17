import React, { useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { api } from "../services/api";

interface LayoutProps {
  isAdmin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ isAdmin = false }) => {
  const location = useLocation();

  const navItems = useMemo(() => {
    return isAdmin
      ? [
          { label: "Dashboard", path: "/admin", exact: true },
          { label: "Complaints", path: "/admin/list", exact: false },
        ]
      : [
          { label: "My Dashboard", path: "/", exact: true },
          { label: "File Complaint", path: "/submit", exact: true },
          { label: "Tracker", path: "/tracker", exact: true },
        ];
  }, [isAdmin]);

  const isActive = (path: string, exact = true) => {
    return exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">

      {/* ✅ ADMIN SIDEBAR */}
      {isAdmin && (
        <aside className="w-64 bg-slate-900 text-white flex flex-col p-4">
          <h2 className="text-lg font-bold mb-6">Admin Panel</h2>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded text-sm ${
                  isActive(item.path, item.exact)
                    ? "bg-slate-700"
                    : "hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <button
              onClick={async () => await api.logout()}
              className="w-full bg-red-600 py-2 rounded text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* ✅ TOPBAR (ONLY FOR USER) */}
        {!isAdmin && (
          <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
            <Link to="/" className="font-bold text-lg">
              CivicResolve
            </Link>

            <div className="flex gap-3 items-center">
              <Link
                to="/admin"
                className="text-xs bg-slate-100 px-3 py-1 rounded"
              >
                Admin
              </Link>

              <button
                onClick={async () => await api.logout()}
                className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </header>
        )}

        {/* ✅ PAGE CONTENT */}
        <main className={`${isAdmin ? "p-6" : "mx-20 my-20"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;