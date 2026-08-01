import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Timeline from '../../components/common/Timeline';
import TrackingModal from '../../components/common/TrackingModal';
import { getAllRequests } from '../../services/requestService';
import { FileText, Eye, X, Truck } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [trackingReq, setTrackingReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching my requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'request_id',
      render: (row) => <span className="font-extrabold text-slate-900">PR-{row.request_id}</span>,
    },
    {
      header: 'Item / Equipment Name',
      accessor: 'item_name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.item_name}</p>
          <p className="text-[11px] text-slate-500">{row.purpose || 'No purpose listed'}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-xs font-medium text-slate-600">{row.category}</span>,
    },
    {
      header: 'Qty',
      accessor: 'quantity',
      render: (row) => <span className="font-semibold text-slate-700">{row.quantity}</span>,
    },
    {
      header: 'Budget',
      accessor: 'budget',
      render: (row) => (
        <span className="font-bold text-slate-900">₹{parseFloat(row.budget).toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => <StatusBadge status={row.priority} type="priority" />,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTrackingReq(row)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-primary hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>View Tracking</span>
          </button>
          <button
            onClick={() => setSelectedReq(row)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="My Purchase Requisitions">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">My Submitted Requisitions</h3>
          <p className="text-xs text-slate-500">Track real-time approval status, admin remarks, and delivery stages.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading requisitions...</div>
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          searchPlaceholder="Search by item, category, or PR number..."
          emptyMessage="No Purchase Requests Available"
        />
      )}

      {/* Independent Tracking Modal */}
      {trackingReq && (
        <TrackingModal item={trackingReq} onClose={() => setTrackingReq(null)} />
      )}

      {/* Details Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">
                  Requisition PR-{selectedReq.request_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Timeline */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-2">Lifecycle Stage</p>
              <Timeline currentStatus={selectedReq.status} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-semibold">Item Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReq.item_name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Category</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReq.category}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Quantity Required</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReq.quantity}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Estimated Total Budget</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  ₹{parseFloat(selectedReq.budget).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Requisition Details
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyRequests;
