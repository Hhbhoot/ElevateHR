import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Briefcase,
} from "lucide-react";

interface LayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onTabChange,
  children,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isAdmins = user.role === "HR" || user.role === "Manager";

  // Define sidebar navigation items based on user roles
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: isAdmins,
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      show: isAdmins,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: UserIcon,
      show: true, // Everyone can view their own profile
    },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "HR":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "Manager":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-primary-500/10 text-primary-400 border border-primary-500/20";
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-bg text-slate-100">
      {/* --- Sidebar Desktop --- */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-card border-r border-dark-border">
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">
              ElevateHR
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Management Portal
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-500/15"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-dark-border bg-slate-900/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-primary-400">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                {user.name}
              </h2>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dark-border text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* --- Sidebar Mobile (Overlay / Drawer) --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <aside className="w-64 bg-dark-card flex flex-col h-full border-r border-dark-border animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-500" />
                <span className="font-bold text-white text-lg">ElevateHR</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg border border-dark-border hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {menuItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-500/15"
                          : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
            </nav>

            <div className="p-4 border-t border-dark-border">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dark-border text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- Main Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-dark-card border-b border-dark-border">
          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-dark-border hover:bg-slate-800 md:hidden text-slate-300 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-wide capitalize">
              {currentTab === "employees"
                ? "Employee Directory"
                : currentTab === "profile"
                  ? "My Profile"
                  : "Dashboard"}
            </h1>
          </div>

          {/* User Info Bar */}
          <div className="flex items-center gap-4">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}
            >
              {user.role}
            </span>
            <div className="h-8 w-px bg-dark-border hidden sm:block"></div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-400 font-medium">
                Active Department
              </span>
              <span className="text-sm font-semibold text-white">
                {user.department}
              </span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-dark-bg">
          <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};
