const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, Vendor } = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findByPk(decoded.user_id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    let vendor_id = null;
    if (user.role === 'vendor') {
      const vendorProfile = await Vendor.findOne({ where: { user_id: user.user_id } });
      if (vendorProfile) {
        vendor_id = vendorProfile.vendor_id;
      }
    }

    req.user = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendor_id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = {
  verifyToken,
};
