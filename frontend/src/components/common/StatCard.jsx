import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', subtitle }) => {
  const colorClasses = {
    primary: 'bg-blue-50 text-primary border-blue-100',
    secondary: 'bg-teal-50 text-secondary border-teal-100',
    accent: 'bg-purple-50 text-accent border-purple-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorClasses[color] || colorClasses.primary}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-600 font-medium">
          <span className="text-emerald-600 font-semibold mr-1">{trend}</span>
          <span>vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
