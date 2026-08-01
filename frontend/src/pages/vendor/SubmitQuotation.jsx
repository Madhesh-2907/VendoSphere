import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { submitQuotation } from '../../services/quotationService';
import { getAllRequests } from '../../services/requestService';
import { Send, IndianRupee, Clock, Shield, FileText, ArrowLeft } from 'lucide-react';

const SubmitQuotation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(location.state?.request || null);
  const [formData, setFormData] = useState({
    price: '',
    delivery_time: '7 Business Days',
    warranty: '2 Years Manufacturer Warranty',
    terms: 'Net 30 Days | Free Delivery Included',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!selectedReq) {
      fetchRequests();
    }
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getAllRequests();
      const eligible = data.filter((r) => ['rfq_sent', 'approved'].includes(r.status));
      setRequests(eligible);
      if (eligible.length > 0) {
        setSelectedReq(eligible[0]);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedReq || !formData.price) {
      setError('Please select a purchase requisition and specify a quotation price.');
      return;
    }

    setLoading(true);
    try {
      await submitQuotation({
        request_id: selectedReq.request_id,
        price: parseFloat(formData.price),
        delivery_time: formData.delivery_time,
        warranty: formData.warranty,
        terms: formData.terms,
      });

      setSuccess('Quotation submitted successfully! The procurement admin will review your proposal.');
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quotation proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Submit Supplier Quotation">
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to RFQs</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-3 bg-teal-50 text-secondary rounded-xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quotation Proposal Submission</h3>
              <p className="text-xs text-slate-500">
                Provide commercial terms, unit pricing, warranty details, and estimated delivery timeframe.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Target Requisition Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Requisition *
              </label>
              {selectedReq ? (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 mr-2">PR-{selectedReq.request_id}</span>
                    <span className="font-bold text-slate-800">{selectedReq.item_name}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Category: {selectedReq.category} &bull; Qty: {selectedReq.quantity} &bull; Budget: ₹{parseFloat(selectedReq.budget).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {!location.state?.request && requests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedReq(null)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : (
                <select
                  onChange={(e) => {
                    const req = requests.find((r) => r.request_id === Number(e.target.value));
                    setSelectedReq(req);
                  }}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50"
                >
                  <option value="">Select a Requisition...</option>
                  {requests.map((r) => (
                    <option key={r.request_id} value={r.request_id}>
                      PR-{r.request_id}: {r.item_name} (₹{parseFloat(r.budget).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Price & Delivery Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quoted Total Price (₹ INR) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 11800.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Delivery Timeframe *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Business Days"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Warranty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warranty & After-Sales Support Terms
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. 3 Years Premier On-site Warranty Included"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50"
                />
              </div>
            </div>

            {/* Payment & Terms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Schedule & Commercial Terms
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Net 30 days payment upon delivery confirmation. Includes free shipping and on-site installation."
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-slate-50/50"
              />
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-secondary hover:bg-secondary-dark text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Proposal...' : 'Submit Quotation'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmitQuotation;
