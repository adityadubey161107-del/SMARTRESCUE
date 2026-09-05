import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emergencyAPI } from '../services/api';
import { AmbulanceTrackingSocket } from '../services/websocket';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DemoBanner } from '../components/DemoBanner';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { Loading } from '../components/Loading';
import { haversineDistance, calculateEta } from '../utils/haversine';
import { Ambulance as AmbulanceIcon, Navigation, Clock, Building2, MapPin, Phone, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Tracking = () => {
  const { emergencyId } = useParams();
  const navigate = useNavigate();

  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Live real-time ambulance coordinates
  const [ambPos, setAmbPos] = useState(null);
  const [ambStatus, setAmbStatus] = useState(null);

  useEffect(() => {
    fetchEmergencyDetails();
    const interval = setInterval(fetchEmergencyDetails, 5000);
    return () => clearInterval(interval);
  }, [emergencyId]);

  // Connect WebSocket when emergency & ambulance details load
  useEffect(() => {
    if (!emergency || !emergency.ambulance_id) return;

    const ws = new AmbulanceTrackingSocket(
      emergency.ambulance_id,
      (data) => {
        if (data.latitude && data.longitude) {
          setAmbPos({ lat: data.latitude, lng: data.longitude });
        }
        if (data.status) {
          setAmbStatus(data.status);
        }
      },
      (err) => console.warn("WS error in tracking", err)
    );

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, [emergency?.ambulance_id]);

  const fetchEmergencyDetails = async () => {
    try {
      const res = await emergencyAPI.getById(emergencyId);
      setEmergency(res.data);
      if (res.data.ambulance && !ambPos) {
        setAmbPos({ lat: res.data.ambulance.latitude, lng: res.data.ambulance.longitude });
        setAmbStatus(res.data.ambulance.status);
      }
    } catch (err) {
      setError("Failed to fetch emergency details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEmergency = async () => {
    if (window.confirm("Are you sure you want to cancel this emergency request?")) {
      try {
        await emergencyAPI.cancel(emergencyId);
        fetchEmergencyDetails();
      } catch (err) {
        alert("Failed to cancel emergency");
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar /><Loading text="Connecting to emergency response stream..." /></div>;
  if (error || !emergency) return <div className="p-8 text-center text-emergency-600 font-bold">{error || 'Emergency not found'}</div>;

  // Calculate live Haversine distance and ETA
  const currentAmbLat = ambPos?.lat || emergency.ambulance?.latitude;
  const currentAmbLng = ambPos?.lng || emergency.ambulance?.longitude;

  const targetLat = emergency.status === "PATIENT_PICKED_UP" || emergency.status === "EN_ROUTE_HOSPITAL"
    ? emergency.hospital?.latitude || emergency.patient_latitude
    : emergency.patient_latitude;

  const targetLng = emergency.status === "PATIENT_PICKED_UP" || emergency.status === "EN_ROUTE_HOSPITAL"
    ? emergency.hospital?.longitude || emergency.patient_longitude
    : emergency.patient_longitude;

  let distanceKm = 0;
  let etaMinutes = 0;

  if (currentAmbLat && currentAmbLng && targetLat && targetLng) {
    distanceKm = haversineDistance(currentAmbLat, currentAmbLng, targetLat, targetLng);
    etaMinutes = calculateEta(distanceKm);
  }

  // Trip Timeline Steps
  const timelineSteps = [
    { key: 'ASSIGNED', label: 'Ambulance Assigned' },
    { key: 'EN_ROUTE_PATIENT', label: 'En Route to Patient' },
    { key: 'PATIENT_PICKED_UP', label: 'Patient Picked Up' },
    { key: 'EN_ROUTE_HOSPITAL', label: 'En Route to Hospital' },
    { key: 'COMPLETED', label: 'Arrived / Completed' },
  ];

  const currentStepIdx = timelineSteps.findIndex(s => s.key === emergency.status);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoBanner />
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">Emergency #{emergency.id}</span>
                <h1 className="text-xl font-extrabold text-slate-900">{emergency.emergency_type}</h1>
                <PriorityBadge level={emergency.priority_level} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Live Ambulance Tracking & Hospital Destination</p>
            </div>
            
            <div className="flex items-center gap-2">
              <StatusBadge status={emergency.status} />
              {emergency.status !== "COMPLETED" && emergency.status !== "CANCELLED" && (
                <button
                  onClick={handleCancelEmergency}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emergency-50 text-slate-600 hover:text-emergency-600 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Key Metrics Strip (ETA, Distance, Priority, Vehicle) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimated Arrival</span>
              <p className="text-2xl font-black text-brand-600 font-mono mt-1">
                {emergency.status === "COMPLETED" ? "0 min" : `${etaMinutes} mins`}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Remaining Distance</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                {emergency.status === "COMPLETED" ? "0 km" : `${distanceKm} km`}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assigned Unit</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {emergency.ambulance ? emergency.ambulance.vehicle_number : 'Searching...'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Target Hospital</span>
              <p className="text-xs font-bold text-slate-800 truncate mt-2">
                {emergency.hospital ? emergency.hospital.name : 'Nearest Trauma Unit'}
              </p>
            </div>
          </div>

          {/* Interactive Live Leaflet Map */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emergency-600 animate-pulse" />
                Live Map View (Updates via WebSockets)
              </h3>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                🟢 STREAM ACTIVE
              </span>
            </div>

            <MapView
              patientLocation={{ lat: emergency.patient_latitude, lng: emergency.patient_longitude, name: "Patient Site" }}
              ambulanceLocation={currentAmbLat ? { lat: currentAmbLat, lng: currentAmbLng, name: emergency.ambulance?.vehicle_number, status: ambStatus || emergency.status } : null}
              hospitalLocation={emergency.hospital ? { lat: emergency.hospital.latitude, lng: emergency.hospital.longitude, name: emergency.hospital.name } : null}
              height="450px"
            />
          </div>

          {/* Trip Progress Step Indicator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Emergency Dispatch Lifecycle</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {timelineSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx || emergency.status === "COMPLETED";
                const isCurrent = currentStepIdx === idx && emergency.status !== "COMPLETED";
                return (
                  <div 
                    key={step.key} 
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent 
                        ? 'bg-emergency-50 border-emergency-300 text-emergency-700 font-bold scale-[1.02]' 
                        : isPassed 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold">
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <p className="text-[11px] leading-snug">{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
