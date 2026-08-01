import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import {
  getAllVendors,
  createVendor,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
} from '../../services/vendorService';
import {
  Users,
  Plus,
  Star,
  X,
  Building,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Power,
} from 'lucide-react';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewVendor, setViewVendor] = useState(null);
  const [editVendor, setEditVendor] = useState(null);
  const [deleteConfirmVendor, setDeleteConfirmVendor] = useState(null);

  const [newVendor, setNewVendor] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    password: '',
    phone: '',
    category: 'Electronics',
    address: '',
    contact: '',
    status: 'active',
  });

  const [actionMessage, setActionMessage] = useState('');

  const categories = [
    'Electronics',
    'Stationery',
    'Furniture',
    'Food & Grocery',
    'Hardware',
  ];

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await getAllVendors();
      setVendors(data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status Toggle (Activate/Deactivate)
  const handleStatusToggle = async (vendorId, currentStatus) => {
    let nextStatus = 'active';
    if (currentStatus === 'active' || currentStatus === 'approved') {
      nextStatus = 'inactive';
    } else {
      nextStatus = 'active';
    }

    try {
      await updateVendorStatus(vendorId, nextStatus);
      setActionMessage(`Vendor status updated to ${nextStatus.toUpperCase()}`);
      fetchVendors();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update vendor status:', err);
    }
  };

  // Add Vendor
  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await createVendor({
        ...newVendor,
        contact: newVendor.contact || `${newVendor.phone || ''} ${newVendor.email || ''}`.trim(),
      });
      setShowAddModal(false);
      setNewVendor({
        company_name: '',
        contact_person: '',
        email: '',
        password: '',
        phone: '',
        category: 'Electronics',
        address: '',
        contact: '',
        status: 'active',
      });
      fetchVendors();
      setActionMessage('New vendor registered successfully with login account!');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Failed to add vendor:', err);
    }
  };

  // Edit Vendor Submit
  const handleEditVendorSubmit = async (e) => {
    e.preventDefault();
    if (!editVendor) return;

    try {
      await updateVendor(editVendor.vendor_id, {
        company_name: editVendor.company_name,
        contact_person: editVendor.contact_person,
        email: editVendor.email,
        phone: editVendor.phone,
        category: editVendor.category,
        address: editVendor.address,
        status: editVendor.status,
        contact: `${editVendor.phone || ''} ${editVendor.email || ''}`.trim() || editVendor.contact,
      });
      setEditVendor(null);
      fetchVendors();
      setActionMessage('Vendor details updated successfully!');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update vendor:', err);
    }
  };

  // Soft Delete Confirmation Execution
  const handleConfirmDelete = async () => {
    if (!deleteConfirmVendor) return;

    try {
      await deleteVendor(deleteConfirmVendor.vendor_id);
      setDeleteConfirmVendor(null);
      fetchVendors();
      setActionMessage(`Vendor "${deleteConfirmVendor.company_name}" soft-deleted successfully.`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  const columns = [
    {
      header: 'Vendor ID',
      accessor: 'vendor_id',
      render: (row) => <span className="font-extrabold text-slate-900">VEN-{row.vendor_id}</span>,
    },
    {
      header: 'Company Name',
      accessor: 'company_name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.company_name}</p>
          <p className="text-[11px] text-slate-500">{row.contact_person ? `Contact: ${row.contact_person}` : row.contact}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-700 text-xs">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (row) => (
        <div className="flex items-center space-x-1 font-bold text-amber-600">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{row.rating || '4.5'}</span>
        </div>
      ),
    },
    {
      header: 'Verification Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-1">
          {/* View Profile */}
          <button
            onClick={() => setViewVendor(row)}
            title="View Vendor Profile"
            className="p-1.5 bg-slate-100 hover:bg-primary hover:text-white text-slate-600 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit Vendor */}
          <button
            onClick={() => setEditVendor({ ...row })}
            title="Edit Vendor Details"
            className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Activate/Deactivate Toggle */}
          <button
            onClick={() => handleStatusToggle(row.vendor_id, row.status)}
            title={row.status === 'active' || row.status === 'approved' ? 'Deactivate Vendor' : 'Activate Vendor'}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1 ${
              row.status === 'active' || row.status === 'approved'
                ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-amber-50 hover:text-amber-700'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{row.status === 'active' || row.status === 'approved' ? 'Deactivate' : 'Activate'}</span>
          </button>

          {/* Delete Vendor (Soft Delete) */}
          <button
            onClick={() => setDeleteConfirmVendor(row)}
            title="Delete Vendor"
            className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition-colors border border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Vendor Directory & Verification">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Institutional Supplier Network</h3>
          <p className="text-xs text-slate-500">
            Comprehensive vendor profile management, category assignment, verification toggles, and status updates.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-primary hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Vendor</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading vendor database...</div>
      ) : (
        <DataTable
          columns={columns}
          data={vendors}
          searchPlaceholder="Search vendor by company name, contact, or category..."
          emptyMessage="No vendors registered yet"
        />
      )}

      {/* 1. VIEW VENDOR PROFILE MODAL */}
      {viewVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">Vendor Profile Details</h3>
              </div>
              <button onClick={() => setViewVendor(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">{viewVendor.company_name}</span>
                <StatusBadge status={viewVendor.status} />
              </div>
              <p className="text-slate-500 font-semibold">Vendor ID: VEN-{viewVendor.vendor_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-semibold flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Person</span>
                </p>
                <p className="font-bold text-slate-900 mt-0.5">{viewVendor.contact_person || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Category</p>
                <p className="font-bold text-slate-900 mt-0.5">{viewVendor.category}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </p>
                <p className="font-bold text-slate-900 mt-0.5">{viewVendor.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone Number</span>
                </p>
                <p className="font-bold text-slate-900 mt-0.5">{viewVendor.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 font-semibold flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Address</span>
                </p>
                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  {viewVendor.address || viewVendor.contact || 'No physical address provided.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewVendor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT VENDOR MODAL */}
      {editVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Vendor Details</h3>
              </div>
              <button onClick={() => setEditVendor(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditVendorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={editVendor.company_name || ''}
                  onChange={(e) => setEditVendor({ ...editVendor, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editVendor.contact_person || ''}
                    onChange={(e) => setEditVendor({ ...editVendor, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Category *</label>
                  <select
                    value={editVendor.category || categories[0]}
                    onChange={(e) => setEditVendor({ ...editVendor, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editVendor.email || ''}
                    onChange={(e) => setEditVendor({ ...editVendor, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editVendor.phone || ''}
                    onChange={(e) => setEditVendor({ ...editVendor, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                <textarea
                  rows="2"
                  value={editVendor.address || ''}
                  onChange={(e) => setEditVendor({ ...editVendor, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verification Status</label>
                <select
                  value={editVendor.status || 'active'}
                  onChange={(e) => setEditVendor({ ...editVendor, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                >
                  <option value="active">Active</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Verification</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted (Soft Delete)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditVendor(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deleteConfirmVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Vendor Deletion</h3>
                <p className="text-xs text-slate-500">Soft delete vendor profile from system</p>
              </div>
            </div>

            <div className="py-2 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900 text-sm">
                Are you sure you want to delete this vendor?
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">{deleteConfirmVendor.company_name}</p>
                <p className="text-slate-500">Category: {deleteConfirmVendor.category}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmVendor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REGISTER NEW VENDOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">Register New Supplier</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Scientific Instruments"
                  value={newVendor.company_name}
                  onChange={(e) => setNewVendor({ ...newVendor, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newVendor.contact_person}
                    onChange={(e) => setNewVendor({ ...newVendor, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Category *</label>
                  <select
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sales@acme.com"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Password</label>
                  <input
                    type="password"
                    placeholder="Default: vendor123"
                    value={newVendor.password}
                    onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows="2"
                  placeholder="Street Address, City, State, ZIP"
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={newVendor.status}
                  onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                >
                  <option value="active">Active</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-slate-900 shadow-xs text-xs"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VendorManagement;
