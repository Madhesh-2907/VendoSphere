const { PurchaseOrder, Quotation, PurchaseRequest, Vendor, Delivery } = require('../models');
const { generatePONumber } = require('../utils/generatePO');

const createPurchaseOrder = async (req, res) => {
  try {
    const { request_id, quotation_id } = req.body;

    if (!request_id || !quotation_id) {
      return res.status(400).json({ message: 'request_id and quotation_id are required.' });
    }

    const quotation = await Quotation.findByPk(quotation_id, {
      include: [{ model: Vendor, as: 'Vendor' }],
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    const request = await PurchaseRequest.findByPk(request_id);
    if (!request) {
      return res.status(404).json({ message: 'Purchase request not found.' });
    }

    // Check if PO already exists for this request
    let po = await PurchaseOrder.findOne({ where: { request_id } });

    if (!po) {
      const totalCount = await PurchaseOrder.count();
      const po_number = generatePONumber(totalCount + 101);

      po = await PurchaseOrder.create({
        po_number,
        vendor_id: quotation.vendor_id,
        request_id,
        quotation_id,
        amount: quotation.price,
        status: 'issued',
      });

      // Create linked Delivery record
      await Delivery.create({
        po_id: po.po_id,
        delivery_status: 'issued',
        confirmed_by_employee: false,
      });
    }

    // Update Purchase Request status
    request.status = 'po_generated';
    await request.save();

    const fullPO = await PurchaseOrder.findByPk(po.po_id, {
      include: [
        { model: Vendor, as: 'Vendor' },
        { model: PurchaseRequest, as: 'Request' },
        { model: Quotation, as: 'Quotation' },
        { model: Delivery, as: 'Delivery' },
      ],
    });

    return res.status(201).json({ message: 'Purchase Order generated successfully', purchaseOrder: fullPO });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return res.status(500).json({ message: 'Failed to create Purchase Order', error: error.message });
  }
};

const getAllPurchaseOrders = async (req, res) => {
  try {
    const { role, vendor_id } = req.user;
    let whereClause = {};

    if (role === 'vendor' && vendor_id) {
      whereClause.vendor_id = vendor_id;
    }

    const orders = await PurchaseOrder.findAll({
      where: whereClause,
      include: [
        { model: Vendor, as: 'Vendor' },
        { model: PurchaseRequest, as: 'Request' },
        { model: Quotation, as: 'Quotation' },
        { model: Delivery, as: 'Delivery' },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch purchase orders', error: error.message });
  }
};

const updatePOStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['issued', 'processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (issued, processing, shipped, delivered) is required.' });
    }

    const po = await PurchaseOrder.findByPk(id);
    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found.' });
    }

    po.status = status;
    await po.save();

    // Sync delivery record as well
    const delivery = await Delivery.findOne({ where: { po_id: id } });
    if (delivery) {
      delivery.delivery_status = status;
      if (status === 'delivered') {
        delivery.delivery_date = new Date();
      }
      await delivery.save();
    }

    // Sync Purchase Request status based on PO lifecycle status
    const request = await PurchaseRequest.findByPk(po.request_id);
    if (request) {
      if (status === 'shipped') {
        request.status = 'shipped';
        await request.save();
      } else if (status === 'delivered') {
        request.status = 'delivered';
        await request.save();
      }
    }

    return res.json({ message: `Purchase Order status updated to ${status}`, purchaseOrder: po });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update PO status', error: error.message });
  }
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  updatePOStatus,
};
