import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoBanner } from '../components/DemoBanner';
import { Ambulance, Lock, Mail, ArrowRight, UserCheck, Key, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      const targetRoute = getDashboardRoute(loggedUser.role);
      navigate(targetRoute);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(demoEmail, 'password123');
      const targetRoute = getDashboardRoute(loggedUser.role);
      navigate(targetRoute);
    } catch (err) {
      setError('Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoBanner />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          
          {/* Logo Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="bg-emergency-600 text-white p-2 rounded-xl">
                <Ambulance className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900">Smart<span className="text-emergency-600">Rescue</span></span>
            </Link>
            <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-xs text-slate-500">Access role-based emergency management portal</p>
          </div>

          {error && (
            <div className="p-3.5 bg-emergency-50 border border-emergency-200 text-emergency-700 text-xs font-semibold rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              ⚡ Quick Demo One-Click Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patient@example.com')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-left border border-slate-200 transition-colors"
              >
                <span className="block text-xs font-bold text-slate-800">👤 Patient</span>
                <span className="block text-[10px] text-slate-500 truncate">patient@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('driver@example.com')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-left border border-slate-200 transition-colors"
              >
                <span className="block text-xs font-bold text-slate-800">🚑 Driver</span>
                <span className="block text-[10px] text-slate-500 truncate">driver@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('hospital@example.com')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-left border border-slate-200 transition-colors"
              >
                <span className="block text-xs font-bold text-slate-800">🏥 Hospital</span>
                <span className="block text-[10px] text-slate-500 truncate">hospital@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@example.com')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-left border border-slate-200 transition-colors"
              >
                <span className="block text-xs font-bold text-slate-800">⚙️ Admin</span>
                <span className="block text-[10px] text-slate-500 truncate">admin@example.com</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">Demo password: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">password123</code></p>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
