import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import TrackingModal from '../../components/common/TrackingModal';
import { getAllPurchaseOrders } from '../../services/orderService';
import { Truck, CheckCircle2, Clock, Eye, Filter } from 'lucide-react';

const DeliveryTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackingItem, setTrackingItem] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllPurchaseOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading deliveries:', err);
    } finally {
      setLoading(false);
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
      header: 'Equipment / Material Item',
      accessor: 'Request',
      render: (row) => <span className="font-bold text-slate-800">{row.Request ? row.Request.item_name : 'Item'}</span>,
    },
    {
      header: 'Supplier Company',
      accessor: 'Vendor',
      render: (row) => <span className="font-semibold text-slate-700">{row.Vendor ? row.Vendor.company_name : 'Vendor'}</span>,
    },
    {
      header: 'PO Amount',
      accessor: 'amount',
      render: (row) => <span className="font-extrabold text-slate-900">₹{parseFloat(row.amount).toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Delivery Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setTrackingItem(row)}
          className="px-3 py-1.5 bg-primary hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Tracking</span>
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Institutional Delivery Tracking">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Shipment & Delivery Oversight</h3>
          <p className="text-xs text-slate-500">
            Monitor real-time fulfillment status of each individual purchase order.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="issued">PO Issued / Processing</option>
            <option value="shipped">In Transit (Shipped)</option>
            <option value="delivered">Delivered & Confirmed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading delivery tracking records...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          searchPlaceholder="Search delivery by PO number, item, or vendor..."
          emptyMessage="No active deliveries match criteria."
        />
      )}

      {/* Detail Independent Order Tracking Modal */}
      {trackingItem && (
        <TrackingModal item={trackingItem} onClose={() => setTrackingItem(null)} />
      )}
    </DashboardLayout>
  );
};

export default DeliveryTracking;
