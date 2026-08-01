import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const colors = ['#1E3A8A', '#0F766E', '#7C3AED', '#10B981', '#6366F1'];

const SpendChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No Spend Data Available
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis
            type="number"
            tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }}
            width={160}
          />
          <Tooltip
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Total Spend']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendChart;
