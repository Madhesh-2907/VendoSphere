import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Timeline from '../../components/common/Timeline';
import TrackingModal from '../../components/common/TrackingModal';
import { getAllPurchaseOrders, updatePOStatus } from '../../services/orderService';
import { ShoppingBag, Eye, FileText, Building, CheckCircle, X, Truck, Filter } from 'lucide-react';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState(null);
  const [trackingPO, setTrackingPO] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllPurchaseOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (poId, newStatus) => {
    try {
      await updatePOStatus(poId, newStatus);
      setUpdateMsg(`Purchase Order status updated to ${newStatus.toUpperCase()}`);
      fetchOrders();
      if (selectedPO && selectedPO.po_id === poId) {
        setSelectedPO({ ...selectedPO, status: newStatus });
      }
      setTimeout(() => setUpdateMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update PO status:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const columns = [
    {
      header: 'PO Number',
      accessor: 'po_number',
      render: (row) => <span className="font-extrabold text-slate-900">{row.po_number}</span>,
    },
    {
      header: 'Requisition Item',
      accessor: 'Request',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.Request ? row.Request.item_name : 'Item'}</p>
          <p className="text-[11px] text-slate-500">PR-{row.request_id}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Vendor',
      accessor: 'Vendor',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.Vendor ? row.Vendor.company_name : `Vendor #${row.vendor_id}`}</p>
          <p className="text-[11px] text-slate-500">{row.Vendor?.contact || ''}</p>
        </div>
      ),
    },
    {
      header: 'PO Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="font-extrabold text-slate-900">₹{parseFloat(row.amount).toLocaleString('en-IN')}</span>
      ),
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
            onClick={() => setTrackingPO(row)}
            className="px-2.5 py-1.5 bg-primary hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>View Tracking</span>
          </button>
          <button
            onClick={() => setSelectedPO(row)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Purchase Order Management">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Institutional Purchase Orders</h3>
          <p className="text-xs text-slate-500">
            Official purchase orders generated automatically upon vendor quotation approval.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
          >
            <option value="all">All PO Statuses</option>
            <option value="issued">PO Issued</option>
            <option value="shipped">Order Shipped</option>
            <option value="delivered">Delivered & Confirmed</option>
          </select>
        </div>
      </div>

      {updateMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in">
          {updateMsg}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading purchase orders...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          searchPlaceholder="Search by PO number, item, or vendor..."
          emptyMessage="No Purchase Orders Generated"
        />
      )}

      {/* Independent Tracking Modal */}
      {trackingPO && (
        <TrackingModal item={trackingPO} onClose={() => setTrackingPO(null)} />
      )}

      {/* PO Detail Document Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">
                  Official PO Document ({selectedPO.po_number})
                </h3>
              </div>
              <button onClick={() => setSelectedPO(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-2">Order Lifecycle Visual Progress</p>
              <Timeline currentStatus={selectedPO.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-semibold">PO Number</p>
                <p className="font-extrabold text-slate-900 text-sm">{selectedPO.po_number}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Total Amount</p>
                <p className="font-extrabold text-slate-900 text-sm">₹{parseFloat(selectedPO.amount).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Selected Supplier</p>
                <p className="font-bold text-slate-800">{selectedPO.Vendor?.company_name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Requisition Item</p>
                <p className="font-bold text-slate-800">{selectedPO.Request?.item_name}</p>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedPO(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close PO Document
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PurchaseOrders;
