import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CreateRequest from './pages/employee/CreateRequest';
import MyRequests from './pages/employee/MyRequests';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorManagement from './pages/admin/VendorManagement';
import RequestApprovals from './pages/admin/RequestApprovals';
import QuotationComparison from './pages/admin/QuotationComparison';
import PurchaseOrders from './pages/admin/PurchaseOrders';
import DeliveryTracking from './pages/admin/DeliveryTracking';
import Reports from './pages/admin/Reports';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import IncomingRequests from './pages/vendor/IncomingRequests';
import SubmitQuotation from './pages/vendor/SubmitQuotation';
import OrderTracking from './pages/vendor/OrderTracking';

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Employee Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/create-request" element={<CreateRequest />} />
            <Route path="/employee/my-requests" element={<MyRequests />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vendor-management" element={<VendorManagement />} />
            <Route path="/admin/request-approvals" element={<RequestApprovals />} />
            <Route path="/admin/quotation-comparison" element={<QuotationComparison />} />
            <Route path="/admin/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/admin/delivery-tracking" element={<DeliveryTracking />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Vendor Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['vendor', 'admin']} />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/incoming-requests" element={<IncomingRequests />} />
            <Route path="/vendor/submit-quotation" element={<SubmitQuotation />} />
            <Route path="/vendor/order-tracking" element={<OrderTracking />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
