import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import SpendChart from '../../components/charts/SpendChart';
import StatusBadge from '../../components/common/StatusBadge';
import { getReportsSummary, getSpendByCategory, getActivityFeed } from '../../services/orderService';
import {
  FileText,
  Clock,
  Users,
  IndianRupee,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
  FileCheck,
  Package,
  Tag,
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    pendingApprovals: 0,
    activeVendors: 0,
    totalSpend: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [sum, spend, feed] = await Promise.all([
          getReportsSummary(),
          getSpendByCategory(),
          getActivityFeed(),
        ]);
        setMetrics(sum);
        setChartData(spend);
        setActivities(feed);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <DashboardLayout title="Admin Executive Overview">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-400/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-400/30">
            Institutional ERP Console
          </span>
          <h2 className="text-xl font-extrabold tracking-tight mt-2">
            Procurement & Vendor Command Center
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Monitor institutional spending, authorize pending purchase requisitions, manage verified vendor accounts, and track active purchase orders.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/request-approvals"
            className="px-4 py-2.5 bg-secondary hover:bg-secondary-dark text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Review Approvals</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Requisitions"
          value={metrics.totalRequests}
          icon={FileText}
          color="primary"
          trend="+12%"
          subtitle="All campus requests"
        />
        <StatCard
          title="Pending Review"
          value={metrics.pendingApprovals}
          icon={Clock}
          color="amber"
          subtitle="Action required"
        />
        <StatCard
          title="Verified Vendors"
          value={metrics.activeVendors}
          icon={Users}
          color="accent"
          trend="+3 new"
          subtitle="Active suppliers"
        />
        <StatCard
          title="Total Committed Spend"
          value={`₹${(metrics.totalSpend || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="success"
          trend="+8%"
          subtitle="Year to date budget"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 9: Recharts Horizontal Spend-by-Category Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Spend Distribution by Category</h3>
              <p className="text-xs text-slate-500">Committed procurement expenditures across institutional categories</p>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">
              Loading analytics chart...
            </div>
          ) : (
            <SpendChart data={chartData} />
          )}
        </div>

        {/* Module 10: Derived Activity Feed (Audit Log) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-slate-900">Recent Audit Feed</h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
              Derived Audit
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px]">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                    {act.type === 'approval_granted' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : act.type === 'po_generated' ? (
                      <Package className="w-4 h-4 text-blue-600" />
                    ) : act.type === 'quotation_submitted' ? (
                      <Tag className="w-4 h-4 text-amber-600" />
                    ) : (
                      <FileCheck className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{act.title}</p>
                    <p className="text-slate-500 mt-0.5">{act.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(act.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity recorded
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
