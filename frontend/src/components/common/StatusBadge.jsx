import React from 'react';

const statusStyles = {
  // Request & PO statuses
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  rfq_sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  po_generated: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-teal-50 text-teal-700 border-teal-200',
  processing: 'bg-sky-50 text-sky-700 border-sky-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  
  // Vendor statuses
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',

  // Priorities
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatText = (text) => {
  if (!text) return '';
  return text
    .replace('_', ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const StatusBadge = ({ status, type = 'status' }) => {
  const normalized = status ? status.toLowerCase() : 'pending';
  const style = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
