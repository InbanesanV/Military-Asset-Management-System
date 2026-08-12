# Military Asset Management System (MAMS) 🛡️

An enterprise-grade full-stack system to track military assets (vehicles, weapons, ammunition) across multiple bases with RBAC, atomic transfers, and real-time inventory calculations.

## 🏗️ Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Axios
- **Backend**: Node.js, Express.js, PostgreSQL (Supabase)
- **Auth**: JWT + Bcrypt
- **RBAC**: Admin / Base Commander / Logistics Officer

## 📦 Project Structure
```
military-asset-management/
├── backend/          # Express API
└── frontend/         # React SPA
```

## 🚀 Quick Start

### 1. Fix Database Connection (IMPORTANT)
Go to your [Supabase Dashboard](https://supabase.com) → Settings → Database → **Connection pooling** → **Session mode (Port 5432)** and copy the full connection string.

Update `backend/.env`:
```env
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.qtcirqwjztuedbvqvxvj
DB_PASSWORD=inbanesan@2005
DB_NAME=postgres
```

### 2. Setup Database
```bash
cd backend
npm run schema   # Creates all tables
npm run seed     # Inserts sample data
```

### 3. Start Backend
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

## 🔑 Test Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | `admin_user` | `AdminPass123!` | Full system |
| Base Commander | `commander_alpha` | `CommandPass123!` | Fort Alpha only |
| Logistics Officer | `logistics_officer` | `LogisticsPass123!` | Purchases & Transfers |

## 📊 Inventory Formula

```
Closing Balance = Opening Balance + Net Movement - Assigned - Expended
Net Movement = Purchases + Transfers In - Transfers Out
```

## 🛡️ RBAC Matrix

| Feature | Admin | Base Commander | Logistics Officer |
|---------|-------|----------------|-------------------|
| Dashboard | All Bases | Own Base | All |
| Purchases | ✅ | ✅ Own Base | ✅ |
| Transfers | ✅ | ❌ | ✅ |
| Assignments | ✅ | ✅ Own Base | ❌ |
| Audit Log | ✅ | ❌ | ❌ |

## 🔌 API Endpoints

```
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/assets/dashboard
GET    /api/v1/assets/bases
GET    /api/v1/assets/equipment-types
GET    /api/v1/assets/chart

GET    /api/v1/purchases
POST   /api/v1/purchases

GET    /api/v1/transfers
POST   /api/v1/transfers

GET    /api/v1/operations/assignments
POST   /api/v1/operations/assignments
GET    /api/v1/operations/expenditures
POST   /api/v1/operations/expenditures

GET    /api/v1/audit     (Admin only)
```
