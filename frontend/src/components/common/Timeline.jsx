import React from 'react';
import { CheckCircle2, Clock, Truck, FileCheck, Package, Tag, FileText } from 'lucide-react';

export const steps = [
  { key: 'pending', title: 'Request Created', icon: Clock },
  { key: 'approved', title: 'Admin Approved', icon: FileCheck },
  { key: 'rfq_sent', title: 'RFQ Sent to Vendors', icon: Package },
  { key: 'quotation_selected', title: 'Quotation Selected', icon: Tag },
  { key: 'po_generated', title: 'Purchase Order Issued', icon: FileText },
  { key: 'shipped', title: 'Order Shipped', icon: Truck },
  { key: 'delivered', title: 'Delivered & Confirmed', icon: CheckCircle2 },
];

export const mapStatusToIndex = (status) => {
  if (!status) return 0;
  const s = status.toLowerCase().trim();

  switch (s) {
    case 'pending':
      return 0;
    case 'approved':
      return 1;
    case 'rfq_sent':
    case 'sent':
      return 2;
    case 'quotation_selected':
    case 'quoted':
      return 3;
    case 'issued':
    case 'po_generated':
    case 'processing':
      return 4;
    case 'shipped':
      return 5;
    case 'delivered':
    case 'completed':
    case 'confirmed':
      return 6;
    default:
      return 0;
  }
};

const Timeline = ({ currentStatus, dates = {} }) => {
  const currentIndex = mapStatusToIndex(currentStatus);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center relative group">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-slate-300 border-slate-200'
                  } ${isCurrent ? 'ring-4 ring-primary/20 scale-105' : ''}`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold mt-2 text-center max-w-[85px] leading-tight ${
                    isCompleted ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                {dates[step.key] && (
                  <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                    {dates[step.key]}
                  </span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1.5 sm:mx-2 rounded transition-colors ${
                    idx < currentIndex ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
