const express = require('express');
const router = express.Router();
const { sendRFQ, submitQuotation, getQuotationsByRequestId } = require('../controllers/quotation.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

router.use(verifyToken);

router.post('/rfq', checkRole('admin'), sendRFQ);
router.post('/', checkRole('vendor', 'admin'), submitQuotation);
router.get('/:request_id', getQuotationsByRequestId);

module.exports = router;
