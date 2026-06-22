import { Bell, LogOut, Calculator, LineChart, Home, Info, Search } from "lucide-react";
import { Notification, UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Notification[];
  onSignOut: () => void;
  unreadCount: number;
  toggleNotifDropdown: () => void;
  showDropdown: boolean;
  markAllAsRead: () => void;
}

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  notifications,
  onSignOut,
  unreadCount,
  toggleNotifDropdown,
  showDropdown,
  markAllAsRead
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab("predict")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10 transition-transform active:scale-95">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Acre<span className="font-light text-slate-500">Valuation</span>
          </span>
        </div>

        {/* Desktop Navigation Paths */}
        {user && (
          <nav className="hidden md:flex space-x-1.5" id="nav-actions">
            <button
              onClick={() => setActiveTab("predict")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "predict"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-55 hover:text-slate-950 hover:bg-slate-50"
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Valuator Engine</span>
            </button>
            
            <button
              onClick={() => setActiveTab("trends")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "trends"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-55 hover:text-slate-950 hover:bg-slate-50"
              }`}
            >
              <LineChart className="h-4 w-4" />
              <span>Market Indexes</span>
            </button>

            <button
              onClick={() => setActiveTab("listings")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "listings"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-55 hover:text-slate-950 hover:bg-slate-50"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Active Listings</span>
            </button>
          </nav>
        )}

        {/* User profile & Alerts status */}
        <div className="flex items-center space-x-3.5">
          {user ? (
            <>
              {/* Notifications Alert Bell */}
              <div className="relative">
                <button
                  type="button"
                  id="notif-bell-btn"
                  onClick={toggleNotifDropdown}
                  className="relative p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <Bell className="h-5.5 w-5.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2.5 w-80 max-h-96 md:w-96 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-50 px-3.5 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alert Center</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="mt-1 divide-y divide-slate-50 overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No active listing alerts received.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 text-left transition-colors rounded-xl ${
                              !notif.read ? "bg-slate-50/70 hover:bg-slate-50" : "hover:bg-slate-50/40"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-semibold text-slate-900 leading-tight">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-rose-500" />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="mt-1 bg-slate-100 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider text-slate-400 inline-block font-mono">
                              Alert Log
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Circle */}
              <div className="flex items-center space-x-3 border-l border-slate-100 pl-3.5">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.displayName || "Demo User"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {user.email || "guest@acre.net"}
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    referrerPolicy="no-referrer"
                    alt={user.displayName || "Avatar"}
                    className="h-8.5 w-8.5 rounded-full object-cover ring-1 ring-slate-100"
                  />
                ) : (
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "G"}
                  </div>
                )}

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-400 font-mono tracking-tight">Requires Login</span>
          )}
        </div>
      </div>
    </header>
  );
}
