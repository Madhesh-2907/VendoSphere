const express = require('express');
const router = express.Router();
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
} = require('../controllers/vendor.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

router.use(verifyToken);

router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.post('/', checkRole('admin'), createVendor);
router.put('/:id', checkRole('admin'), updateVendor);
router.patch('/:id/status', checkRole('admin'), updateVendorStatus);
router.delete('/:id', checkRole('admin'), deleteVendor);

module.exports = router;
