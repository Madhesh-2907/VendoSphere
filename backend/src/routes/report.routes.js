const express = require('express');
const router = express.Router();
const {
  getSummaryMetrics,
  getSpendByCategory,
  getActivityFeed,
  getNotifications,
} = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/summary', getSummaryMetrics);
router.get('/spend-by-category', getSpendByCategory);
router.get('/activity-feed', getActivityFeed);
router.get('/notifications', getNotifications);

module.exports = router;
