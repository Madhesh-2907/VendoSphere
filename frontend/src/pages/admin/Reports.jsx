import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SpendChart from '../../components/charts/SpendChart';
import StatCard from '../../components/common/StatCard';
import { getReportsSummary, getSpendByCategory } from '../../services/orderService';
import { BarChart3, IndianRupee, Download, PieChart, FileText, CheckCircle } from 'lucide-react';

const Reports = () => {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    pendingApprovals: 0,
    activeVendors: 0,
    totalSpend: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sum, spend] = await Promise.all([getReportsSummary(), getSpendByCategory()]);
        setMetrics(sum);
        setChartData(spend);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Category,Total Spend (₹ INR)\n' +
      chartData.map((e) => `"${e.category}",${e.amount}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusProcure_Spend_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Institutional Procurement Reports">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Procurement & Budget Analytics</h3>
          <p className="text-xs text-slate-500">
            Institutional expenditure distribution, vendor metrics, and downloadable financial reports.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Budget Committed"
          value={`₹${(metrics.totalSpend || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="success"
          subtitle="Annual procurement budget"
        />
        <StatCard
          title="Total Requisitions"
          value={metrics.totalRequests}
          icon={FileText}
          color="primary"
          subtitle="Processed requests"
        />
        <StatCard
          title="Active Suppliers"
          value={metrics.activeVendors}
          icon={CheckCircle}
          color="accent"
          subtitle="Verified vendor partners"
        />
      </div>

      {/* Horizontal Recharts Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">Category Expenditure Breakdown</h4>
            <p className="text-xs text-slate-500">Horizontal comparison of allocated funds per institutional category</p>
          </div>
        </div>
        {loading ? (
          <div className="h-72 flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
        ) : (
          <SpendChart data={chartData} />
        )}
      </div>

      {/* Category Breakdown Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 className="text-base font-bold text-slate-900 mb-3">Expenditure Details Table</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Procurement Category</th>
                <th className="py-3 px-4 text-right">Committed Spend (₹ INR)</th>
                <th className="py-3 px-4 text-right">Share of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {chartData.length > 0 ? (
                chartData.map((item, idx) => {
                  const total = chartData.reduce((acc, curr) => acc + Number(curr.amount), 0) || 1;
                  const pct = ((Number(item.amount) / total) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold">{item.category}</td>
                      <td className="py-3 px-4 text-right font-extrabold">₹{Number(item.amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right text-slate-600 font-semibold">{pct}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-slate-400 font-medium">
                    No Spend Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
