import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { getAllRequests } from '../../services/requestService';
import { getQuotationsByRequestId } from '../../services/quotationService';
import { createPurchaseOrder } from '../../services/orderService';
import { GitCompare, Check, Award, IndianRupee, Clock, Shield, ArrowRight, FileCheck } from 'lucide-react';

const QuotationComparison = () => {
  const [requests, setRequests] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const data = await getAllRequests();
      // Filter requests that are approved or have RFQ sent or PO generated
      const eligible = data.filter((r) => ['approved', 'rfq_sent', 'po_generated', 'delivered'].includes(r.status));
      setRequests(eligible);
      if (eligible.length > 0) {
        setSelectedReqId(eligible[0].request_id);
        fetchQuotations(eligible[0].request_id);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoadingReqs(false);
    }
  };

  const fetchQuotations = async (reqId) => {
    setLoadingQuotes(true);
    try {
      const data = await getQuotationsByRequestId(reqId);
      setQuotations(data);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleSelectRequest = (reqId) => {
    setSelectedReqId(reqId);
    fetchQuotations(reqId);
  };

  const handleSelectWinner = async (quotationId) => {
    if (!selectedReqId) return;
    try {
      const res = await createPurchaseOrder({
        request_id: selectedReqId,
        quotation_id: quotationId,
      });

      setSuccessMsg(
        `🎉 Quotation accepted! Purchase Order ${res.purchaseOrder?.po_number || ''} auto-generated.`
      );
      fetchApprovedRequests();
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/admin/purchase-orders');
      }, 2500);
    } catch (err) {
      console.error('Failed to generate PO:', err);
    }
  };

  const activeRequest = requests.find((r) => r.request_id === Number(selectedReqId));

  return (
    <DashboardLayout title="Side-by-Side Quotation Comparison">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Supplier Quotation Matrix</h3>
          <p className="text-xs text-slate-500">
            Compare vendor proposals side-by-side on pricing, delivery timelines, warranty terms, and select the winning bidder.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold shadow-sm animate-in fade-in flex items-center justify-between">
          <span>{successMsg}</span>
          <button
            onClick={() => navigate('/admin/purchase-orders')}
            className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
          >
            View Orders &rarr;
          </button>
        </div>
      )}

      {/* Select Request Selector Dropdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Requisition to Compare Vendor Proposals:
        </label>
        {loadingReqs ? (
          <div className="text-xs text-slate-400">Loading requisitions...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map((r) => {
              const isSelected = r.request_id === Number(selectedReqId);
              return (
                <div
                  key={r.request_id}
                  onClick={() => handleSelectRequest(r.request_id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">PR-{r.request_id}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="font-bold text-xs text-slate-800 mt-1 truncate">{r.item_name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Budget: ₹{parseFloat(r.budget).toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Matrix Grid */}
      {activeRequest && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-primary" />
              <span>Proposals for: {activeRequest.item_name} (Budget: ₹{parseFloat(activeRequest.budget).toLocaleString('en-IN')})</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold">{quotations.length} Quotations Received</span>
          </div>

          {loadingQuotes ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading vendor quotations...</div>
          ) : quotations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quotations.map((q, idx) => {
                const isLowestPrice =
                  quotations.length > 1 &&
                  q.price === Math.min(...quotations.map((item) => Number(item.price)));

                return (
                  <div
                    key={q.quotation_id}
                    className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between relative transition-all hover:shadow-md ${
                      isLowestPrice ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
                    }`}
                  >
                    {isLowestPrice && (
                      <span className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Best Value Quote</span>
                      </span>
                    )}

                    <div>
                      {/* Vendor Header */}
                      <div className="pb-4 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          Bidder #{idx + 1}
                        </span>
                        <h5 className="text-base font-extrabold text-slate-900 mt-0.5">
                          {q.Vendor ? q.Vendor.company_name : `Vendor #${q.vendor_id}`}
                        </h5>
                        <p className="text-xs text-slate-500">Category: {q.Vendor?.category || activeRequest.category}</p>
                      </div>

                      {/* Financial & Delivery Details */}
                      <div className="py-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                            <span>Quoted Price</span>
                          </span>
                          <span className="text-lg font-black text-slate-900">
                            ₹{parseFloat(q.price).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Delivery Time</span>
                          </span>
                          <span className="text-xs font-bold text-slate-800">{q.delivery_time}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            <span>Warranty</span>
                          </span>
                          <span className="text-xs font-bold text-slate-800">{q.warranty || 'Standard'}</span>
                        </div>

                        <div className="pt-2">
                          <span className="text-[11px] text-slate-500 font-semibold">Payment & Terms:</span>
                          <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                            {q.terms || 'Net 30 Days'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-100">
                      {activeRequest.status === 'po_generated' || activeRequest.status === 'delivered' ? (
                        <div className="w-full py-2 bg-slate-100 text-slate-500 text-center font-bold text-xs rounded-xl flex items-center justify-center space-x-1">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>PO Already Issued</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectWinner(q.quotation_id)}
                          className="w-full py-2.5 bg-primary hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Select Vendor & Issue PO</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No quotations received for this requisition yet. Vendors receive RFQs upon admin approval.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default QuotationComparison;
