import React, { useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
// import { api } from "../services/api";
import { useAuthContext } from "../hooks/context/AuthContext";

const Layout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const isAdmin = user?.role === "admin";

  const navItems = useMemo(() => {
    return isAdmin
      ? [
          { label: "Complaints", path: "/admin", exact: true },
          { label: "Analytics", path: "/admin/analytics", exact: true },
          { label: "Users", path: "/admin/users", exact: true },
        ]
      : [
          { label: "My Dashboard", path: "/dashboard", exact: true },
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
    <div className="min-h-screen flex flex-col">
      {/* ✅ ADMIN NAVBAR */}
      {isAdmin && (
        <header className="h-auto py-4 bg-slate-900 flex justify-around items-center text-white">
          <Link to="/admin">
            <h2 className="text-blue-400 text-lg font-bold cursor-pointer">
              Apex Compliant
            </h2>
          </Link>

          <nav className="flex items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mx-1 px-3 py-2 rounded text-sm ${
                  isActive(item.path, item.exact)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={logout}
            className="bg-red-600 py-2 px-3 rounded text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </header>
      )}

      {/* ✅ USER NAVBAR */}
      {!isAdmin && (
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg text-blue-600">
            Apex Compliant
          </h2>

          <div className="flex gap-3 items-center">
            <nav className="flex items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mx-1 px-3 py-2 rounded text-sm ${
                    isActive(item.path, item.exact)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Only show if admin */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-sm bg-slate-100 px-3 py-1 rounded"
              >
                Admin Mode
              </Link>
            )}

            <button
              onClick={logout}
              className="text-sm py-2 px-3 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>
      )}

      <main className={`${isAdmin ? "p-6" : "mx-10 my-10"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;