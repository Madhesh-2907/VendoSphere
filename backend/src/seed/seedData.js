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
    console.log('🌱 Synchronizing database and populating realistic college ERP demo data...');
    const sequelize = await initDb();

    // Wipe and reset schema cleanly
    await sequelize.sync({ force: true });
    console.log('✅ Database schema reset & synchronized.');

    // 1. Standardized Categories
    const categoriesData = [
      'Electronics',
      'Stationery',
      'Furniture',
      'Food & Grocery',
      'Hardware',
    ];
    for (const catName of categoriesData) {
      await Category.create({ category_name: catName });
    }
    console.log('✅ Standardized categories initialized (Electronics, Stationery, Furniture, Food & Grocery, Hardware).');

    // 2. Authentication Users (1 Admin, 2 Faculty, 3 Vendors)
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    const hashedFacultyPass = await bcrypt.hash('faculty123', 10);
    const hashedTharunPass = await bcrypt.hash('test123', 10);
    const hashedVendorPass = await bcrypt.hash('vendor123', 10);

    // Admin User
    const adminUser = await User.create({
      name: 'Dr. Arthur Pendelton (System Admin)',
      email: 'admin@campusprocure.com',
      password: hashedAdminPass,
      role: 'admin',
    });

    // Faculty User 1
    const faculty1 = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'faculty@test.com',
      password: hashedFacultyPass,
      role: 'employee',
    });

    // Faculty User 2
    const faculty2 = await User.create({
      name: 'Prof. Tharun Kumar',
      email: 'tharun@college.com',
      password: hashedTharunPass,
      role: 'employee',
    });

    // Vendor User 1 (Electronics)
    const vendorUser1 = await User.create({
      name: 'Alexander Wright (TechSupply Admin)',
      email: 'vendor@test.com',
      password: hashedVendorPass,
      role: 'vendor',
    });

    // Vendor User 2 (Stationery)
    const vendorUser2 = await User.create({
      name: 'Rajesh Sharma (Campus Paper Admin)',
      email: 'stationery@vendor.com',
      password: hashedVendorPass,
      role: 'vendor',
    });

    // Vendor User 3 (Furniture)
    const vendorUser3 = await User.create({
      name: 'Vikramaditya Rao (ErgoOffice Admin)',
      email: 'furniture@vendor.com',
      password: hashedVendorPass,
      role: 'vendor',
    });

    console.log('✅ Base authentication accounts created.');

    // 3. Vendor Profiles across categories
    const vendor1 = await Vendor.create({
      user_id: vendorUser1.user_id,
      company_name: 'TechSupply Enterprise',
      contact_person: 'Alexander Wright',
      email: 'vendor@test.com',
      phone: '+91 (044) 2831-9000',
      category: 'Electronics',
      contact: 'vendor@test.com',
      address: 'Tech Park Towers, Sector 4, Chennai',
      status: 'active',
      rating: 4.9,
    });

    const vendor2 = await Vendor.create({
      user_id: vendorUser2.user_id,
      company_name: 'Campus Paper & Office Supplies',
      contact_person: 'Rajesh Sharma',
      email: 'stationery@vendor.com',
      phone: '+91 (044) 4500-1122',
      category: 'Stationery',
      contact: 'stationery@vendor.com',
      address: 'Central Market Complex, Chennai',
      status: 'active',
      rating: 4.7,
    });

    const vendor3 = await Vendor.create({
      user_id: vendorUser3.user_id,
      company_name: 'ErgoOffice Furniture Ltd.',
      contact_person: 'Vikramaditya Rao',
      email: 'furniture@vendor.com',
      phone: '+91 (044) 9988-3344',
      category: 'Furniture',
      contact: 'furniture@vendor.com',
      address: 'Industrial Estate Phase 2, Chennai',
      status: 'active',
      rating: 4.8,
    });

    const vendor4 = await Vendor.create({
      user_id: null,
      company_name: 'GreenBites Institutional Canteen Supplies',
      contact_person: 'Meenakshi Sundaram',
      email: 'canteen@greenbites.in',
      phone: '+91 (044) 6677-8899',
      category: 'Food & Grocery',
      contact: 'canteen@greenbites.in',
      address: 'Food Grain Wholesale Terminal, Chennai',
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

    console.log('✅ Vendor profiles created across all 5 categories.');

    // 4. Purchase Requests with diverse lifecycle statuses
    // PR-1: Delivered (Prof. Sarah Jenkins)
    const pr1 = await PurchaseRequest.create({
      employee_id: faculty1.user_id,
      item_name: 'Dell Precision AI Workstations (Set of 5)',
      category: 'Electronics',
      quantity: 5,
      budget: 450000.00,
      purpose: 'High-performance AI research lab setup for Computer Science Dept.',
      priority: 'high',
      status: 'delivered',
    });

    // PR-2: PO Generated & Shipped (Prof. Tharun Kumar)
    const pr2 = await PurchaseRequest.create({
      employee_id: faculty2.user_id,
      item_name: 'Ergonomic Mesh Task Chairs (Set of 25)',
      category: 'Furniture',
      quantity: 25,
      budget: 185000.00,
      purpose: 'Upgrading faculty seating in Mechanical Dept seminar hall.',
      priority: 'medium',
      status: 'po_generated',
    });

    // PR-3: RFQ Sent (Prof. Sarah Jenkins)
    const pr3 = await PurchaseRequest.create({
      employee_id: faculty1.user_id,
      item_name: 'Exam Answer Sheets & Whiteboard Marker Bundles',
      category: 'Stationery',
      quantity: 100,
      budget: 45000.00,
      purpose: 'End-semester examination materials and faculty office supplies.',
      priority: 'high',
      status: 'rfq_sent',
    });

    // PR-4: Pending Approval (Prof. Tharun Kumar)
    const pr4 = await PurchaseRequest.create({
      employee_id: faculty2.user_id,
      item_name: 'Hostel Canteen Monthly Rice & Provisions',
      category: 'Food & Grocery',
      quantity: 10,
      budget: 120000.00,
      purpose: 'Monthly food provisions for campus student dining halls.',
      priority: 'medium',
      status: 'pending',
    });

    // PR-5: Pending Approval (Prof. Sarah Jenkins)
    const pr5 = await PurchaseRequest.create({
      employee_id: faculty1.user_id,
      item_name: 'Heavy-Duty Power Drill & Workshop Mechanical Tools',
      category: 'Hardware',
      quantity: 4,
      budget: 65000.00,
      purpose: 'Campus maintenance division hardware and workshop tools.',
      priority: 'low',
      status: 'pending',
    });

    console.log('✅ Realistic purchase requisitions created across different lifecycle stages.');

    // 5. Approvals
    await Approval.create({
      request_id: pr1.request_id,
      admin_id: adminUser.user_id,
      status: 'approved',
      comments: 'Approved. High-priority AI research lab requirement.',
    });

    await Approval.create({
      request_id: pr2.request_id,
      admin_id: adminUser.user_id,
      status: 'approved',
      comments: 'Approved for seminar hall seating upgrade.',
    });

    await Approval.create({
      request_id: pr3.request_id,
      admin_id: adminUser.user_id,
      status: 'approved',
      comments: 'Approved. Dispatched RFQs to registered stationery suppliers.',
    });

    // 6. Quotations
    const quote1 = await Quotation.create({
      request_id: pr1.request_id,
      vendor_id: vendor1.vendor_id,
      price: 425000.00,
      delivery_time: '7 Business Days',
      warranty: '3 Years On-Site Comprehensive Warranty',
      terms: '30 Days Credit Payment',
      status: 'accepted',
    });

    const quote2 = await Quotation.create({
      request_id: pr2.request_id,
      vendor_id: vendor3.vendor_id,
      price: 175000.00,
      delivery_time: '10 Days',
      warranty: '2 Years Structural Warranty',
      terms: 'Net 15 Days',
      status: 'accepted',
    });

    const quote3 = await Quotation.create({
      request_id: pr3.request_id,
      vendor_id: vendor2.vendor_id,
      price: 42000.00,
      delivery_time: '3 Days',
      warranty: 'Standard Batch Quality Guarantee',
      terms: 'Immediate Payment on Delivery',
      status: 'submitted',
    });

    console.log('✅ Quotations and approvals created.');

    // 7. Purchase Orders & Delivery Records
    // PO 1 (Delivered)
    const po1 = await PurchaseOrder.create({
      po_number: 'PO-2026-1001',
      vendor_id: vendor1.vendor_id,
      request_id: pr1.request_id,
      quotation_id: quote1.quotation_id,
      amount: 425000.00,
      status: 'delivered',
    });

    await Delivery.create({
      po_id: po1.po_id,
      delivery_status: 'delivered',
      delivery_date: new Date(),
      confirmed_by_employee: true,
    });

    // PO 2 (In Transit / Shipped)
    const po2 = await PurchaseOrder.create({
      po_number: 'PO-2026-1002',
      vendor_id: vendor3.vendor_id,
      request_id: pr2.request_id,
      quotation_id: quote2.quotation_id,
      amount: 175000.00,
      status: 'shipped',
    });

    await Delivery.create({
      po_id: po2.po_id,
      delivery_status: 'shipped',
      delivery_date: null,
      confirmed_by_employee: false,
    });

    console.log('✅ Purchase orders (PO-2026-1001, PO-2026-1002) & delivery tracking records seeded.');
    console.log('🎉 Realistic Demo Seed Data populated successfully!');
    console.log('----------------------------------------------------');
    console.log('Demonstration Credentials:');
    console.log('   Admin:    admin@campusprocure.com / admin123');
    console.log('   Faculty:  faculty@test.com / faculty123');
    console.log('   Faculty:  tharun@college.com / test123');
    console.log('   Vendor:   vendor@test.com / vendor123 (Electronics)');
    console.log('   Vendor:   stationery@vendor.com / vendor123 (Stationery)');
    console.log('   Vendor:   furniture@vendor.com / vendor123 (Furniture)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
