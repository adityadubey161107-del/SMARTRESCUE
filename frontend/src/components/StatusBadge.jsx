import React from 'react';

export const PriorityBadge = ({ level }) => {
  const getStyle = () => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
      case 'URGENT':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'NORMAL':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}>
      ● {level || 'NORMAL'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
      case 'ONLINE':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'BUSY':
      case 'EN_ROUTE_PATIENT':
      case 'EN_ROUTE_HOSPITAL':
      case 'PATIENT_PICKED_UP':
      case 'ASSIGNED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OFFLINE':
      case 'UNAVAILABLE':
      case 'CANCELLED':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatText = (text) => {
    if (!text) return 'N/A';
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      {formatText(status)}
    </span>
  );
};
