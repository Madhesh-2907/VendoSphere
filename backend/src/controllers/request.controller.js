const { PurchaseRequest, User, Approval, Quotation, PurchaseOrder, Vendor } = require('../models');

const getAllRequests = async (req, res) => {
  try {
    const { role, user_id, vendor_id } = req.user;
    let whereClause = {};

    if (role === 'employee') {
      whereClause.employee_id = user_id;
    } else if (role === 'vendor') {
      // Vendors see requests that are in rfq_sent status or have quotations submitted by vendor
      whereClause.status = ['approved', 'rfq_sent', 'po_generated', 'delivered'];
    }

    const requests = await PurchaseRequest.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'Employee', attributes: ['user_id', 'name', 'email'] },
        { model: Approval, as: 'Approvals', include: [{ model: User, as: 'Admin', attributes: ['name'] }] },
        { model: Quotation, as: 'Quotations', include: [{ model: Vendor, as: 'Vendor' }] },
        { model: PurchaseOrder, as: 'PurchaseOrder' },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ message: 'Failed to fetch purchase requests', error: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { item_name, category, quantity, budget, purpose, priority } = req.body;

    if (!item_name || !category || !budget) {
      return res.status(400).json({ message: 'Item name, category, and budget are required fields.' });
    }

    const newRequest = await PurchaseRequest.create({
      employee_id: req.user.user_id,
      item_name,
      category,
      quantity: quantity ? parseInt(quantity, 10) : 1,
      budget: parseFloat(budget),
      purpose: purpose || '',
      priority: priority || 'medium',
      status: 'pending',
    });

    const fullRequest = await PurchaseRequest.findByPk(newRequest.request_id, {
      include: [{ model: User, as: 'Employee', attributes: ['user_id', 'name', 'email'] }],
    });

    return res.status(201).json(fullRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({ message: 'Failed to create purchase request', error: error.message });
  }
};

const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PurchaseRequest.findByPk(id, {
      include: [
        { model: User, as: 'Employee', attributes: ['user_id', 'name', 'email'] },
        { model: Approval, as: 'Approvals', include: [{ model: User, as: 'Admin', attributes: ['name'] }] },
        { model: Quotation, as: 'Quotations', include: [{ model: Vendor, as: 'Vendor' }] },
        { model: PurchaseOrder, as: 'PurchaseOrder', include: [{ model: Vendor, as: 'Vendor' }] },
      ],
    });

    if (!request) {
      return res.status(404).json({ message: 'Purchase request not found.' });
    }

    return res.json(request);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch request details', error: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await PurchaseRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Purchase request not found.' });
    }

    request.status = status;
    await request.save();

    return res.json({ message: 'Request status updated', request });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update request status', error: error.message });
  }
};

module.exports = {
  getAllRequests,
  createRequest,
  getRequestById,
  updateRequestStatus,
};
