const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  createRequest,
  getRequestById,
  updateRequestStatus,
} = require('../controllers/request.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

router.use(verifyToken);

router.get('/', getAllRequests);
router.post('/', checkRole('employee', 'admin'), createRequest);
router.get('/:id', getRequestById);
router.patch('/:id/status', checkRole('admin'), updateRequestStatus);

module.exports = router;
