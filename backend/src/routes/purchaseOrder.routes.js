const express = require('express');
const router = express.Router();
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  updatePOStatus,
} = require('../controllers/purchaseOrder.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

router.use(verifyToken);

router.post('/', checkRole('admin'), createPurchaseOrder);
router.get('/', getAllPurchaseOrders);
router.patch('/:id/status', checkRole('admin', 'vendor'), updatePOStatus);

module.exports = router;
