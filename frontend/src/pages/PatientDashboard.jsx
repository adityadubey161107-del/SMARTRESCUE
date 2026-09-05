import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { emergencyAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DemoBanner } from '../components/DemoBanner';
import { EmergencyButton } from '../components/EmergencyButton';
import { EmergencyCard } from '../components/EmergencyCard';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { Loading } from '../components/Loading';
import { MapPin, Navigation, Clock, Activity, AlertCircle, History, ChevronRight } from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Location detection
  const [currentLocation, setCurrentLocation] = useState({ lat: 12.9716, lng: 77.5946, label: "Bengaluru City Center (Demo)" });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const res = await emergencyAPI.list();
      setEmergencies(res.data);
    } catch (err) {
      console.error("Failed to load patient emergencies", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    setLocating(true);
    setLocError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: "Detected Current Device Location"
          });
          setLocating(false);
        },
        (err) => {
          console.warn("Geolocation failed", err);
          setLocError("Location permission denied or unavailable. Using preset demo location.");
          setLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocError("Geolocation not supported by browser. Using preset demo location.");
      setLocating(false);
    }
  };

  const activeEmergency = emergencies.find(e => 
    ["PENDING", "ASSIGNED", "EN_ROUTE_PATIENT", "PATIENT_PICKED_UP", "EN_ROUTE_HOSPITAL"].includes(e.status)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-tech-grid">
      <DemoBanner />
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Welcome, {user?.name}</h1>
              <p className="text-xs text-slate-500 mt-1">SmartRescue Emergency Response & Dispatch Hub</p>
            </div>
            
            {/* Quick Location Bar */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs w-full md:w-auto">
              <MapPin className="w-4 h-4 text-emergency-600 shrink-0" />
              <div className="overflow-hidden">
                <p className="font-bold text-slate-800 truncate">{currentLocation.label}</p>
                <p className="text-[10px] text-slate-400 font-mono">Lat: {currentLocation.lat.toFixed(4)}, Lon: {currentLocation.lng.toFixed(4)}</p>
              </div>
              <button
                onClick={handleDetectLocation}
                disabled={locating}
                className="ml-auto px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-semibold text-[11px] text-slate-700 transition-colors shrink-0"
              >
                {locating ? "Locating..." : "GPS Detect"}
              </button>
            </div>
          </div>

          {locError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
              ⚠️ {locError}
            </div>
          )}

          {/* Active Emergency Alert Banner if present */}
          {activeEmergency && (
            <div className="bg-emergency-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
                    Emergency #{activeEmergency.id} ACTIVE
                  </span>
                  <PriorityBadge level={activeEmergency.priority_level} />
                </div>
                <span className="text-xs font-semibold bg-black/20 px-3 py-1 rounded-full">
                  Status: {activeEmergency.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black">{activeEmergency.emergency_type}</h2>
                <p className="text-xs text-white/80 mt-1">{activeEmergency.description || 'Dispatch in progress...'}</p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-white/20 text-xs font-medium">
                {activeEmergency.ambulance && (
                  <span>🚑 Ambulance: <strong>{activeEmergency.ambulance.vehicle_number}</strong></span>
                )}
                {activeEmergency.hospital && (
                  <span>🏥 Hospital: <strong>{activeEmergency.hospital.name}</strong></span>
                )}
              </div>

              <Link
                to={`/patient/tracking/${activeEmergency.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emergency-700 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Live Map Tracking</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Main Action Trigger Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Need Immediate Emergency Assistance?</h2>
              <p className="text-xs text-slate-500">
                Click below to launch an emergency request. Our priority engine will score your request and assign the nearest available ambulance immediately.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <EmergencyButton
                onClick={() => navigate('/patient/emergency')}
                size="large"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              ℹ️ Decision-support triage tool for emergency dispatch. Always call 112/911 for life-threatening emergencies.
            </p>
          </div>

          {/* Past Emergencies List */}
          <div id="emergencies" className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-600" />
              Emergency Request History
            </h3>

            {loading ? (
              <Loading />
            ) : emergencies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No past emergency requests found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencies.map((e) => (
                  <EmergencyCard key={e.id} emergency={e} />
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};
