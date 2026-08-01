const { PurchaseRequest, Vendor, PurchaseOrder, Approval, Quotation, User } = require('../models');
const { Sequelize } = require('sequelize');

const getSummaryMetrics = async (req, res) => {
  try {
    const totalRequests = await PurchaseRequest.count();
    const pendingApprovals = await PurchaseRequest.count({ where: { status: 'pending' } });
    const activeVendors = await Vendor.count({ where: { status: ['active', 'approved'] } });

    const totalSpendResult = await PurchaseOrder.sum('amount');
    const totalSpend = totalSpendResult ? parseFloat(totalSpendResult) : 0;

    return res.json({
      totalRequests,
      pendingApprovals,
      activeVendors,
      totalSpend,
    });
  } catch (error) {
    console.error('Error fetching summary metrics:', error);
    return res.status(500).json({ message: 'Failed to fetch summary metrics', error: error.message });
  }
};

const getSpendByCategory = async (req, res) => {
  try {
    // Get all POs with their associated PurchaseRequest category
    const orders = await PurchaseOrder.findAll({
      include: [{ model: PurchaseRequest, as: 'Request', attributes: ['category'] }],
    });

    const categoryMap = {
      'Electronics': 0,
      'Stationery': 0,
      'Furniture': 0,
      'Food & Grocery': 0,
      'Hardware': 0,
    };

    orders.forEach((po) => {
      const cat = po.Request ? po.Request.category : 'General';
      const amount = parseFloat(po.amount) || 0;
      if (categoryMap[cat] !== undefined) {
        categoryMap[cat] += amount;
      } else {
        categoryMap[cat] = amount;
      }
    });

    // Filter out categories with 0 spend or return empty array if total spend is 0
    const data = Object.keys(categoryMap)
      .map((cat) => ({
        category: cat,
        amount: categoryMap[cat],
      }))
      .filter((item) => item.amount > 0);

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch spend by category', error: error.message });
  }
};

const getActivityFeed = async (req, res) => {
  try {
    const activities = [];

    // 1. Purchase requests created
    const requests = await PurchaseRequest.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'Employee', attributes: ['name'] }],
    });
    requests.forEach((r) => {
      activities.push({
        id: `pr-${r.request_id}`,
        type: 'request_created',
        title: `New Purchase Request #${r.request_id}`,
        description: `${r.Employee ? r.Employee.name : 'Employee'} requested "${r.item_name}" (₹${r.budget.toLocaleString('en-IN')})`,
        timestamp: r.created_at,
        status: r.status,
      });
    });

    // 2. Approvals recorded
    const approvals = await Approval.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'Admin', attributes: ['name'] }],
    });
    approvals.forEach((a) => {
      activities.push({
        id: `app-${a.approval_id}`,
        type: a.status === 'approved' ? 'approval_granted' : 'approval_rejected',
        title: `Request #${a.request_id} ${a.status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Admin ${a.Admin ? a.Admin.name : ''}: "${a.remarks || 'No remarks'}"`,
        timestamp: a.created_at,
        status: a.status,
      });
    });

    // 3. Purchase Orders generated
    const pos = await PurchaseOrder.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Vendor, as: 'Vendor', attributes: ['company_name'] }],
    });
    pos.forEach((p) => {
      activities.push({
        id: `po-${p.po_id}`,
        type: 'po_generated',
        title: `PO ${p.po_number} Issued`,
        description: `Issued to ${p.Vendor ? p.Vendor.company_name : 'Vendor'} for ₹${p.amount.toLocaleString('en-IN')}`,
        timestamp: p.created_at,
        status: p.status,
      });
    });

    // 4. Quotations submitted by Vendors
    const quotations = await Quotation.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: Vendor, as: 'Vendor', attributes: ['company_name'] },
        { model: PurchaseRequest, as: 'Request', attributes: ['item_name'] },
      ],
    });
    quotations.forEach((q) => {
      activities.push({
        id: `quote-${q.quotation_id}`,
        type: 'quotation_submitted',
        title: `Quotation Submitted for PR #${q.request_id}`,
        description: `${q.Vendor ? q.Vendor.company_name : 'Vendor'} quoted ₹${parseFloat(q.price).toLocaleString('en-IN')} for "${q.Request ? q.Request.item_name : 'Item'}"`,
        timestamp: q.created_at,
        status: 'submitted',
      });
    });

    // Sort all combined activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return res.status(500).json({ message: 'Failed to fetch activity feed', error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Derived from requests pending or status changes
    const pendingReqs = await PurchaseRequest.findAll({
      where: { status: 'pending' },
      limit: 4,
      order: [['created_at', 'DESC']],
    });
    pendingReqs.forEach((r) => {
      notifications.push({
        id: `notif-pr-${r.request_id}`,
        title: `Pending Approval: ${r.item_name}`,
        message: `Request #${r.request_id} needs review. Budget: ₹${Number(r.budget).toLocaleString('en-IN')}`,
        time: r.created_at,
        unread: true,
        type: 'warning',
      });
    });

    const recentPOs = await PurchaseOrder.findAll({
      limit: 4,
      order: [['created_at', 'DESC']],
      include: [{ model: Vendor, as: 'Vendor' }],
    });
    recentPOs.forEach((p) => {
      notifications.push({
        id: `notif-po-${p.po_id}`,
        title: `PO ${p.po_number} Status: ${p.status.toUpperCase()}`,
        message: `Order assigned to ${p.Vendor ? p.Vendor.company_name : 'Vendor'} is currently ${p.status}.`,
        time: p.created_at,
        unread: false,
        type: 'info',
      });
    });

    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

module.exports = {
  getSummaryMetrics,
  getSpendByCategory,
  getActivityFeed,
  getNotifications,
};
