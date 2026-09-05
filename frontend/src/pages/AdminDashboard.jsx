import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, ambulanceAPI, hospitalAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DemoBanner } from '../components/DemoBanner';
import { MapView } from '../components/MapView';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { Loading } from '../components/Loading';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { 
  Users, Truck, Building2, Activity, Clock, ShieldCheck, Radio, ChevronRight, BarChart3, MapPin 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, ambRes, hospRes, usersRes, emRes] = await Promise.all([
        adminAPI.getStatistics(),
        ambulanceAPI.getAll(),
        hospitalAPI.getAll(),
        adminAPI.getUsers(),
        adminAPI.getEmergencies()
      ]);

      setStats(statsRes.data);
      setAmbulances(ambRes.data);
      setHospitals(hospRes.data);
      setUsersList(usersRes.data);
      setEmergencies(emRes.data);
    } catch (err) {
      console.warn("Error loading admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar /><Loading text="Loading System Analytics & Fleet Control..." /></div>;

  const metrics = stats?.metrics || {};

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-tech-grid">
      <DemoBanner />
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">System Analytics & Fleet Command</h1>
              <p className="text-xs text-slate-500 mt-1">SmartRescue Central Control & Response Management</p>
            </div>

            <Link
              to="/admin/green-corridor"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Launch Green Corridor Simulator</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">{metrics.total_users || 0}</p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fleet</span>
              <p className="text-2xl font-black text-brand-600 font-mono mt-1">{metrics.total_ambulances || 0}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Units</span>
              <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{metrics.available_ambulances || 0}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Requests</span>
              <p className="text-2xl font-black text-emergency-600 font-mono mt-1">{metrics.active_emergencies || 0}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hospitals</span>
              <p className="text-2xl font-black text-purple-600 font-mono mt-1">{metrics.total_hospitals || 0}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Cases</span>
              <p className="text-2xl font-black text-amber-600 font-mono mt-1">{metrics.todays_requests || 0}</p>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Requests by Day */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                Emergency Requests by Day
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.requests_by_day || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Priority Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emergency-600" />
                Emergency Triage Priority Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.priority_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(stats?.priority_distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Ambulance Utilization */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Ambulance Fleet Utilization
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.ambulance_utilization || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Average Response Times */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Average Dispatch Response Time (Minutes)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.avg_response_times || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time_period" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg_minutes" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Live Fleet Map */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emergency-600" />
              Live City Fleet & Hospital Network Map
            </h3>
            <MapView
              allAmbulances={ambulances}
              allHospitals={hospitals}
              height="420px"
            />
          </div>

          {/* Management Tables */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Emergency Requests Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Ambulance</th>
                    <th className="p-3">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emergencies.slice(0, 8).map((em) => (
                    <tr key={em.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">#{em.id}</td>
                      <td className="p-3 font-semibold text-slate-800">{em.emergency_type}</td>
                      <td className="p-3"><PriorityBadge level={em.priority_level} /></td>
                      <td className="p-3"><StatusBadge status={em.status} /></td>
                      <td className="p-3 font-medium">{em.ambulance ? em.ambulance.vehicle_number : 'Unassigned'}</td>
                      <td className="p-3 text-slate-400">{new Date(em.requested_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
