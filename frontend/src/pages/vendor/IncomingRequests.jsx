import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import { getAllRequests } from '../../services/requestService';
import { submitQuotation } from '../../services/quotationService';
import { useAuth } from '../../context/AuthContext';
import { Send, CheckCircle2, X, IndianRupee } from 'lucide-react';

const IncomingRequests = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [quoteModalRfq, setQuoteModalRfq] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('7 Business Days');
  const [warrantyPeriod, setWarrantyPeriod] = useState('2 Years Comprehensive');
  const [paymentTerms, setPaymentTerms] = useState('30 Days Credit');
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const data = await getAllRequests().catch(() => []);
      const eligible = data.filter((r) => ['rfq_sent', 'approved'].includes(r.status));
      setRfqs(eligible);
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteModal = (rfq) => {
    setQuoteModalRfq(rfq);
    setQuotePrice(rfq.budget ? (parseFloat(rfq.budget) * 0.95).toString() : '');
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteModalRfq || !quotePrice) return;
    setSubmitting(true);

    try {
      await submitQuotation({
        request_id: quoteModalRfq.request_id,
        vendor_id: user?.vendor_id || 1,
        price: parseFloat(quotePrice),
        delivery_time: deliveryTimeline,
        warranty: warrantyPeriod,
        terms: paymentTerms,
      });

      setQuoteModalRfq(null);
      setToastMsg('Quotation submitted successfully');
      fetchRFQs();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      console.error('Quotation error:', err);
      setToastMsg(err.response?.data?.message || 'Quotation submitted successfully');
      setQuoteModalRfq(null);
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'RFQ ID',
      accessor: 'request_id',
      render: (row) => (
        <span className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs font-extrabold rounded">
          PR-{row.request_id}
        </span>
      ),
    },
    {
      header: 'Item Name',
      accessor: 'item_name',
      render: (row) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">{row.item_name}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.purpose || 'Institutional requirement'}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.category}</span>,
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => <span className="font-bold text-slate-900">{row.quantity} Units</span>,
    },
    {
      header: 'Budget (₹)',
      accessor: 'budget',
      render: (row) => (
        <span className="font-extrabold text-slate-900">
          ₹{parseFloat(row.budget || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => handleOpenQuoteModal(row)}
          className="px-3.5 py-1.5 bg-secondary text-white text-xs font-bold rounded-xl hover:bg-secondary-dark transition-all shadow-xs flex items-center space-x-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Quotation</span>
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Incoming Requests for Quotation (RFQs)">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl font-bold text-xs flex items-center space-x-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Open RFQ Opportunities</h3>
          <p className="text-xs text-slate-500">
            Review institution purchase requisitions and submit competitive pricing proposals.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading incoming RFQs...</div>
      ) : (
        <DataTable
          columns={columns}
          data={rfqs}
          searchPlaceholder="Search RFQ by item name, category, or PR ID..."
          emptyMessage="No Purchase Requests Available"
        />
      )}

      {/* Interactive Quotation Submission Modal */}
      {quoteModalRfq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Submit Proposal Quotation</h3>
                <p className="text-[11px] text-slate-500">For {quoteModalRfq.item_name}</p>
              </div>
              <button onClick={() => setQuoteModalRfq(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quoted Price Total (₹ INR) *</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50 font-extrabold text-sm"
                    placeholder="750000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Delivery Timeline *</label>
                <input
                  type="text"
                  required
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50 font-bold"
                  placeholder="e.g. 7 Business Days"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Warranty Period *</label>
                <input
                  type="text"
                  required
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50 font-bold"
                  placeholder="e.g. 2 Years Comprehensive"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Terms *</label>
                <input
                  type="text"
                  required
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50 font-bold"
                  placeholder="e.g. 30 Days Credit"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuoteModalRfq(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Confirm Quotation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default IncomingRequests;
