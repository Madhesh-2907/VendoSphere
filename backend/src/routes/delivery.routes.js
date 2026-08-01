const express = require('express');
const router = express.Router();
const { getDeliveryByPOId, updateDelivery } = require('../controllers/delivery.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/:po_id', getDeliveryByPOId);
router.patch('/:id', updateDelivery);

module.exports = router;
