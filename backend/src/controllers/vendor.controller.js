const { Vendor, User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const getAllVendors = async (req, res) => {
  try {
    const { category, status, includeDeleted } = req.query;
    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }
    
    if (status) {
      whereClause.status = status;
    } else if (includeDeleted !== 'true') {
      // By default exclude soft-deleted vendors
      whereClause.status = { [Op.ne]: 'deleted' };
    }

    const vendors = await Vendor.findAll({
      where: whereClause,
      include: [{ model: User, as: 'User', attributes: ['user_id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    return res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ message: 'Failed to fetch vendors', error: error.message });
  }
};

const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByPk(id, {
      include: [{ model: User, as: 'User', attributes: ['user_id', 'name', 'email'] }],
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    return res.json(vendor);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch vendor details', error: error.message });
  }
};

const createVendor = async (req, res) => {
  try {
    const { company_name, contact_person, email, password, phone, category, contact, address, status } = req.body;

    if (!company_name || !category) {
      return res.status(400).json({ message: 'Company name and category are required fields.' });
    }

    let userId = null;
    const vendorEmail = email || (contact && contact.includes('@') ? contact.split('|').pop().trim() : null);

    if (vendorEmail) {
      const existingUser = await User.findOne({ where: { email: vendorEmail } });
      if (!existingUser) {
        const defaultPassword = password || 'vendor123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const newUser = await User.create({
          name: company_name,
          email: vendorEmail,
          password: hashedPassword,
          role: 'vendor',
        });
        userId = newUser.user_id;
      } else {
        userId = existingUser.user_id;
      }
    }

    const formattedContact = contact || `${phone || ''} ${email || ''}`.trim() || 'No contact provided';

    const vendor = await Vendor.create({
      user_id: userId,
      company_name,
      contact_person: contact_person || '',
      email: vendorEmail || '',
      phone: phone || '',
      category,
      contact: formattedContact,
      address: address || '',
      status: status || 'active',
      rating: 4.5,
    });

    return res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return res.status(500).json({ message: 'Failed to create vendor', error: error.message });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, contact_person, email, phone, category, contact, address, status } = req.body;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    if (company_name) vendor.company_name = company_name;
    if (contact_person !== undefined) vendor.contact_person = contact_person;
    if (email !== undefined) vendor.email = email;
    if (phone !== undefined) vendor.phone = phone;
    if (category) vendor.category = category;
    if (contact) vendor.contact = contact;
    else if (phone || email) vendor.contact = `${phone || vendor.phone || ''} ${email || vendor.email || ''}`.trim();
    if (address !== undefined) vendor.address = address;
    if (status) vendor.status = status;

    await vendor.save();

    return res.json({ message: 'Vendor details updated successfully', vendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return res.status(500).json({ message: 'Failed to update vendor', error: error.message });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'active', 'inactive', 'deleted'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (pending, approved, active, inactive, deleted) is required.' });
    }

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    vendor.status = status;
    await vendor.save();

    return res.json({ message: `Vendor status updated to ${status}`, vendor });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update vendor status', error: error.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    // Soft delete approach by setting status to 'deleted'
    vendor.status = 'deleted';
    await vendor.save();

    return res.json({ message: 'Vendor successfully deleted (soft delete)', vendor_id: id });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return res.status(500).json({ message: 'Failed to delete vendor', error: error.message });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
};
