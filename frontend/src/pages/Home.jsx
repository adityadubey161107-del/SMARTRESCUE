import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { DemoBanner } from '../components/DemoBanner';
import { 
  Ambulance, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Activity, 
  Zap, 
  Clock, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Radio
} from 'lucide-react';

export const Home = () => {
  const { user, getDashboardRoute } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-tech-grid">
      <DemoBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emergency-50 border border-emergency-200 text-emergency-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emergency-600 animate-ping" />
                Smart Emergency Response System
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Emergency Response, <span className="text-emergency-600">Connected.</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                SmartRescue connects patients, ambulances, and hospitals through intelligent emergency coordination, priority decision support, and real-time live GPS tracking.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to={user ? "/patient/emergency" : "/login"}
                  className="px-8 py-4 bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emergency-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                >
                  <Ambulance className="w-5 h-5" />
                  <span>Request Ambulance</span>
                </Link>
                
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
                >
                  <span>How It Works</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Haversine Distance Matching</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Priority Triage Engine</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live WebSocket Tracking</span>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative border border-slate-700 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emergency-500 animate-ping" />
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Live System Grid</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">100% Operational</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                        <Ambulance className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Nearest Unit: AMB-001</p>
                        <p className="text-[10px] text-slate-400">ALS Unit • 1.8 km away</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">ETA 4 min</span>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">CityCare Hospital</p>
                        <p className="text-[10px] text-slate-400">Trauma Bay Ready</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AVAILABLE</span>
                  </div>
                </div>

                <div className="bg-emergency-950/40 p-4 rounded-2xl border border-emergency-500/30 flex items-center gap-3 text-xs text-emergency-200">
                  <Activity className="w-5 h-5 text-emergency-400 shrink-0" />
                  <span>AI Triage Decision Support Active • Priority score auto-evaluated upon request.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">How SmartRescue Works</h2>
            <p className="text-slate-600 text-base">A seamless 4-step emergency response pipeline engineered for speed and medical preparedness.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              { step: '01', title: 'Request & Triage', desc: 'Patient submits location and symptoms. Priority Engine calculates urgency score.', icon: Activity },
              { step: '02', title: 'Auto-Assignment', desc: 'Haversine distance matching finds and dispatches the nearest available ambulance.', icon: Zap },
              { step: '03', title: 'Live GPS Tracking', desc: 'Real-time WebSocket connection streams driver location on an interactive map.', icon: MapPin },
              { step: '04', title: 'Hospital Readiness', desc: 'Destination hospital receives patient details and prepares emergency unit.', icon: Building2 },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-brand-300 transition-colors">
                  <span className="text-3xl font-black text-slate-200 font-mono block">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center my-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">Key Features</h2>
            <p className="text-slate-600 text-base">Built to streamline medical dispatch, fleet tracking, and hospital communication.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { title: 'Fast Ambulance Assignment', desc: 'Geographic coordinate calculation identifies the closest ambulance in seconds.', icon: Zap },
              { title: 'Live GPS Tracking', desc: 'Leaflet map with WebSocket real-time position stream and accurate ETA updates.', icon: MapPin },
              { title: 'Hospital Coordination', desc: 'Hospitals monitor incoming ambulances and adjust trauma unit availability state.', icon: Building2 },
              { title: 'Emergency Priority', desc: 'AI rule engine prioritizes critical cardiac and respiratory cases over minor injuries.', icon: Activity },
              { title: 'Admin Analytics', desc: 'Comprehensive charts showing response times, priority ratios, and ambulance utilization.', icon: BarChart3 },
              { title: 'Green Corridor Simulator', desc: 'Traffic signal simulation giving emergency vehicles green lights along key routes.', icon: Radio },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emergency-100/70 text-emergency-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-emergency-500" />
            <span className="font-bold text-white text-base">SmartRescue System</span>
          </div>
          <p>© 2026 SmartRescue — College CSE Project Prototype. Educational Demonstration Only.</p>
        </div>
      </footer>
    </div>
  );
};
