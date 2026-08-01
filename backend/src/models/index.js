const User = require('./User');
const Vendor = require('./Vendor');
const Category = require('./Category');
const PurchaseRequest = require('./PurchaseRequest');
const Approval = require('./Approval');
const Quotation = require('./Quotation');
const PurchaseOrder = require('./PurchaseOrder');
const Delivery = require('./Delivery');

// User & Vendor
User.hasOne(Vendor, { foreignKey: 'user_id', as: 'VendorProfile' });
Vendor.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// User & PurchaseRequest (Employee)
User.hasMany(PurchaseRequest, { foreignKey: 'employee_id', as: 'Requests' });
PurchaseRequest.belongsTo(User, { foreignKey: 'employee_id', as: 'Employee' });

// PurchaseRequest & Approval
PurchaseRequest.hasMany(Approval, { foreignKey: 'request_id', as: 'Approvals' });
Approval.belongsTo(PurchaseRequest, { foreignKey: 'request_id', as: 'Request' });

User.hasMany(Approval, { foreignKey: 'admin_id', as: 'AdminApprovals' });
Approval.belongsTo(User, { foreignKey: 'admin_id', as: 'Admin' });

// PurchaseRequest & Quotation
PurchaseRequest.hasMany(Quotation, { foreignKey: 'request_id', as: 'Quotations' });
Quotation.belongsTo(PurchaseRequest, { foreignKey: 'request_id', as: 'Request' });

// Vendor & Quotation
Vendor.hasMany(Quotation, { foreignKey: 'vendor_id', as: 'Quotations' });
Quotation.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'Vendor' });

// PurchaseOrder associations
PurchaseRequest.hasOne(PurchaseOrder, { foreignKey: 'request_id', as: 'PurchaseOrder' });
PurchaseOrder.belongsTo(PurchaseRequest, { foreignKey: 'request_id', as: 'Request' });

Vendor.hasMany(PurchaseOrder, { foreignKey: 'vendor_id', as: 'PurchaseOrders' });
PurchaseOrder.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'Vendor' });

Quotation.hasOne(PurchaseOrder, { foreignKey: 'quotation_id', as: 'PurchaseOrder' });
PurchaseOrder.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'Quotation' });

// Delivery & PurchaseOrder
PurchaseOrder.hasOne(Delivery, { foreignKey: 'po_id', as: 'Delivery' });
Delivery.belongsTo(PurchaseOrder, { foreignKey: 'po_id', as: 'PurchaseOrder' });

module.exports = {
  User,
  Vendor,
  Category,
  PurchaseRequest,
  Approval,
  Quotation,
  PurchaseOrder,
  Delivery,
};
