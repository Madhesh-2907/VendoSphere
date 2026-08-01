const bcrypt = require('bcryptjs');
const { initDb } = require('../config/db');
const {
  User,
  Vendor,
  Category,
  PurchaseRequest,
  Approval,
  Quotation,
  PurchaseOrder,
  Delivery,
} = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Initializing CampusProcure Hackathon Demonstration Database...');
    const sequelize = await initDb();

    // Wipe and reset database schema cleanly
    await sequelize.sync({ force: true });
    console.log('✅ Database schema synchronized cleanly.');

    // 1. Base Procurement Categories
    const categoriesData = [
      'Electronics',
      'Stationery',
      'Furniture',
      'Food and Grocery',
      'Hardware',
    ];
    for (const catName of categoriesData) {
      await Category.create({ category_name: catName });
    }
    console.log('✅ Standardized Categories Initialized (Electronics, Stationery, Furniture, Food and Grocery, Hardware).');

    // 2. Demo Users (Passwords hashed using bcrypt)
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    const hashedFacultyPass = await bcrypt.hash('faculty123', 10);
    const hashedVendorPass = await bcrypt.hash('vendor123', 10);

    // ADMIN USER
    const adminUser = await User.create({
      name: 'Dr. Arthur Pendleton',
      email: 'admin@campusprocure.com',
      password: hashedAdminPass,
      role: 'admin',
    });

    // FACULTY USER
    const facultyUser = await User.create({
      name: 'Dr. Sarah Williams',
      email: 'faculty@campusprocure.com',
      password: hashedFacultyPass,
      role: 'employee',
    });

    // VENDOR USER
    const vendorUser = await User.create({
      name: 'TechSupply Enterprise',
      email: 'vendor@campusprocure.com',
      password: hashedVendorPass,
      role: 'vendor',
    });

    console.log('✅ Authentication Demo Users Created (Admin, Faculty, Vendor).');

    // 3. Demo Vendors
    const vendor1 = await Vendor.create({
      user_id: vendorUser.user_id,
      company_name: 'TechSupply Enterprise',
      contact_person: 'Alexander Wright',
      email: 'vendor@campusprocure.com',
      phone: '+91 (044) 2831-9000',
      category: 'Electronics',
      contact: 'vendor@campusprocure.com',
      address: 'Tech Park Towers, Sector 4, Chennai',
      status: 'active',
      rating: 4.9,
    });

    const vendor2 = await Vendor.create({
      user_id: null,
      company_name: 'ErgoOffice Furniture Ltd.',
      contact_person: 'Vikramaditya Rao',
      email: 'sales@ergooffice.com',
      phone: '+91 (044) 9988-3344',
      category: 'Furniture',
      contact: 'sales@ergooffice.com',
      address: 'Industrial Estate Phase 2, Chennai',
      status: 'active',
      rating: 4.8,
    });

    const vendor3 = await Vendor.create({
      user_id: null,
      company_name: 'Campus Paper & Office Supplies',
      contact_person: 'Rajesh Sharma',
      email: 'orders@campuspaper.com',
      phone: '+91 (044) 4500-1122',
      category: 'Stationery',
      contact: 'orders@campuspaper.com',
      address: 'Central Market Complex, Chennai',
      status: 'active',
      rating: 4.7,
    });

    const vendor4 = await Vendor.create({
      user_id: null,
      company_name: 'GreenBites Canteen Supplies',
      contact_person: 'Meenakshi Sundaram',
      email: 'canteen@greenbites.in',
      phone: '+91 (044) 6677-8899',
      category: 'Food and Grocery',
      contact: 'canteen@greenbites.in',
      address: 'Food Grain Terminal, Chennai',
      status: 'active',
      rating: 4.6,
    });

    const vendor5 = await Vendor.create({
      user_id: null,
      company_name: 'BuildPro Hardware & Tools',
      contact_person: 'Karthik Subramanian',
      email: 'sales@buildprohardware.in',
      phone: '+91 (044) 1122-3344',
      category: 'Hardware',
      contact: 'sales@buildprohardware.in',
      address: 'Machinery Trade Hub, Chennai',
      status: 'active',
      rating: 4.5,
    });

    console.log('✅ Demo Vendors Initialized Across Categories.');

    // 4. Realistic Demo Purchase Requests & Procurement Workflow Data

    // Request 1: Dell Precision AI Workstation (Status: Approved)
    const pr1 = await PurchaseRequest.create({
      employee_id: facultyUser.user_id,
      item_name: 'Dell Precision AI Workstation',
      category: 'Electronics',
      quantity: 5,
      budget: 450000.00,
      purpose: 'High-performance AI research laboratory setup for Department of Computer Science.',
      priority: 'high',
      status: 'approved',
    });

    await Approval.create({
      request_id: pr1.request_id,
      admin_id: adminUser.user_id,
      status: 'approved',
      comments: 'Approved. Essential requirement for institutional AI lab expansion.',
    });

    // Request 2: Ergonomic Office Chairs (Status: RFQ Sent)
    const pr2 = await PurchaseRequest.create({
      employee_id: facultyUser.user_id,
      item_name: 'Ergonomic Office Chairs',
      category: 'Furniture',
      quantity: 25,
      budget: 175000.00,
      purpose: 'Upgrading faculty seating in department conference and seminar halls.',
      priority: 'medium',
      status: 'rfq_sent',
    });

    await Approval.create({
      request_id: pr2.request_id,
      admin_id: adminUser.user_id,
      status: 'approved',
      comments: 'Approved for RFQ bidding.',
    });

    await Quotation.create({
      request_id: pr2.request_id,
      vendor_id: vendor2.vendor_id,
      price: 168000.00,
      delivery_time: '7 Days',
      warranty: '2 Years Structural Warranty',
      terms: 'Net 15 Days Credit',
      status: 'submitted',
    });

    // Request 3: Exam Answer Sheets and Marker Bundles (Status: Purchase Order Generated & Shipped)
    const pr3 = await PurchaseRequest.create({
      employee_id: facultyUser.user_id,
      item_name: 'Exam Answer Sheets and Marker Bundles',
      category: 'Stationery',
      quantity: 500,
      budget: 42000.00,
      purpose: 'End-semester examination answer booklets and faculty whiteboard supplies.',
      priority: 'high',
      status: 'po_generated',
    });

    await Approval.create({
      request_id: pr3.request_id,
      admin_id: adminUser.user_id,
      status: 'approved',
      comments: 'Approved. Dispatched RFQs to stationery suppliers.',
    });

    const quote3 = await Quotation.create({
      request_id: pr3.request_id,
      vendor_id: vendor3.vendor_id,
      price: 39500.00,
      delivery_time: '3 Days',
      warranty: 'Standard Quality Guarantee',
      terms: 'Payment on Delivery',
      status: 'accepted',
    });

    const po3 = await PurchaseOrder.create({
      po_number: 'PO-2026-1001',
      vendor_id: vendor3.vendor_id,
      request_id: pr3.request_id,
      quotation_id: quote3.quotation_id,
      amount: 39500.00,
      status: 'shipped',
    });

    await Delivery.create({
      po_id: po3.po_id,
      delivery_status: 'shipped',
      delivery_date: null,
      confirmed_by_employee: false,
    });

    console.log('✅ Workflow Seed Data Generated Successfully.');
    console.log('----------------------------------------------------');
    console.log('Demonstration User Accounts:');
    console.log('   Admin:    admin@campusprocure.com / admin123');
    console.log('   Faculty:  faculty@campusprocure.com / faculty123');
    console.log('   Vendor:   vendor@campusprocure.com / vendor123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
