const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();

const Delivery = sequelize.define('Delivery', {
  delivery_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  po_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  delivery_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'issued',
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  confirmed_by_employee: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'Delivery',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Delivery;
