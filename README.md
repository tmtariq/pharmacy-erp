# 💊 Multi-Tenant Enterprise Pharmacy ERP & SaaS Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_v8-47a248.svg)](https://mongoosejs.com/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel_Serverless-black.svg)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, multi-tenant **Pharmacy ERP, Inventory Management, and POS SaaS System** engineered for independent pharmacies, hospital networks, and retail pharmaceutical chains. Built with an ACID-resilient Node.js/Express backend, high-speed React 19 frontend, and automated Vercel serverless deployment.

---

## 🏗️ Architectural Overview

```
                                  SYSTEM ARCHITECTURE
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                               Vercel Edge Network                               │
 ├──────────────────────────────────────┬──────────────────────────────────────────┤
 │    Frontend Static Assets (Vite)     │     Serverless Function (/api/index.js)  │
 │     React 19 + Tailwind v4           │         Express.js App Gateway           │
 └──────────────────┬───────────────────┴─────────────────────┬────────────────────┘
                    │                                         │
                    ▼                                         ▼
 ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
 │       Client Workstations            │  │     Multi-Tenant Security Middleware │
 │ • High-Speed POS Billing station     │  │ • Strict Tenant Boundary Isolation  │
 │ • Pharmacist Clinical Review Console │  │ • Branch Ownership Verification     │
 │ • Dedicated Role Dashboards          │  │ • Granular RBAC Role Authorizer      │
 │ • SaaS Operator Platform Center      │  │ • Rate Limiter & Helmet Protection   │
 └──────────────────────────────────────┘  └──────────────────┬───────────────────┘
                                                              │
                                                              ▼
                                           ┌──────────────────────────────────────┐
                                           │       MongoDB Atlas / Mongoose       │
                                           │ • Atomic FEFO Batch Allocation       │
                                           │ • Audit Log Historical Ledger        │
                                           │ • Tenant-Scoped Compound Indexes     │
                                           └──────────────────────────────────────┘
```

The system operates across a **two-tier multi-tenant hierarchy**:
1. **SaaS Platform Operators (`/saas-admin/*`)**: Platform-level administrators who oversee tenant company onboarding, subscription lifecycles, global plan pricing, and enterprise audits.
2. **Pharmacy Tenant Organizations (`/dashboard`, `/pos`, etc.)**: Individual pharmaceutical businesses operating isolated branches, staff members, inventories, patient records, and POS billing stations.

---

## 🌟 Key Features & Functional Modules

### ⚡ High-Speed Point of Sale (POS) Billing
- **Atomic Concurrency Protection**: High-volume checkout utilizes atomic MongoDB conditional decrements (`findOneAndUpdate({ quantity: { $gte: qty } }, { $inc: { quantity: -qty } })`) with automated rollbacks to eliminate inventory overselling.
- **Hardware Barcode Integration**: Supports standard 1D/2D USB and Bluetooth barcode scanners with rapid item search and instant cart addition.
- **Collision-Resistant Invoicing**: Cryptographically randomized invoice numbers (`INV-YYYYMMDD-XXXXXX`).
- **Comprehensive Refunds**: Manager-authorized refund pipeline that atomically replenishes batch stock, reverses customer loyalty points, and adjusts registers.

### 💊 FEFO Batch Inventory & Regulatory Compliance
- **First-Expiry, First-Out (FEFO)**: Intelligent stock allocation prioritizing medicines approaching expiration dates.
- **GxP Compliance**: Soft deactivation protocols (`isDeleted`, `status: inactive`) ensuring historical sale and prescription links remain unbroken.
- **Near-Expiry Alerts**: Real-time 30/60/90-day expiration tracking and quarantine workflows.
- **Automated Reorder Forecasting**: Demand velocity aggregation over recent sales to recommend precise restocking quantities.

### 📋 Clinical Prescription Management
- **AI OCR Processing**: Intake studio with OCR preprocessing for electronic and scanned handwritten prescriptions.
- **Drug-Drug Interaction (DDI) Safety**: Multi-tier clinical interaction scanner detecting high/moderate contraindications before dispensing.
- **Pharmacist Digital Review Console**: Multi-step review, doctor validation, and direct single-click conversion to POS sale.

### 🏢 Multi-Branch Operations & Inter-Branch Transfers
- **Tenant Branch Verification**: Enforced cryptographic branch ownership stopping cross-tenant branch hijacking.
- **Atomic Stock Transfers**: Pre-validated transfer routines preventing negative stock transfers between outlets.

### 🛡️ Disaster Recovery Engine
- **Full Database Snapshots**: Serialized JSON snapshots capturing medicines, batches, customers, suppliers, and ledger states.
- **Atomic Document Restoration**: Verified restore engine using atomic `bulkWrite` upserts scoped strictly by tenant organization ID.

---

## 🌳 Role-Based Access Control (RBAC) Matrix

| Route Domain | Owner / Admin | Branch Manager | Pharmacist | Inventory Manager | Cashier / Sales | SaaS SuperAdmin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SaaS Portal (`/saas-admin/*`)** | ❌ | ❌ | ❌ | ❌ | ❌ | 👑 Full Access |
| **Executive Dashboard & P&L** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs & Security Events** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **POS Billing Checkout** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **POS Refund Processing** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Prescription Review & Approval**| ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Stock Transfer Approval** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Medicine & Batch Management** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Patient Profile Deletion** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🛠️ Technology Stack

- **Monorepo Engine**: Turborepo, NPM Workspaces
- **Backend API**: Node.js (ES Modules), Express.js 4.19, Mongoose 8.3, JWT, Nodemailer, Bcryptjs
- **Frontend App**: React 19, Vite 6, Tailwind CSS v4 `@theme`, React Router 7, Lucide Icons
- **Cloud & Serverless**: Vercel Serverless Functions (`api/index.js`), MongoDB Atlas

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher
- **MongoDB**: Local MongoDB community instance or MongoDB Atlas URI

### 2. Installation
Clone the repository and install all monorepo dependencies in one command from the project root:

```bash
git clone https://github.com/tmtariq/pharmacy-erp.git
cd pharmacy-erp
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file inside the `backend/` directory:

```env
# Server Runtime
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/pharmacy_erp
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pharmacy_erp?retryWrites=true&w=majority

# Authentication Secrets (Generate 64-character random hex strings)
JWT_SECRET=super_secret_saas_platform_admin_jwt_key_2026
JWT_ACCESS_SECRET=super_secret_pharmacy_tenant_access_key_2026
JWT_REFRESH_SECRET=super_secret_pharmacy_tenant_refresh_key_2026

# SMTP Email Dispatch (for 2FA & Password Resets)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-smtp-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

Create a `.env` file inside the `frontend/` directory (optional for local dev, defaults to `/api/v1` proxy):

```env
VITE_API_URL=/api/v1
```

### 4. Database Seeding
Initialize the database with default roles, permissions, categories, sample medicines, and initial accounts:

```bash
cd backend
node src/seed.js
cd ..
```

**Default Seeded Credentials:**
- **SaaS Platform SuperAdmin**: `admin@pharmacy.com` / `admin123`
- **Tenant Pharmacy Owner**: `owner@pharmacy.com` / `password123`
- **Pharmacist**: `pharmacist@pharmacy.com` / `password123`
- **Cashier**: `cashier@pharmacy.com` / `password123`

### 5. Running the Monorepo
Start both the Express API and the Vite React frontend concurrently:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Gateway**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **SaaS Admin Login**: [http://localhost:5173/saas-admin/login](http://localhost:5173/saas-admin/login)

### 6. Running Tests & Builds
```bash
# Verify backend unit tests
npm test

# Build production bundles (Turbo + Vite)
npm run build
```

---

## 🚀 Vercel Production Deployment Guide

The repository is configured for one-click serverless deployment on Vercel via [vercel.json](vercel.json).

### Step 1: Push to GitHub
Ensure all latest commits are pushed to your GitHub repository:
```bash
git push origin main
```

### Step 2: Import Project on Vercel
1. Navigate to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your repository: **`tmtariq/pharmacy-erp`**.

### Step 3: Configure Build & Output
Vercel automatically detects the root configuration:
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`

### Step 4: Add Production Environment Variables
Under the **Environment Variables** section in the Vercel deployment wizard, configure:

| Environment Variable | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pharmacy_erp?retryWrites=true&w=majority` |
| `JWT_SECRET` | *(64-char random hex string for SuperAdmin)* |
| `JWT_ACCESS_SECRET` | *(64-char random hex string for user access tokens)* |
| `JWT_REFRESH_SECRET` | *(64-char random hex string for refresh cookies)* |
| `EMAIL_USER` | *(SMTP email address for 2FA OTP & password resets)* |
| `EMAIL_PASS` | *(SMTP app password or service API key)* |
| `SMTP_HOST` | *(Optional, e.g. `smtp.gmail.com` or Brevo/SendGrid)* |
| `SMTP_PORT` | *(Optional, e.g. `587`)* |

> [!TIP]
> Generate secure 64-character JWT secrets in your terminal with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Step 5: Click Deploy
Vercel will compile the React 19 frontend into `frontend/dist`, deploy the backend API as a serverless function under `/api/index.js`, and route all `/api/v1/*` requests to the Express server seamlessly.

---

## 🔒 Security & Defensive Architecture

- **CWE-640 Prevention**: Password recovery tokens are dispatched via encrypted SMTP emails and never exposed in API response payloads or console streams.
- **CWE-532 Prevention**: 2FA OTP secrets are barred from application loggers.
- **ReDoS Elimination**: User input in regular expression queries is sanitized using `escapeRegex` helpers.
- **Zero Hardcoded Secrets**: Cloud database credentials and encryption keys are strictly read from environment variables.
- **HttpOnly Cookies**: Refresh tokens are stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies to protect against cross-site scripting (XSS) credential theft.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
