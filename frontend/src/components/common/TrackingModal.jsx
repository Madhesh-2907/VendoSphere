import React from 'react';
import Timeline, { steps, mapStatusToIndex } from './Timeline';
import StatusBadge from './StatusBadge';
import { X, Truck, Package, Building, Calendar, CheckCircle2, Clock, MapPin, Tag } from 'lucide-react';

const TrackingModal = ({ item, onClose }) => {
  if (!item) return null;

  const id = item.po_number || `PR-${item.request_id || item.id}`;
  const productName = item.Request?.item_name || item.item_name || item.title || 'Equipment / Material';
  const vendorName = item.Vendor?.company_name || item.vendor_name || 'Assigned Supplier';
  const amount = item.amount || item.price || item.estimated_budget || 0;
  const category = item.Request?.category || item.category || 'General Procurement';
  const status = item.status || 'pending';

  const createdDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const updatedDate = item.updated_at
    ? new Date(item.updated_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'In Progress';

  const currentIndex = mapStatusToIndex(status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900">Order & Shipment Tracking</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  {id}
                </span>
              </div>
              <p className="text-xs text-slate-500">Real-time lifecycle oversight for individual procurement items.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product & Order Details Grid Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Product / Item</span>
            <span className="font-extrabold text-slate-900 text-sm block truncate" title={productName}>
              {productName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Vendor / Supplier</span>
            <span className="font-bold text-slate-800 block truncate" title={vendorName}>
              {vendorName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Total Value</span>
            <span className="font-extrabold text-slate-900 text-sm block">
              ₹{parseFloat(amount).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Current Delivery Status</span>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* 7-Step Lifecycle Visual Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Package className="w-4 h-4 text-primary" />
              <span>Independent Milestone Progression</span>
            </p>
            <span className="text-[11px] text-slate-500 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Expected Delivery / Last Action: <strong>{updatedDate}</strong></span>
            </span>
          </div>
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 overflow-x-auto">
            <Timeline currentStatus={status} />
          </div>
        </div>

        {/* Sequential Milestone Event Log Table */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-800">Lifecycle Milestone Audit Trail</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={step.key}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    isCurrent
                      ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isCompleted ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className={`font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isCurrent ? 'Current Stage' : isCompleted ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {isCompleted ? (idx === 0 ? createdDate : updatedDate) : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-between items-center border-t border-slate-100 text-xs text-slate-500">
          <span>Category: <strong className="text-slate-700">{category}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            Close Tracking Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
