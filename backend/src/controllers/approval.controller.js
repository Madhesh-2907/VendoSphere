const { Approval, PurchaseRequest, User } = require('../models');

const createApproval = async (req, res) => {
  try {
    const { request_id, status, remarks } = req.body;
    const admin_id = req.user.user_id;

    if (!request_id || !status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'request_id and valid status (approved/rejected) are required.' });
    }

    const request = await PurchaseRequest.findByPk(request_id);
    if (!request) {
      return res.status(404).json({ message: 'Purchase request not found.' });
    }

    const approval = await Approval.create({
      request_id,
      admin_id,
      status,
      remarks: remarks || '',
    });

    request.status = status;
    await request.save();

    const fullApproval = await Approval.findByPk(approval.approval_id, {
      include: [{ model: User, as: 'Admin', attributes: ['name', 'email'] }],
    });

    return res.status(201).json({
      message: `Request successfully ${status}`,
      approval: fullApproval,
      request,
    });
  } catch (error) {
    console.error('Error creating approval:', error);
    return res.status(500).json({ message: 'Failed to record approval', error: error.message });
  }
};

const getApprovalsByRequestId = async (req, res) => {
  try {
    const { request_id } = req.params;
    const approvals = await Approval.findAll({
      where: { request_id },
      include: [{ model: User, as: 'Admin', attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    return res.json(approvals);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch approvals', error: error.message });
  }
};

module.exports = {
  createApproval,
  getApprovalsByRequestId,
};
