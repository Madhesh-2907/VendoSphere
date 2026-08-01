import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  CheckSquare,
  GitCompare,
  ShoppingBag,
  Truck,
  BarChart3,
  Building2,
  Package,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/create-request', label: 'New Request', icon: FilePlus },
    { to: '/employee/my-requests', label: 'My Requests', icon: FileText },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/request-approvals', label: 'Request Approvals', icon: CheckSquare },
    { to: '/admin/quotation-comparison', label: 'Compare Quotations', icon: GitCompare },
    { to: '/admin/purchase-orders', label: 'Purchase Orders', icon: ShoppingBag },
    { to: '/admin/vendor-management', label: 'Vendor Directory', icon: Users },
    { to: '/admin/delivery-tracking', label: 'Delivery Tracking', icon: Truck },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const vendorLinks = [
    { to: '/vendor/dashboard', label: 'Vendor Dashboard', icon: LayoutDashboard },
    { to: '/vendor/incoming-requests', label: 'Incoming RFQs', icon: Package },
    { to: '/vendor/order-tracking', label: 'Order Fulfillment', icon: Truck },
  ];

  const navItems =
    role === 'admin' ? adminLinks : role === 'vendor' ? vendorLinks : employeeLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 shadow-xl min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800 bg-slate-950/60">
        <div className="bg-primary p-2 rounded-lg text-white shadow-md">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
            Campus<span className="text-blue-400">Procure</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
            Enterprise ERP
          </p>
        </div>
      </div>

      {/* User Role Banner */}
      <div className="mx-4 my-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between">
        <div className="truncate">
          <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
          <p className="text-[11px] text-slate-400 capitalize">{role} Portal</p>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
            role === 'admin'
              ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
              : role === 'vendor'
              ? 'bg-teal-900/60 text-teal-300 border border-teal-700'
              : 'bg-blue-900/60 text-blue-300 border border-blue-700'
          }`}
        >
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Navigation Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-md border-l-4 border-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        CampusProcure v1.0 &bull; Hackathon Edition
      </div>
    </aside>
  );
};

export default Sidebar;
