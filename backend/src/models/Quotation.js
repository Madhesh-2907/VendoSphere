const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Quotation = sequelize.define('Quotation', {
  quotation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  delivery_time: {
    type: DataTypes.STRING, // e.g. "7 Business Days"
    allowNull: false,
  },
  warranty: {
    type: DataTypes.STRING, // e.g. "3 Years On-site"
    allowNull: true,
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Quotation',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Quotation;
