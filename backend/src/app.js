const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const requestRoutes = require('./routes/request.routes');
const vendorRoutes = require('./routes/vendor.routes');
const approvalRoutes = require('./routes/approval.routes');
const quotationRoutes = require('./routes/quotation.routes');
const purchaseOrderRoutes = require('./routes/purchaseOrder.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusProcure Backend API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
