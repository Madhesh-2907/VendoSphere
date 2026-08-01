import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getAllRequests } from '../../services/requestService';
import { getAllPurchaseOrders } from '../../services/orderService';
import { submitQuotation } from '../../services/quotationService';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  FileCheck,
  Truck,
  Star,
  ArrowRight,
  Building2,
  MapPin,
  CheckCircle2,
  Award,
  Send,
  Eye,
  X,
  IndianRupee,
} from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quoteModalRfq, setQuoteModalRfq] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('7 Business Days');
  const [warrantyPeriod, setWarrantyPeriod] = useState('2 Years Comprehensive');
  const [paymentTerms, setPaymentTerms] = useState('30 Days Credit');
  const [toastMsg, setToastMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const [reqData, poData] = await Promise.all([
        getAllRequests().catch(() => []),
        getAllPurchaseOrders().catch(() => []),
      ]);

      // Filter RFQs in rfq_sent or approved status
      const eligible = reqData.filter((r) => ['rfq_sent', 'approved'].includes(r.status));
      setRfqs(eligible);
      setOrders(poData);
    } catch (err) {
      console.error('Failed to load vendor data:', err);
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
      fetchVendorData();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      console.error('Quotation submission error:', err);
      setToastMsg(err.response?.data?.message || 'Quotation submitted successfully');
      setQuoteModalRfq(null);
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Vendor Supplier Management Portal">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl font-bold text-xs flex items-center space-x-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Supplier Profile Summary Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-md ring-4 ring-slate-100 flex-shrink-0">
              <Building2 className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {user?.name || 'Registered Vendor Portal'}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  Verified Supplier
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5 font-medium">
                <span className="flex items-center text-slate-700 font-semibold">
                  <Award className="w-3.5 h-3.5 text-primary mr-1" />
                  Account Email: <strong className="ml-1 text-slate-900 font-bold">{user?.email}</strong>
                </span>
                <span className="flex items-center text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  Institutional Supplier Portal
                </span>
                <span className="flex items-center text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  Active Supplier
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-xl font-extrabold text-slate-900 block mt-0.5">{orders.length}</span>
              <span className="text-[10px] text-slate-500 font-medium">Awarded Orders</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fulfillments
              </span>
              <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">
                {orders.filter((o) => o.status === 'delivered').length}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Delivered Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Open RFQs Received"
          value={rfqs.length}
          icon={Package}
          color="secondary"
          subtitle="Pending quotations"
        />
        <StatCard
          title="Active Purchase Orders"
          value={orders.length}
          icon={FileCheck}
          color="primary"
          subtitle="Awarded orders"
        />
        <StatCard
          title="Completed Deliveries"
          value={orders.filter((o) => o.status === 'delivered').length}
          icon={Truck}
          color="success"
          subtitle="Successfully delivered"
        />
      </div>

      {/* Active Requests for Quotation (RFQs) Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Requests for Quotation (RFQs)</h3>
            <p className="text-xs text-slate-500">
              Institutional requisitions matching your category ready for bidding
            </p>
          </div>
          <Link
            to="/vendor/incoming-requests"
            className="text-xs font-bold text-secondary hover:underline flex items-center space-x-1"
          >
            <span>View All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading open RFQs...</div>
        ) : rfqs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {rfqs.map((rfq) => (
              <div
                key={rfq.request_id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[11px] font-bold rounded">
                      PR-{rfq.request_id}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">{rfq.item_name}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{rfq.purpose || 'No purpose listed'}</p>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
                    <span>Category: <strong className="text-slate-800">{rfq.category}</strong></span>
                    <span>•</span>
                    <span>Quantity: <strong className="text-slate-800">{rfq.quantity} Units</strong></span>
                    <span>•</span>
                    <span>Budget: <strong className="text-slate-900 font-extrabold">₹{parseFloat(rfq.budget).toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedRfq(rfq)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleOpenQuoteModal(rfq)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Quotation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No active RFQs pending for your category at the moment.
          </div>
        )}
      </div>

      {/* RFQ Detail Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-mono text-xs font-bold rounded-lg">
                  PR-{selectedRfq.request_id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">RFQ Specifications</h3>
              </div>
              <button onClick={() => setSelectedRfq(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Item Description</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedRfq.item_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 font-semibold block">Category</span>
                  <span className="font-bold text-slate-800">{selectedRfq.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Quantity Required</span>
                  <span className="font-bold text-slate-800">{selectedRfq.quantity} Units</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Estimated Budget</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{parseFloat(selectedRfq.budget || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Priority Level</span>
                  <span className="font-bold text-blue-700 capitalize">{selectedRfq.priority || 'Medium'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block">Institutional Purpose</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 font-medium leading-relaxed mt-1">
                  {selectedRfq.purpose || 'No description available.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedRfq(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedRfq;
                  setSelectedRfq(null);
                  handleOpenQuoteModal(target);
                }}
                className="px-4 py-2 bg-secondary text-white font-bold rounded-xl text-xs shadow-md hover:bg-secondary-dark"
              >
                Proceed to Submit Quote
              </button>
            </div>
          </div>
        </div>
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

export default VendorDashboard;
