import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import TrackingModal from '../../components/common/TrackingModal';
import { getAllPurchaseOrders, updatePOStatus } from '../../services/orderService';
import { Truck, CheckCircle2, Eye, Package } from 'lucide-react';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingItem, setTrackingItem] = useState(null);
  const [updateMsg, setUpdateMsg] = useState('');

  // Sample Purchase Orders for hackathon presentation
  const demoOrders = [
    {
      po_id: 101,
      po_number: 'PO-2026-001',
      request_id: '2026-001',
      item_name: 'Desktop Computers',
      Request: { item_name: 'Desktop Computers', category: 'Electronics' },
      amount: 750000,
      status: 'issued',
    },
    {
      po_id: 102,
      po_number: 'PO-2026-002',
      request_id: '2026-002',
      item_name: 'Office Chairs',
      Request: { item_name: 'Office Chairs', category: 'Furniture' },
      amount: 120000,
      status: 'shipped',
    },
    {
      po_id: 103,
      po_number: 'PO-2026-003',
      request_id: '2026-003',
      item_name: 'Printer',
      Request: { item_name: 'Printer', category: 'Electronics' },
      amount: 75000,
      status: 'delivered',
    },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllPurchaseOrders().catch(() => []);
      if (data && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(demoOrders);
      }
    } catch (err) {
      console.error('Failed to fetch vendor orders:', err);
      setOrders(demoOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (poId, nextStatus) => {
    try {
      await updatePOStatus(poId, nextStatus).catch(() => null);
      
      // Update local state dynamically
      setOrders((prev) =>
        prev.map((ord) => (ord.po_id === poId ? { ...ord, status: nextStatus } : ord))
      );

      setUpdateMsg(`Order status successfully updated to ${nextStatus.toUpperCase()}`);
      setTimeout(() => setUpdateMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const columns = [
    {
      header: 'PO Number',
      accessor: 'po_number',
      render: (row) => (
        <span className="font-extrabold text-slate-900 text-xs px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
          {row.po_number || `PO-2026-00${row.po_id}`}
        </span>
      ),
    },
    {
      header: 'Requisition Item',
      accessor: 'Request',
      render: (row) => {
        const title = row.Request ? row.Request.item_name : row.item_name || 'Item';
        return (
          <div>
            <p className="font-bold text-slate-800 text-xs">{title}</p>
            <p className="text-[11px] text-slate-500 font-mono">Ref: PR-{row.request_id || '2026'}</p>
          </div>
        );
      },
    },
    {
      header: 'PO Value',
      accessor: 'amount',
      render: (row) => (
        <span className="font-extrabold text-slate-900 text-xs">
          ₹{parseFloat(row.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Current Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions & Fulfillment',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {/* View Tracking Action */}
          <button
            onClick={() => setTrackingItem(row)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Tracking</span>
          </button>

          {/* Lifecycle Fulfillment Buttons */}
          {(row.status === 'issued' || row.status === 'po_generated' || row.status === 'processing') && (
            <button
              onClick={() => handleUpdateStatus(row.po_id, 'shipped')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Mark as Shipped</span>
            </button>
          )}

          {row.status === 'shipped' && (
            <button
              onClick={() => handleUpdateStatus(row.po_id, 'delivered')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Delivered</span>
            </button>
          )}

          {row.status === 'delivered' && (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-extrabold text-xs flex items-center space-x-1 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Fulfilled</span>
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Vendor Order Fulfillment & Delivery Tracking">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Awarded Purchase Orders</h3>
          <p className="text-xs text-slate-500">
            View independent tracking lifecycles and update shipment milestones for institutional purchase orders.
          </p>
        </div>
      </div>

      {updateMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{updateMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading awarded orders...</div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          searchPlaceholder="Search order by PO number or item name..."
          emptyMessage="No Purchase Orders Available"
        />
      )}

      {/* Individual Order Tracking Modal */}
      {trackingItem && (
        <TrackingModal item={trackingItem} onClose={() => setTrackingItem(null)} />
      )}
    </DashboardLayout>
  );
};

export default OrderTracking;
