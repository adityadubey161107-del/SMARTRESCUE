import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Navigation, 
  Bell, 
  User, 
  LogOut, 
  Activity, 
  Truck, 
  Building2, 
  Users, 
  PieChart, 
  Radio, 
  Menu, 
  X,
  History,
  CheckSquare
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleNav = () => {
    switch (user.role) {
      case 'PATIENT':
        return [
          { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'Request Ambulance', path: '/patient/emergency', icon: AlertTriangle, highlight: true },
          { name: 'My Emergencies', path: '/patient/dashboard#emergencies', icon: History },
          { name: 'Live Tracking', path: '/patient/dashboard#tracking', icon: Navigation },
          { name: 'Notifications', path: '/patient/dashboard#notifications', icon: Bell },
        ];
      case 'DRIVER':
        return [
          { name: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
          { name: 'Emergency Requests', path: '/driver/dashboard#requests', icon: AlertTriangle },
          { name: 'Active Trip', path: '/driver/dashboard#trip', icon: Navigation, highlight: true },
          { name: 'Trip History', path: '/driver/dashboard#history', icon: History },
        ];
      case 'HOSPITAL':
        return [
          { name: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
          { name: 'Incoming Ambulances', path: '/hospital/dashboard#incoming', icon: Truck, highlight: true },
          { name: 'Active Emergencies', path: '/hospital/dashboard#active', icon: Activity },
          { name: 'Unit Availability', path: '/hospital/dashboard#availability', icon: CheckSquare },
        ];
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Green Corridor Simulator', path: '/admin/green-corridor', icon: Radio, highlight: true },
          { name: 'Ambulance Fleet', path: '/admin/dashboard#ambulances', icon: Truck },
          { name: 'Hospitals', path: '/admin/dashboard#hospitals', icon: Building2 },
          { name: 'All Emergencies', path: '/admin/dashboard#emergencies', icon: Activity },
          { name: 'User Management', path: '/admin/dashboard#users', icon: Users },
        ];
      default:
        return [];
    }
  };

  const navItems = getRoleNav();

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-brand-600 text-white p-3.5 rounded-full shadow-lg hover:bg-brand-700 transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-slate-200 shrink-0
        transform lg:transform-none transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col justify-between
      `}>
        <div className="p-4 space-y-6">
          
          {/* User Role Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-brand-100 text-brand-700">
                {user.role} Portal
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (location.hash && item.path.includes(location.hash));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${item.highlight ? 'bg-emergency-50 text-emergency-700 border border-emergency-200 hover:bg-emergency-100' : ''}
                    ${!item.highlight && isActive ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : ''}
                    ${!item.highlight && !isActive ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' : ''}
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.highlight ? 'text-emergency-600' : isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-emergency-600 hover:bg-emergency-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
