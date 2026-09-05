import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DemoBanner } from '../components/DemoBanner';
import { Play, Pause, RotateCcw, Radio, ShieldAlert, Ambulance, Building2, CheckCircle2, Gauge, Zap, Activity } from 'lucide-react';

export const GreenCorridor = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [simTime, setSimTime] = useState(0); // seconds
  const [speed, setSpeed] = useState(1);

  // Traffic Signals State: Signal 1 at 25%, Signal 2 at 55%, Signal 3 at 85%
  const [signal1State, setSignal1State] = useState('RED');
  const [signal2State, setSignal2State] = useState('GREEN');
  const [signal3State, setSignal3State] = useState('RED');
  
  // Manual override states
  const [manualOverride1, setManualOverride1] = useState(null);
  const [manualOverride2, setManualOverride2] = useState(null);
  const [manualOverride3, setManualOverride3] = useState(null);

  const [activeAlert, setActiveAlert] = useState('Simulation Ready. Press Start to initiate Emergency Corridor.');
  const [eventLogs, setEventLogs] = useState([
    { time: '00:00', text: 'Green Corridor Preemptive Logic Initialized.' }
  ]);

  const animRef = useRef(null);

  const addLog = (text) => {
    const timeStr = `${Math.floor(simTime / 60).toString().padStart(2, '0')}:${(simTime % 60).toString().padStart(2, '0')}`;
    setEventLogs(prev => [{ time: timeStr, text }, ...prev.slice(0, 15)]);
  };

  useEffect(() => {
    if (isPlaying) {
      animRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            clearInterval(animRef.current);
            const msg = 'Ambulance successfully reached Hospital Emergency Trauma Bay!';
            setActiveAlert(msg);
            addLog(msg);
            return 100;
          }
          return prev + 1 * speed;
        });

        setSimTime((prev) => prev + 1);
      }, 300);
    } else {
      if (animRef.current) clearInterval(animRef.current);
    }

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [isPlaying, speed, simTime]);

  // Traffic Signal Proximity State Logic
  useEffect(() => {
    // Signal 1 Proximity (15% to 35%)
    if (manualOverride1) {
      setSignal1State(manualOverride1);
    } else if (progress >= 15 && progress <= 35) {
      if (signal1State !== 'GREEN') addLog('🚦 Signal 1 Emergency Priority Activated — Switched to GREEN');
      setSignal1State('GREEN');
      setActiveAlert('🚦 Signal 1 Emergency Priority Activated — Switched to GREEN');
    } else {
      setSignal1State('RED');
    }

    // Signal 2 Proximity (45% to 65%)
    if (manualOverride2) {
      setSignal2State(manualOverride2);
    } else if (progress >= 45 && progress <= 65) {
      if (signal2State !== 'GREEN') addLog('🚦 Signal 2 Emergency Priority Activated — Switched to GREEN');
      setSignal2State('GREEN');
      setActiveAlert('🚦 Signal 2 Emergency Priority Activated — Switched to GREEN');
    } else {
      setSignal2State('GREEN');
    }

    // Signal 3 Proximity (75% to 92%)
    if (manualOverride3) {
      setSignal3State(manualOverride3);
    } else if (progress >= 75 && progress <= 92) {
      if (signal3State !== 'GREEN') addLog('🚦 Signal 3 Emergency Priority Activated — Switched to GREEN');
      setSignal3State('GREEN');
      setActiveAlert('🚦 Signal 3 Emergency Priority Activated — Switched to GREEN');
    } else {
      setSignal3State('RED');
    }

    if (progress > 35 && progress < 45 && !manualOverride1) {
      setActiveAlert('Normal Traffic Signal Cycle Restored between Signal 1 and 2.');
    }
    if (progress > 65 && progress < 75 && !manualOverride2) {
      setActiveAlert('Normal Traffic Signal Cycle Restored between Signal 2 and 3.');
    }

  }, [progress, manualOverride1, manualOverride2, manualOverride3]);

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setSimTime(0);
    setManualOverride1(null);
    setManualOverride2(null);
    setManualOverride3(null);
    setSignal1State('RED');
    setSignal2State('GREEN');
    setSignal3State('RED');
    setActiveAlert('Simulation Reset. Ready to start.');
    setEventLogs([{ time: '00:00', text: 'Corridor Reset.' }]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-tech-grid">
      <DemoBanner />
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-6 h-6 text-emerald-600 animate-pulse" />
                <h1 className="text-xl font-extrabold text-slate-900">Green Corridor Traffic Signal Simulator</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Preemptive Traffic Light Control for Emergency Ambulance Transit</p>
            </div>

            {/* Simulation Controls & Speed Multipliers */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${speed === s ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'hover:text-slate-900'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                  isPlaying ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Start Simulation'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Software Simulation Disclaimer:</p>
              <p className="mt-0.5 text-amber-800">
                Traffic signal behavior shown here is a software simulation for educational evaluation and is not connected to real traffic municipal infrastructure.
              </p>
            </div>
          </div>

          {/* Alert Status Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-xs shadow-lg">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-bold text-emerald-400 shrink-0">CORRIDOR STATUS:</span>
              <span className="text-slate-200 truncate">{activeAlert}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[11px] shrink-0">
              <span>Speed: <strong className="text-white">{speed}x</strong></span>
              <span>Time: <strong className="text-white">{simTime}s</strong></span>
              <span>Progress: <strong className="text-white">{Math.round(progress)}%</strong></span>
            </div>
          </div>

          {/* Visual Road & Signals Corridor Graphic */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Arterial Highway Corridor Overview</h3>
              <span className="text-xs font-mono text-slate-400">Total Route: 8.5 km</span>
            </div>

            {/* Road Track Container */}
            <div className="relative py-12 px-6 bg-slate-800 rounded-2xl border-4 border-slate-700 shadow-inner overflow-hidden">
              
              {/* Center Dashed Lane Divider */}
              <div className="absolute top-1/2 left-0 right-0 h-1 border-b-2 border-dashed border-yellow-400 -translate-y-1/2" />

              {/* Ambulance Vehicle Marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-20 flex flex-col items-center"
                style={{ left: `calc(${Math.min(progress, 92)}% + 10px)` }}
              >
                <div className="bg-emergency-600 text-white p-2 rounded-xl shadow-lg border-2 border-white animate-pulse">
                  <Ambulance className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-bold text-white font-mono bg-black/60 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap">
                  AMB-001
                </span>
              </div>

              {/* Hospital Target Endpoint */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="bg-emerald-600 text-white p-3 rounded-2xl border-2 border-white shadow-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono mt-1">Hospital</span>
              </div>

              {/* Signal 1 (at 25%) */}
              <div className="absolute left-[25%] top-2 z-10 flex flex-col items-center">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-700 space-y-1 shadow-md">
                  <div className={`w-3.5 h-3.5 rounded-full ${signal1State === 'RED' ? 'bg-red-500 signal-red-glow' : 'bg-slate-700'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full ${signal1State === 'GREEN' ? 'bg-emerald-500 signal-green-glow' : 'bg-slate-700'}`} />
                </div>
                <span className="text-[10px] font-mono text-slate-300 font-bold mt-1">Signal 1</span>
              </div>

              {/* Signal 2 (at 55%) */}
              <div className="absolute left-[55%] top-2 z-10 flex flex-col items-center">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-700 space-y-1 shadow-md">
                  <div className={`w-3.5 h-3.5 rounded-full ${signal2State === 'RED' ? 'bg-red-500 signal-red-glow' : 'bg-slate-700'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full ${signal2State === 'GREEN' ? 'bg-emerald-500 signal-green-glow' : 'bg-slate-700'}`} />
                </div>
                <span className="text-[10px] font-mono text-slate-300 font-bold mt-1">Signal 2</span>
              </div>

              {/* Signal 3 (at 85%) */}
              <div className="absolute left-[80%] top-2 z-10 flex flex-col items-center">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-700 space-y-1 shadow-md">
                  <div className={`w-3.5 h-3.5 rounded-full ${signal3State === 'RED' ? 'bg-red-500 signal-red-glow' : 'bg-slate-700'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full ${signal3State === 'GREEN' ? 'bg-emerald-500 signal-green-glow' : 'bg-slate-700'}`} />
                </div>
                <span className="text-[10px] font-mono text-slate-300 font-bold mt-1">Signal 3</span>
              </div>

            </div>

            {/* Signal Status Cards & Manual Override Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className={`p-4 rounded-2xl border ${signal1State === 'GREEN' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="flex justify-between items-center">
                  <p className="font-bold">🚦 Signal 1</p>
                  <span className="text-base font-black">{signal1State}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Arterial Junction A</p>
                <div className="mt-3 flex gap-1">
                  <button
                    onClick={() => setManualOverride1('GREEN')}
                    className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    Force GREEN
                  </button>
                  <button
                    onClick={() => setManualOverride1('RED')}
                    className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    Force RED
                  </button>
                  {manualOverride1 && (
                    <button
                      onClick={() => setManualOverride1(null)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${signal2State === 'GREEN' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="flex justify-between items-center">
                  <p className="font-bold">🚦 Signal 2</p>
                  <span className="text-base font-black">{signal2State}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Central Flyover Crossing</p>
                <div className="mt-3 flex gap-1">
                  <button
                    onClick={() => setManualOverride2('GREEN')}
                    className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    Force GREEN
                  </button>
                  <button
                    onClick={() => setManualOverride2('RED')}
                    className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    Force RED
                  </button>
                  {manualOverride2 && (
                    <button
                      onClick={() => setManualOverride2(null)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${signal3State === 'GREEN' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="flex justify-between items-center">
                  <p className="font-bold">🚦 Signal 3</p>
                  <span className="text-base font-black">{signal3State}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Hospital Gate Junction</p>
                <div className="mt-3 flex gap-1">
                  <button
                    onClick={() => setManualOverride3('GREEN')}
                    className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    Force GREEN
                  </button>
                  <button
                    onClick={() => setManualOverride3('RED')}
                    className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    Force RED
                  </button>
                  {manualOverride3 && (
                    <button
                      onClick={() => setManualOverride3(null)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Event Logs Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Real-time Preemption Event Log
            </h4>
            <div className="bg-slate-900 text-slate-300 rounded-2xl p-4 font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 border border-slate-800">
              {eventLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-slate-500 font-bold shrink-0">[{log.time}]</span>
                  <span className="text-emerald-400">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
