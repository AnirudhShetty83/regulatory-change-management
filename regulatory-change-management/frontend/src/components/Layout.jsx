import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="text-xl font-semibold">Regulatory Tool</Link>
            <nav className="hidden sm:flex space-x-3 text-sm text-gray-600">
              <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
              <Link to="/changes" className="hover:text-gray-900">Changes</Link>
            </nav>
          </div>
          <div>
            {token ? (
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600">Logout</button>
            ) : (
              <Link to="/login" className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600">Login</Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

      <footer className="mt-12 py-6 border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-500">© {new Date().getFullYear()} Regulatory Change Management</div>
      </footer>
    </div>
  );
}
