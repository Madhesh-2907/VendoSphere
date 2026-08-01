const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, Vendor } = require('../models');
const { Op } = require('sequelize');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Role mapping: 'Faculty' or 'employee' -> 'employee', 'Vendor' or 'vendor' -> 'vendor'
    let assignedRole = 'employee';
    if (role && (role.toLowerCase() === 'vendor')) {
      assignedRole = 'vendor';
    } else if (role && (role.toLowerCase() === 'admin')) {
      assignedRole = 'admin';
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
    });

    let vendorProfile = null;
    if (assignedRole === 'vendor') {
      vendorProfile = await Vendor.create({
        user_id: newUser.user_id,
        company_name: name.trim(),
        contact_person: name.trim(),
        email: normalizedEmail,
        category: 'Electronics and IT Equipment',
        contact: normalizedEmail,
        status: 'active',
        rating: 4.8,
      });
    }

    const token = jwt.sign(
      { user_id: newUser.user_id, role: newUser.role, name: newUser.name, email: newUser.email },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        vendor_id: vendorProfile ? vendorProfile.vendor_id : null,
      },
    });
  } catch (error) {
    console.error('Register Error Details:', error);
    return res.status(500).json({ message: 'Failed to register account', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    let vendor_id = null;
    if (user.role === 'vendor') {
      const vendorProfile = await Vendor.findOne({
        where: {
          [Op.or]: [
            { user_id: user.user_id },
            { email: user.email },
          ],
        },
      });
      if (vendorProfile) {
        vendor_id = vendorProfile.vendor_id;
      }
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, name: user.name, email: user.email },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendor_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to log in', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ['user_id', 'name', 'email', 'role'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let vendor_id = null;
    if (user.role === 'vendor') {
      const vendorProfile = await Vendor.findOne({ where: { user_id: user.user_id } });
      if (vendorProfile) {
        vendor_id = vendorProfile.vendor_id;
      }
    }

    return res.json({
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendor_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
