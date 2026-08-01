const { Delivery, PurchaseOrder, PurchaseRequest, Vendor } = require('../models');

const getDeliveryByPOId = async (req, res) => {
  try {
    const { po_id } = req.params;

    const delivery = await Delivery.findOne({
      where: { po_id },
      include: [
        {
          model: PurchaseOrder,
          as: 'PurchaseOrder',
          include: [
            { model: Vendor, as: 'Vendor' },
            { model: PurchaseRequest, as: 'Request' },
          ],
        },
      ],
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery record not found for this PO.' });
    }

    return res.json(delivery);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch delivery record', error: error.message });
  }
};

const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status, confirmed_by_employee, delivery_date } = req.body;

    const delivery = await Delivery.findByPk(id, {
      include: [{ model: PurchaseOrder, as: 'PurchaseOrder' }],
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery record not found.' });
    }

    if (delivery_status) {
      delivery.delivery_status = delivery_status;
      if (delivery.PurchaseOrder) {
        delivery.PurchaseOrder.status = delivery_status;
        await delivery.PurchaseOrder.save();

        if (delivery_status === 'delivered') {
          const request = await PurchaseRequest.findByPk(delivery.PurchaseOrder.request_id);
          if (request) {
            request.status = 'delivered';
            await request.save();
          }
        }
      }
    }

    if (confirmed_by_employee !== undefined) {
      delivery.confirmed_by_employee = Boolean(confirmed_by_employee);
    }

    if (delivery_date) {
      delivery.delivery_date = delivery_date;
    } else if (delivery_status === 'delivered' && !delivery.delivery_date) {
      delivery.delivery_date = new Date();
    }

    await delivery.save();

    return res.json({ message: 'Delivery details updated', delivery });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update delivery record', error: error.message });
  }
};

module.exports = {
  getDeliveryByPOId,
  updateDelivery,
};
