import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ambulance, Bell, User as UserIcon, LogOut, LayoutDashboard, Radio } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, notifications, getDashboardRoute } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardRoute = user ? getDashboardRoute(user.role) : '/';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-emergency-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-emergency-600/20">
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Smart<span className="text-emergency-600">Rescue</span></span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                AI Response
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className={`hover:text-slate-900 transition-colors ${location.pathname === '/' ? 'text-brand-600 font-semibold' : ''}`}>
              Home
            </Link>
            <a href="/#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="/#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            {user && (
              <Link 
                to={dashboardRoute} 
                className={`flex items-center gap-1.5 hover:text-brand-600 transition-colors ${location.pathname.includes('/dashboard') ? 'text-brand-600 font-semibold' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link 
                to="/admin/green-corridor" 
                className="flex items-center gap-1.5 text-emerald-600 font-semibold hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                Green Corridor
              </Link>
            )}
          </nav>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-emergency-600 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 font-semibold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                        <span>Notifications</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{notifications.length}</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-6 text-center text-xs text-slate-400">No new notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-500 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block text-left pr-1">
                      <p className="text-xs font-semibold text-slate-800 leading-none">{user.name}</p>
                      <p className="text-[10px] font-medium text-brand-600 leading-none mt-1 uppercase">{user.role}</p>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to={dashboardRoute}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        My Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-emergency-600 hover:bg-emergency-50 transition-colors border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
