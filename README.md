# 💊 Multi-Tenant Enterprise Pharmacy ERP & Inventory System

[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev/)
[![Version](https://img.shields.io/badge/Version-1.0.0-emerald.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

An enterprise-grade, multi-tenant **Pharmacy ERP & Inventory Management SaaS System** designed for independent pharmacies, hospital pharmacy chains, and medical outlets. Built with **Node.js, Express, MongoDB (Mongoose), React 19, Vite, and Tailwind CSS**.

---

## 🌟 Key Product Features

- 🏢 **Multi-Tenancy & Multi-Branch Architecture**: Complete data isolation per pharmacy organization with multi-branch outlet support and seamless inter-branch stock transfers.
- 💊 **FEFO Batch Inventory Control**: First-Expiry, First-Out batch tracking, supplier management, shelf/rack placement, automated reorder triggers, and barcode/QR generation.
- ⚡ **High-Speed POS Checkout**: Point of Sale billing terminal supporting barcode scanning, instant calculations, cash/card/digital payments, and invoice generation.
- 📑 **AI-Powered Prescription OCR**: Automatic extraction of medicine name, dosage, and frequency from prescription images with drug interaction safety warnings.
- 💵 **Cash Register Drawer Sessions**: Shift open/close reconciliation with cash float tracking, actual drawer count comparisons, and automatic variance logging.
- 🔄 **2-Step Manager-Approved Refund Pipeline**: Secure refund approval workflow preventing unauthorized cash returns.
- 🌳 **Granular Role + Permission Tree (RBAC)**: Hierarchical access control matrix (`sales.*`, `inventory.*`, `medicines.*`, `staff.*`, `reports.*`) with dedicated specialized dashboards for:
  - 👑 **Company Owner & Admin**: Executive KPIs, P&L, stock valuation, and multi-branch performance.
  - 🏢 **Branch Manager**: Outlet sales, stock movements, staff rosters, and branch health.
  - 💊 **Pharmacist Workstation**: Prescriptions queue, AI OCR review, and clinical interaction alerts.
  - 📦 **Inventory Manager**: Warehouse stock, FEFO batch allocations, procurement POs, and transfers.
  - 🛒 **Cashier & Sales Staff**: High-speed POS billing, patient search, shift register, and tender breakdown.
- 📊 **Real-time Analytics & Financial Reporting**: Visual revenue graphs, sales distribution breakdown, stock movement logs, and audit trails.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Node.js, Express.js (REST API, ES Modules)
- **Database**: MongoDB & Mongoose ODM
- **Security**: JWT (JSON Web Tokens), bcryptjs, CORS, Helmet, Rate Limiter
- **Utilities**: Nodemailer, PDFKit, ExcelJS, Socket.IO

### Frontend
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS (Custom Clinical Medical Palette)
- **State & Router**: React Context API, React Router DOM
- **HTTP & Icons**: Axios, Lucide Icons

---

## 🎨 Design System Palette

- **Primary**: `#0B5E8E` (Medical Navy)
- **Primary Dark**: `#08476B`
- **Secondary**: `#168A8A` (Teal)
- **Accent**: `#72D6C1` (Mint Glow)
- **Background**: `#F2F9FC`
- **Surface**: `#FFFFFF`
- **Border**: `#D9E8EF`
- **Heading**: `#17324D`
- **Body Text**: `#486273`
- **Muted Text**: `#7C919D`
- **Success**: `#249B72`
- **Warning**: `#D99A2B`
- **Error**: `#D95353`
- **Info**: `#3B8FC4`

---

## ⚙️ Setup and Installation Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster URI)
- Git

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env file
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Running the Project (PowerShell)

**Terminal 1 (Backend):**
```powershell
cd d:\projects\pharmacy-erp\backend
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd d:\projects\pharmacy-erp\frontend
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

---

## 📄 License
This project is licensed under the MIT License.
