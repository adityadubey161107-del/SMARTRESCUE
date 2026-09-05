import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DemoBanner = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs font-medium flex items-center justify-center gap-2">
      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
      <span>
        <strong>DEMO MODE:</strong> Educational prototype software. All vehicle locations, traffic signals, and priority scores are simulated. Not connected to real emergency 911/112 services.
      </span>
    </div>
  );
};
