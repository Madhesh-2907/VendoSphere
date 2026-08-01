const { Quotation, PurchaseRequest, Vendor, User } = require('../models');

const sendRFQ = async (req, res) => {
  try {
    const { request_id, vendor_ids } = req.body;

    if (!request_id || !vendor_ids || !Array.isArray(vendor_ids) || vendor_ids.length === 0) {
      return res.status(400).json({ message: 'request_id and a non-empty array of vendor_ids are required.' });
    }

    const request = await PurchaseRequest.findByPk(request_id);
    if (!request) {
      return res.status(404).json({ message: 'Purchase request not found.' });
    }

    request.status = 'rfq_sent';
    request.target_vendors = JSON.stringify(vendor_ids);
    await request.save();

    return res.json({
      message: `RFQ sent successfully to ${vendor_ids.length} vendors`,
      request,
    });
  } catch (error) {
    console.error('Error sending RFQ:', error);
    return res.status(500).json({ message: 'Failed to send RFQ', error: error.message });
  }
};

const submitQuotation = async (req, res) => {
  try {
    const { request_id, price, delivery_time, warranty, terms } = req.body;

    if (!request_id || !price || !delivery_time) {
      return res.status(400).json({ message: 'request_id, price, and delivery_time are required.' });
    }

    let vendor_id = req.user.vendor_id;

    if (!vendor_id) {
      const vendorProfile = await Vendor.findOne({ where: { user_id: req.user.user_id } });
      if (vendorProfile) {
        vendor_id = vendorProfile.vendor_id;
      } else {
        // Default fallback to first active vendor if testing as admin
        const firstVendor = await Vendor.findOne({ where: { status: 'active' } });
        if (firstVendor) vendor_id = firstVendor.vendor_id;
      }
    }

    if (!vendor_id) {
      return res.status(400).json({ message: 'Vendor profile not associated with this user account.' });
    }

    // Check if vendor already submitted a quote for this request
    const existingQuote = await Quotation.findOne({ where: { request_id, vendor_id } });
    if (existingQuote) {
      existingQuote.price = parseFloat(price);
      existingQuote.delivery_time = delivery_time;
      existingQuote.warranty = warranty || '';
      existingQuote.terms = terms || '';
      await existingQuote.save();
      return res.json({ message: 'Quotation updated successfully', quotation: existingQuote });
    }

    const quotation = await Quotation.create({
      vendor_id,
      request_id,
      price: parseFloat(price),
      delivery_time,
      warranty: warranty || '1 Year Standard',
      terms: terms || 'Net 30 Payment Terms',
    });

    const fullQuotation = await Quotation.findByPk(quotation.quotation_id, {
      include: [{ model: Vendor, as: 'Vendor' }],
    });

    return res.status(201).json({ message: 'Quotation submitted successfully', quotation: fullQuotation });
  } catch (error) {
    console.error('Error submitting quotation:', error);
    return res.status(500).json({ message: 'Failed to submit quotation', error: error.message });
  }
};

const getQuotationsByRequestId = async (req, res) => {
  try {
    const { request_id } = req.params;

    const quotations = await Quotation.findAll({
      where: { request_id },
      include: [{ model: Vendor, as: 'Vendor' }],
      order: [['price', 'ASC']],
    });

    return res.json(quotations);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch quotations', error: error.message });
  }
};

module.exports = {
  sendRFQ,
  submitQuotation,
  getQuotationsByRequestId,
};
