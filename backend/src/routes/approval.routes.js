const express = require('express');
const router = express.Router();
const { createApproval, getApprovalsByRequestId } = require('../controllers/approval.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

router.use(verifyToken);

router.post('/', checkRole('admin'), createApproval);
router.get('/:request_id', getApprovalsByRequestId);

module.exports = router;
