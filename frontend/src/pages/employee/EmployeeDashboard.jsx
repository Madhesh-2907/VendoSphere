import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { getAllRequests } from '../../services/requestService';
import { FileText, Clock, CheckCircle2, FilePlus, ArrowRight, PackageCheck } from 'lucide-react';

const EmployeeDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllRequests();
        setRequests(data);
      } catch (err) {
        console.error('Failed to load requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => ['approved', 'rfq_sent', 'po_generated'].includes(r.status)).length;
  const deliveredCount = requests.filter((r) => r.status === 'delivered').length;

  return (
    <DashboardLayout title="Employee Procurement Portal">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Institutional Purchase Portal</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Submit material and equipment requests, track administrative approvals in real-time, and verify institutional order deliveries.
          </p>
        </div>
        <Link
          to="/employee/create-request"
          className="inline-flex items-center px-4 py-2.5 bg-secondary hover:bg-secondary-dark text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto space-x-2"
        >
          <FilePlus className="w-4 h-4" />
          <span>New Purchase Request</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Requisitions"
          value={totalCount}
          icon={FileText}
          color="primary"
          subtitle="All submitted requests"
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          icon={Clock}
          color="amber"
          subtitle="Awaiting admin review"
        />
        <StatCard
          title="Approved / In Process"
          value={approvedCount}
          icon={CheckCircle2}
          color="accent"
          subtitle="In procurement workflow"
        />
        <StatCard
          title="Completed & Delivered"
          value={deliveredCount}
          icon={PackageCheck}
          color="success"
          subtitle="Fulfilled requisitions"
        />
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">My Recent Requisitions</h3>
            <p className="text-xs text-slate-500">Live status tracking for your submitted purchase orders</p>
          </div>
          <Link
            to="/employee/my-requests"
            className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading requisitions...</div>
        ) : requests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {requests.slice(0, 5).map((req) => (
              <div key={req.request_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-lg px-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-slate-900">PR-{req.request_id}</span>
                    <span className="text-xs font-semibold text-slate-800">{req.item_name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span>Category: {req.category}</span>
                    <span>&bull;</span>
                    <span>Qty: {req.quantity}</span>
                    <span>&bull;</span>
                    <span className="font-semibold text-slate-700">₹{parseFloat(req.budget).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={req.status} />
                  <Link
                    to="/employee/my-requests"
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No purchase requisitions submitted yet. Click "New Purchase Request" above to get started!
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
