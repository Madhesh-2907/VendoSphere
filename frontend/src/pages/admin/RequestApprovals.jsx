import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { getAllRequests, createApproval } from '../../services/requestService';
import { getAllVendors } from '../../services/vendorService';
import { sendRFQ } from '../../services/quotationService';
import { CheckSquare, XCircle, Send, CheckCircle2, Eye, X } from 'lucide-react';

const RequestApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [actionMsg, setActionMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqData, vendorData] = await Promise.all([
        getAllRequests(),
        getAllVendors({ status: 'active' }),
      ]);
      setRequests(reqData);
      setVendors(vendorData);
    } catch (err) {
      console.error('Failed to load approval data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (status) => {
    if (!selectedReq) return;
    try {
      await createApproval({
        request_id: selectedReq.request_id,
        status,
        remarks: remarks || (status === 'approved' ? 'Approved for institutional procurement.' : 'Request rejected.'),
      });

      // If approved and vendors selected, automatically send RFQ
      if (status === 'approved' && selectedVendorIds.length > 0) {
        await sendRFQ({
          request_id: selectedReq.request_id,
          vendor_ids: selectedVendorIds,
        });
        setActionMsg(`Request PR-${selectedReq.request_id} APPROVED and RFQ dispatched to ${selectedVendorIds.length} vendors!`);
      } else {
        setActionMsg(`Request PR-${selectedReq.request_id} has been ${status.toUpperCase()}.`);
      }

      setSelectedReq(null);
      setRemarks('');
      setSelectedVendorIds([]);
      loadData();
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      console.error('Failed to record approval:', err);
    }
  };

  const toggleVendorSelection = (vendorId) => {
    if (selectedVendorIds.includes(vendorId)) {
      setSelectedVendorIds(selectedVendorIds.filter((id) => id !== vendorId));
    } else {
      setSelectedVendorIds([...selectedVendorIds, vendorId]);
    }
  };

  const columns = [
    {
      header: 'PR ID',
      accessor: 'request_id',
      render: (row) => <span className="font-extrabold text-slate-900">PR-{row.request_id}</span>,
    },
    {
      header: 'Requisition Title',
      accessor: 'item_name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.item_name}</p>
          <p className="text-[11px] text-slate-500">
            Requested by: <span className="font-semibold">{row.Employee ? row.Employee.name : 'Faculty'}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.category}</span>,
    },
    {
      header: 'Budget',
      accessor: 'budget',
      render: (row) => <span className="font-bold text-slate-900">₹{parseFloat(row.budget).toLocaleString('en-IN')}</span>,
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
          {row.status === 'pending' ? (
            <button
              onClick={() => {
                setSelectedReq(row);
                // Pre-select matching vendors by category
                const matching = vendors.filter((v) => v.category === row.category).map((v) => v.vendor_id);
                setSelectedVendorIds(matching);
              }}
              className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-slate-900 shadow-xs flex items-center space-x-1"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Review</span>
            </button>
          ) : row.status === 'approved' || row.status === 'rfq_sent' ? (
            <button
              onClick={() => navigate('/admin/quotation-comparison')}
              className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100"
            >
              View Quotes
            </button>
          ) : (
            <button
              onClick={() => setSelectedReq(row)}
              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200"
            >
              Details
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Request Approvals & RFQ Dispatch">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Administrative Approval Queue</h3>
          <p className="text-xs text-slate-500">
            Review faculty purchase requisitions, attach authorization remarks, and dispatch RFQs to active vendors.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in">
          {actionMsg}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading requisitions...</div>
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          searchPlaceholder="Search requisition by item, category, or PR ID..."
          emptyMessage="No Purchase Requests Available"
        />
      )}

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">
                  Review Requisition PR-{selectedReq.request_id}
                </h3>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Request Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-semibold">Item Required</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReq.item_name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Category</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReq.category}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Requested Quantity</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReq.quantity} units</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Allocated Budget</p>
                <p className="font-bold text-slate-900 mt-0.5">₹{parseFloat(selectedReq.budget).toLocaleString('en-IN')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 font-semibold">Faculty Purpose / Justification</p>
                <p className="text-slate-700 mt-0.5 bg-white p-2.5 rounded border border-slate-200">
                  {selectedReq.purpose || 'Standard departmental requisition.'}
                </p>
              </div>
            </div>

            {/* Admin Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Admin Approval Remarks / Directives
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Approved for Q3 Computer Science Lab Upgrade. Ensure vendor includes on-site warranty."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
              />
            </div>

            {/* Select Vendors for RFQ */}
            {selectedReq.status === 'pending' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Select Vendors to Receive Request for Quotation (RFQ)
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {selectedVendorIds.length} vendors selected
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {vendors
                    .filter((v) => v.category === selectedReq.category || true)
                    .map((v) => {
                      const isSelected = selectedVendorIds.includes(v.vendor_id);
                      return (
                        <div
                          key={v.vendor_id}
                          onClick={() => toggleVendorSelection(v.vendor_id)}
                          className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold' : 'bg-white hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-bold">{v.company_name}</p>
                            <p className="text-[10px] opacity-75">{v.category} &bull; Rating: {v.rating || '4.5'}</p>
                          </div>
                          <input type="checkbox" checked={isSelected} readOnly className="rounded text-primary" />
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              {selectedReq.status === 'pending' ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApprove('rejected')}
                    className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove('approved')}
                    className="px-5 py-2 bg-primary hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1"
                  >
                    <Send className="w-4 h-4" />
                    <span>Approve & Send RFQ</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RequestApprovals;
