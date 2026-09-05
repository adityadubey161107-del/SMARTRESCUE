import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ambulanceAPI, emergencyAPI } from '../services/api';
import { AmbulanceTrackingSocket } from '../services/websocket';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DemoBanner } from '../components/DemoBanner';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { Loading } from '../components/Loading';
import { Ambulance as AmbulanceIcon, Play, Square, Navigation, Phone, MapPin, CheckCircle, ChevronRight, Activity } from 'lucide-react';

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [ambulance, setAmbulance] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  // Driver status online/offline
  const [isOnline, setIsOnline] = useState(true);

  // Simulation movement ticker
  const [simulating, setSimulating] = useState(false);
  const simIntervalRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDriverData = async () => {
    try {
      const ambRes = await ambulanceAPI.getMyAmbulance();
      setAmbulance(ambRes.data);
      setIsOnline(ambRes.data.status !== "OFFLINE");

      const emRes = await emergencyAPI.list();
      setEmergencies(emRes.data);
      
      const active = emRes.data.find(e => 
        e.ambulance_id === ambRes.data.id && 
        ["ASSIGNED", "EN_ROUTE_PATIENT", "PATIENT_PICKED_UP", "EN_ROUTE_HOSPITAL"].includes(e.status)
      );
      setActiveEmergency(active || null);
    } catch (err) {
      console.warn("Error fetching driver data", err);
    } finally {
      setLoading(false);
    }
  };

  // Connect WebSocket when ambulance loaded
  useEffect(() => {
    if (!ambulance) return;
    socketRef.current = new AmbulanceTrackingSocket(ambulance.id);
    socketRef.current.connect();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [ambulance?.id]);

  const handleToggleOnline = async () => {
    if (!ambulance) return;
    const newStatus = isOnline ? "OFFLINE" : "AVAILABLE";
    try {
      const updated = await ambulanceAPI.updateStatus(ambulance.id, newStatus);
      setAmbulance(updated.data);
      setIsOnline(!isOnline);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleUpdateTripStatus = async (nextStatus) => {
    if (!activeEmergency) return;
    try {
      await emergencyAPI.updateStatus(activeEmergency.id, nextStatus);
      if (nextStatus === "COMPLETED") {
        setSimulating(false);
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      }
      fetchDriverData();
    } catch (err) {
      alert("Failed to update trip status");
    }
  };

  const [simSpeed, setSimSpeed] = useState(1);

  // Ticker for Movement Simulation
  const toggleSimulation = () => {
    if (simulating) {
      setSimulating(false);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    } else {
      if (!activeEmergency || !ambulance) {
        alert("Must have an active trip to simulate movement.");
        return;
      }
      setSimulating(true);

      const targetLat = activeEmergency.status === "PATIENT_PICKED_UP" || activeEmergency.status === "EN_ROUTE_HOSPITAL"
        ? (activeEmergency.hospital?.latitude || activeEmergency.patient_latitude)
        : activeEmergency.patient_latitude;

      const targetLng = activeEmergency.status === "PATIENT_PICKED_UP" || activeEmergency.status === "EN_ROUTE_HOSPITAL"
        ? (activeEmergency.hospital?.longitude || activeEmergency.patient_longitude)
        : activeEmergency.patient_longitude;

      const intervalMs = Math.max(300, 1500 / simSpeed);

      simIntervalRef.current = setInterval(async () => {
        setAmbulance((prev) => {
          if (!prev) return prev;

          // Step coordinates closer to target each tick
          const stepSize = 0.08 * simSpeed;
          const dLat = targetLat - prev.latitude;
          const dLng = targetLng - prev.longitude;

          if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) {
            clearInterval(simIntervalRef.current);
            setSimulating(false);
            return prev;
          }

          const newLat = prev.latitude + dLat * stepSize;
          const newLng = prev.longitude + dLng * stepSize;

          // Send via WebSocket and HTTP endpoint
          if (socketRef.current) {
            socketRef.current.sendLocation(newLat, newLng, 45.0 * simSpeed, prev.status);
          }
          ambulanceAPI.updateLocation(prev.id, { latitude: newLat, longitude: newLng, speed: 45.0 * simSpeed }).catch(() => {});

          return { ...prev, latitude: newLat, longitude: newLng };
        });
      }, intervalMs);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar /><Loading text="Loading Driver Control Console..." /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoBanner />
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Top Status & Online Toggle */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AmbulanceIcon className="w-6 h-6 text-brand-600" />
                <h1 className="text-xl font-extrabold text-slate-900">Driver Console — {ambulance?.vehicle_number}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Vehicle Type: {ambulance?.type} • Unit ID: #{ambulance?.id}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isOnline ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
              }`}>
                ● {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>

              <button
                onClick={handleToggleOnline}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  isOnline 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          {/* Active Trip Pipeline Card */}
          {activeEmergency ? (
            <div id="trip" className="bg-white rounded-3xl p-6 border border-emergency-200 shadow-lg space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emergency-100 text-emergency-700 font-mono text-xs font-bold">
                      ACTIVE TRIP #{activeEmergency.id}
                    </span>
                    <PriorityBadge level={activeEmergency.priority_level} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{activeEmergency.emergency_type}</h2>
                  <p className="text-xs text-slate-500 mt-1">{activeEmergency.description}</p>
                </div>

                {/* Simulation Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                    {[1, 2, 4].map(s => (
                      <button
                        key={s}
                        onClick={() => setSimSpeed(s)}
                        className={`px-2 py-1 rounded-lg transition-colors ${simSpeed === s ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={toggleSimulation}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                      simulating 
                        ? 'bg-amber-500 text-white animate-pulse' 
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {simulating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{simulating ? 'Stop Movement Sim' : 'Simulate GPS Movement'}</span>
                  </button>
                </div>
              </div>

              {/* Trip Pipeline Action Buttons */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trip Workflow Pipeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    disabled={activeEmergency.status !== "ASSIGNED"}
                    onClick={() => handleUpdateTripStatus("EN_ROUTE_PATIENT")}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                      activeEmergency.status === "EN_ROUTE_PATIENT"
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-40'
                    }`}
                  >
                    1. En Route to Patient
                  </button>

                  <button
                    disabled={activeEmergency.status !== "EN_ROUTE_PATIENT"}
                    onClick={() => handleUpdateTripStatus("PATIENT_PICKED_UP")}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                      activeEmergency.status === "PATIENT_PICKED_UP"
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-40'
                    }`}
                  >
                    2. Patient Picked Up
                  </button>

                  <button
                    disabled={activeEmergency.status !== "PATIENT_PICKED_UP"}
                    onClick={() => handleUpdateTripStatus("EN_ROUTE_HOSPITAL")}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                      activeEmergency.status === "EN_ROUTE_HOSPITAL"
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-40'
                    }`}
                  >
                    3. En Route to Hospital
                  </button>

                  <button
                    disabled={activeEmergency.status !== "EN_ROUTE_HOSPITAL" && activeEmergency.status !== "PATIENT_PICKED_UP"}
                    onClick={() => handleUpdateTripStatus("COMPLETED")}
                    className="p-3 rounded-2xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 shadow-md transition-all text-center disabled:opacity-40"
                  >
                    4. Complete Trip
                  </button>
                </div>
              </div>

              {/* Map */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Driver Live Navigation Map</p>
                <MapView
                  ambulanceLocation={{ lat: ambulance.latitude, lng: ambulance.longitude, name: ambulance.vehicle_number }}
                  patientLocation={{ lat: activeEmergency.patient_latitude, lng: activeEmergency.patient_longitude, name: "Patient Site" }}
                  hospitalLocation={activeEmergency.hospital ? { lat: activeEmergency.hospital.latitude, lng: activeEmergency.hospital.longitude, name: activeEmergency.hospital.name } : null}
                  height="360px"
                />
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <Activity className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">No Active Trip Assigned</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You are currently online. When a new emergency is requested near your location, dispatch alerts will appear here.
              </p>
            </div>
          )}

          {/* Pending Emergency Requests List */}
          <div id="requests" className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Incoming Emergency Requests</h3>
            {emergencies.filter(e => e.status === "PENDING").length === 0 ? (
              <p className="text-xs text-slate-400 p-4 bg-white rounded-2xl border border-slate-200">No pending unassigned requests.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {emergencies.filter(e => e.status === "PENDING").map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400">#{req.id}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{req.emergency_type}</h4>
                      </div>
                      <PriorityBadge level={req.priority_level} />
                    </div>
                    <p className="text-xs text-slate-500">{req.description}</p>
                    <button
                      onClick={() => handleUpdateTripStatus("EN_ROUTE_PATIENT")}
                      className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl"
                    >
                      Accept Emergency Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};
