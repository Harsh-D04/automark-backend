import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function Navigation({ onSidebarToggle }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/generator", label: "Generator" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            🚀 AutoMark AI
          </Link>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/50"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-gray-300 hover:text-white border border-white/20"
              title="Open Profile"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

