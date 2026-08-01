# CampusProcure — Smart Institutional Procurement Management System

DEPLOYED LINK : https://vendo-sphere.vercel.app/

CampusProcure is a full-stack digital procurement platform built for higher education colleges and institutions. It digitizes manual purchase requests, administrative review & approvals, vendor RFQ dispatch, side-by-side quotation evaluation, purchase order auto-generation, and order delivery status tracking.

---

## Key System Features & Core Workflow

The platform demonstrates a complete **7-step end-to-end workflow**:
1. **Employee/Faculty** creates a purchase request (`pending`).
2. **Admin/Purchase Manager** reviews and approves/rejects with remarks.
3. Approved request is dispatched to relevant vendors as an **RFQ** (`rfq_sent`).
4. **Vendors** submit proposals (pricing, delivery timeframe, warranty terms).
5. **Admin** compares vendor proposals side-by-side and selects the winner.
6. **Purchase Order (PO)** is automatically generated (`po_generated`).
7. **Vendor** updates delivery fulfillment (`processing` $\rightarrow$ `shipped` $\rightarrow$ `delivered`).
8. Real-time notifications and audit activity feed update dynamically on every state change.

---

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, REST API
- **Database**: MySQL / SQLite (via Sequelize ORM)
- **Authentication**: JWT-based Role-Based Access Control (RBAC)

---

## Directory Structure

```
campusprocure/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, env.js)
│   │   ├── models/ (User, Vendor, Category, PurchaseRequest, Approval, Quotation, PurchaseOrder, Delivery)
│   │   ├── controllers/ (auth, request, vendor, approval, quotation, purchaseOrder, delivery, report)
│   │   ├── routes/
│   │   ├── middleware/ (auth, role)
│   │   ├── utils/ (generatePO.js)
│   │   └── seed/ (seedData.js)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/ (auth, employee, admin, vendor)
│   │   ├── components/ (layout, common, charts)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── services/ (api.js, authService, requestService, vendorService, quotationService, orderService)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Setup & Running Locally

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

The backend server runs on `http://localhost:5000`.

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The React Vite frontend runs on `http://localhost:3000`.

---

## Quick Demo Credentials (1-Click Presets on Login Screen)

| Role | Email | Password |
|---|---|---|
| **Admin / Purchase Manager** | `admin@campusprocure.edu` | `admin123` |
| **Employee / Faculty** | `employee@campusprocure.edu` | `employee123` |
| **Vendor / Supplier** | `vendor@techsupply.com` | `vendor123` |

---

## License

Built for Institutional Procurement Management & Hackathon Demonstrations.
