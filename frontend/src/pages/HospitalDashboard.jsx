import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hospitalAPI, emergencyAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DemoBanner } from '../components/DemoBanner';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { Loading } from '../components/Loading';
import { Building2, Truck, Activity, CheckSquare, Clock, ShieldCheck } from 'lucide-react';

export const HospitalDashboard = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [myHospital, setMyHospital] = useState(null);
  const [preparedBays, setPreparedBays] = useState({});

  const toggleTraumaBayReadiness = (id) => {
    setPreparedBays(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    fetchHospitalData();
    const interval = setInterval(fetchHospitalData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHospitalData = async () => {
    try {
      const hospRes = await hospitalAPI.getAll();
      setHospitals(hospRes.data);
      if (hospRes.data.length > 0) {
        setMyHospital(hospRes.data[0]); // Demo select first hospital
      }

      const emRes = await emergencyAPI.list();
      setEmergencies(emRes.data);
    } catch (err) {
      console.warn("Error loading hospital data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (newAvail) => {
    if (!myHospital) return;
    try {
      const res = await hospitalAPI.updateAvailability(myHospital.id, newAvail);
      setMyHospital(res.data);
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar /><Loading text="Loading Hospital Emergency Hub..." /></div>;

  const incomingEmergencies = emergencies.filter(e => 
    ["PATIENT_PICKED_UP", "EN_ROUTE_HOSPITAL", "EN_ROUTE_PATIENT", "ASSIGNED"].includes(e.status)
  );

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
                <Building2 className="w-6 h-6 text-emerald-600" />
                <h1 className="text-xl font-extrabold text-slate-900">{myHospital?.name || 'Hospital Emergency Portal'}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">{myHospital?.address} • 📞 {myHospital?.phone}</p>
            </div>

            {/* Emergency Unit Availability Control */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Trauma Unit State:</span>
              <div className="flex gap-1">
                {['AVAILABLE', 'BUSY', 'UNAVAILABLE'].map((state) => (
                  <button
                    key={state}
                    onClick={() => handleToggleAvailability(state)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      myHospital?.emergency_available === state
                        ? state === 'AVAILABLE' ? 'bg-emerald-600 text-white shadow' : state === 'BUSY' ? 'bg-amber-600 text-white shadow' : 'bg-red-600 text-white shadow'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Incoming Ambulances</span>
                <Truck className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">{incomingEmergencies.length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Emergencies</span>
                <Activity className="w-4 h-4 text-emergency-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">{emergencies.filter(e => e.status !== "COMPLETED").length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Unit Availability</span>
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-lg font-extrabold text-emerald-600 mt-1">{myHospital?.emergency_available}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Today's Cases</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">{emergencies.length}</p>
            </div>
          </div>

          {/* Incoming Ambulances List */}
          <div id="incoming" className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" />
              Incoming Ambulances & Triage Patients
            </h3>

            {incomingEmergencies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No incoming ambulance dispatches at this moment.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {incomingEmergencies.map((em) => (
                  <div key={em.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">#{em.id}</span>
                          <h4 className="font-bold text-slate-900 text-sm">{em.emergency_type}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{em.description || 'No additional triage details'}</p>
                      </div>
                      <PriorityBadge level={em.priority_level} />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Ambulance</span>
                        <p className="font-bold text-slate-800">{em.ambulance ? em.ambulance.vehicle_number : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Trip Status</span>
                        <div className="mt-0.5"><StatusBadge status={em.status} /></div>
                      </div>
                    </div>

                    {em.patient_info && (
                      <div className="text-xs space-y-1 text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                        <p className="font-bold text-amber-900">Patient Triage Parameters:</p>
                        <ul className="grid grid-cols-2 gap-1 text-[11px]">
                          <li>• Conscious: {em.patient_info.conscious ? 'Yes' : 'NO (Unconscious)'}</li>
                          <li>• Breathing Issue: {em.patient_info.breathing_difficulty ? 'Yes' : 'No'}</li>
                          <li>• Chest Pain: {em.patient_info.chest_pain ? 'Yes' : 'No'}</li>
                          <li>• Major Injury: {em.patient_info.major_injury ? 'Yes' : 'No'}</li>
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => toggleTraumaBayReadiness(em.id)}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                        preparedBays[em.id]
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>{preparedBays[em.id] ? '✓ Trauma Bay Ready & Bed Assigned' : 'Mark Trauma Bay Ready'}</span>
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
