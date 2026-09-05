import React from 'react';
import { PriorityBadge, StatusBadge } from './StatusBadge';
import { Clock, MapPin, Ambulance as AmbulanceIcon, Building2, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyCard = ({ emergency, onAction, actionText = "Track Emergency" }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">#{emergency.id}</span>
            <h3 className="font-bold text-slate-900 text-base">{emergency.emergency_type}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {emergency.description || 'No additional description provided.'}
          </p>
        </div>
        <PriorityBadge level={emergency.priority_level} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <StatusBadge status={emergency.status} />
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 justify-end">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(emergency.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {emergency.ambulance && (
        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <AmbulanceIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{emergency.ambulance.vehicle_number}</p>
              <p className="text-[10px] text-slate-500">{emergency.ambulance.type} Unit</p>
            </div>
          </div>
          {emergency.hospital && (
            <div className="text-right">
              <p className="font-semibold text-slate-700">{emergency.hospital.name}</p>
              <p className="text-[10px] text-slate-400">Assigned Facility</p>
            </div>
          )}
        </div>
      )}

      {onAction ? (
        <button
          onClick={() => onAction(emergency)}
          className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <Link
          to={`/patient/tracking/${emergency.id}`}
          className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Live Tracking & Details</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
};

export const AmbulanceCard = ({ ambulance, onStatusToggle }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
          <AmbulanceIcon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">{ambulance.vehicle_number}</h4>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
              {ambulance.type}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Driver: {ambulance.driver ? ambulance.driver.name : 'Unassigned'}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={ambulance.status} />
        {onStatusToggle && (
          <button
            onClick={() => onStatusToggle(ambulance)}
            className="text-xs text-brand-600 hover:underline font-medium"
          >
            Change Status
          </button>
        )}
      </div>
    </div>
  );
};

export const HospitalCard = ({ hospital, onToggleAvailability }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{hospital.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{hospital.address}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">📞 {hospital.phone}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={hospital.emergency_available} />
        {onToggleAvailability && (
          <button
            onClick={() => onToggleAvailability(hospital)}
            className="text-xs text-brand-600 hover:underline font-medium"
          >
            Update Unit State
          </button>
        )}
      </div>
    </div>
  );
};
