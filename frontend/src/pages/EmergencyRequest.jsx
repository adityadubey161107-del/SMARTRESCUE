import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { emergencyAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DemoBanner } from '../components/DemoBanner';
import { PriorityBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { AlertCircle, MapPin, ShieldAlert, HeartPulse, Activity, Check, ArrowRight } from 'lucide-react';

export const EmergencyRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [emergencyType, setEmergencyType] = useState('Breathing Difficulty');
  const [description, setDescription] = useState('');
  
  // Triage parameters
  const [ageGroup, setAgeGroup] = useState('Adult');
  const [conscious, setConscious] = useState(true);
  const [breathingDifficulty, setBreathingDifficulty] = useState(true);
  const [majorInjury, setMajorInjury] = useState(false);
  const [chestPain, setChestPain] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Location
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [locationName, setLocationName] = useState('Bengaluru City Center (Demo Location)');

  // Triage live preview
  const [priorityPreview, setPriorityPreview] = useState({ score: 75, level: 'CRITICAL', breakdown: {} });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update triage preview score whenever form selections change
  useEffect(() => {
    fetchTriagePreview();
  }, [emergencyType, conscious, breathingDifficulty, majorInjury, chestPain, ageGroup]);

  const fetchTriagePreview = async () => {
    try {
      const payload = {
        emergency_type: emergencyType,
        description,
        patient_latitude: latitude,
        patient_longitude: longitude,
        patient_info: {
          age_group: ageGroup,
          conscious,
          breathing_difficulty: breathingDifficulty,
          major_injury: majorInjury,
          chest_pain: chestPain,
          additional_notes: additionalNotes
        }
      };
      const res = await emergencyAPI.previewTriage(payload);
      setPriorityPreview(res.data);
    } catch (err) {
      console.warn("Failed to fetch triage preview", err);
    }
  };

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationName("GPS Device Current Coordinates");
        },
        () => {
          setError("GPS Permission Denied. Preset coordinates selected.");
        }
      );
    }
  };

  const handleSelectDemoLocation = (e) => {
    const val = e.target.value;
    if (val === 'center') {
      setLatitude(12.9716);
      setLongitude(77.5946);
      setLocationName('Bengaluru City Center');
    } else if (val === 'south') {
      setLatitude(12.9650);
      setLongitude(77.6050);
      setLocationName('South District Park');
    } else if (val === 'north') {
      setLatitude(12.9850);
      setLongitude(77.5850);
      setLocationName('North Highway Hub');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        emergency_type: emergencyType,
        description: description || `${emergencyType} reported by patient`,
        patient_latitude: latitude,
        patient_longitude: longitude,
        patient_info: {
          age_group: ageGroup,
          conscious,
          breathing_difficulty: breathingDifficulty,
          major_injury: majorInjury,
          chest_pain: chestPain,
          additional_notes: additionalNotes
        }
      };

      const res = await emergencyAPI.create(payload);
      const createdId = res.data.id;
      navigate(`/patient/tracking/${createdId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Emergency request failed. Please check inputs.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoBanner />
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-emergency-600" />
                <h1 className="text-2xl font-extrabold text-slate-900">Request Emergency Ambulance</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Complete emergency triage details to dispatch nearest unit</p>
            </div>
            <PriorityBadge level={priorityPreview.level} />
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Medical Disclaimer:</p>
              <p className="mt-0.5 text-amber-800">
                This system provides emergency coordination support and does not replace professional medical assessment. In immediate life-threatening situations, dial 112 / 911 / 108 directly.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-emergency-50 border border-emergency-200 text-emergency-700 text-xs font-semibold rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Triage Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              
              {/* Emergency Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Emergency Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'Chest Pain',
                    'Breathing Difficulty',
                    'Unconscious Person',
                    'Accident / Injury',
                    'Stroke / Seizure',
                    'Other Emergency'
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEmergencyType(type)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-20 ${
                        emergencyType === type 
                          ? 'bg-emergency-600 text-white border-emergency-600 shadow-md scale-[1.02]' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <HeartPulse className="w-4 h-4" />
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Triage Symptom Checklist */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Triage Assessment</h3>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Age Group</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option value="Adult">Adult (18–60)</option>
                      <option value="Senior">Senior (60+)</option>
                      <option value="Child">Child (2–17)</option>
                      <option value="Infant">Infant (0–2)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Patient Conscious?</span>
                    <button
                      type="button"
                      onClick={() => setConscious(!conscious)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        conscious ? 'bg-emerald-100 text-emerald-700' : 'bg-emergency-600 text-white'
                      }`}
                    >
                      {conscious ? 'YES' : 'NO (Unconscious)'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Breathing Difficulty?</span>
                    <button
                      type="button"
                      onClick={() => setBreathingDifficulty(!breathingDifficulty)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        breathingDifficulty ? 'bg-emergency-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {breathingDifficulty ? 'YES' : 'NO'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Severe Chest Pain?</span>
                    <button
                      type="button"
                      onClick={() => setChestPain(!chestPain)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        chestPain ? 'bg-emergency-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {chestPain ? 'YES' : 'NO'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-700">Major Physical Trauma / Injury?</span>
                    <button
                      type="button"
                      onClick={() => setMajorInjury(!majorInjury)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        majorInjury ? 'bg-emergency-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {majorInjury ? 'YES' : 'NO'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Additional Notes</label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Provide relevant details (e.g., landmark, allergies, medical history)..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Location Input & Demo Selector */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Emergency Location</h3>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Auto-Detect Location
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Preset Demo Locations</label>
                  <select
                    onChange={handleSelectDemoLocation}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="center">Bengaluru City Center (12.9716, 77.5946)</option>
                    <option value="south">South District Park (12.9650, 77.6050)</option>
                    <option value="north">North Highway Hub (12.9850, 77.5850)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-extrabold text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'DISPATCHING AMBULANCE...' : 'DISPATCH AMBULANCE NOW'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </form>

            {/* Right Column: AI Triage Engine Live Result Card */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-600" />
                    <h3 className="font-bold text-slate-900 text-sm">AI Priority Engine Analysis</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                    Decision Support
                  </span>
                </div>

                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Calculated Urgency Score</span>
                  <div className="text-4xl font-black font-mono text-slate-900">
                    {priorityPreview.score} <span className="text-xs text-slate-400 font-sans">/ 100</span>
                  </div>
                  <PriorityBadge level={priorityPreview.level} />
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-700">Triage Score Breakdown:</h4>
                  {Object.entries(priorityPreview.breakdown || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b border-slate-50 text-slate-600">
                      <span>{key}</span>
                      <span className="font-bold text-emergency-600">+{val} pts</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  ℹ️ High score cases (≥60) automatically trigger Critical alerts to nearby drivers and hospital emergency trauma units.
                </p>
              </div>

              {/* Map Preview */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Selected Location Map Preview</h4>
                <MapView
                  patientLocation={{ lat: latitude, lng: longitude, name: locationName }}
                  height="260px"
                />
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
