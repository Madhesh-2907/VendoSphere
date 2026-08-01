const express = require('express');
const router = express.Router();
const { getSummaryMetrics } = require('../controllers/report.controller');
const { getAllVendors } = require('../controllers/vendor.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

// Endpoint aliases requested for admin stats and vendors
router.get('/stats', getSummaryMetrics);
router.get('/vendors', getAllVendors);

module.exports = router;
