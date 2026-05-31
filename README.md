# 🚨 SERCP — Smart Emergency Response Coordination Platform

> A production-ready, real-time emergency management platform built to save lives.

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black)](https://socket.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](https://opensource.org/licenses/MIT)

---

## 📸 Overview

SERCP connects **citizens**, **emergency responders**, **volunteers**, and **command centers** in real time. When a citizen presses SOS, the entire chain of emergency response is triggered instantly — GPS capture, responder matching, live tracking, notifications, and chat.

---

## ✨ Features

### 👤 Citizen
- One-tap SOS with GPS auto-capture
- 5-second confirmation countdown (cancelable)
- Live alert tracking with responder location
- Emergency contacts management (up to 5)
- Real-time chat during active alerts
- Custom emergency messages

### 🛡️ Responder
- Real-time SOS notifications
- Live map with all nearby emergencies
- Accept and navigate to emergencies
- Status management (Available / Busy / Offline)
- Track multiple incidents simultaneously

### ⚙️ Admin (Command Center)
- Real-time dashboard with live stats
- Assign responders and vehicles to incidents
- Manage all users and resources
- Analytics with Chart.js (daily, monthly, severity)
- Incident heatmaps
- Emergency vehicle management

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Maps | React-Leaflet, OpenStreetMap |
| Real-time | Socket.io |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT + Refresh Tokens, bcrypt |
| Charts | Chart.js, react-chartjs-2 |
| Email | Nodemailer |
| Deployment | Vercel (FE) + Render (BE) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-username/sers.git
cd sers

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and email credentials
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## 🗂 Project Structure

```
sers/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (auth, alerts, analytics)
│   ├── middleware/       # JWT auth, RBAC
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # Email service
│   ├── sockets/         # Socket.io handler
│   ├── uploads/         # Uploaded files
│   └── server.js        # Entry point
│
└── frontend/
    └── src/
        ├── components/  # Layout, map, chat components
        ├── contexts/    # Auth & Socket contexts
        ├── pages/
        │   ├── auth/    # Login, Register
        │   ├── citizen/ # Dashboard, SOS, Tracking, Contacts
        │   ├── responder/ # Dashboard, Map
        │   ├── admin/   # Dashboard, Alerts, Users, Analytics
        │   └── public/  # Landing, About, Features, Helplines
        └── services/    # API client, Socket helpers
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@demo.com | Demo@123 |
| Responder | responder@demo.com | Demo@123 |
| Admin | admin@demo.com | Admin@123 |

---

## 📡 Key API Endpoints

```
POST   /api/auth/register      Register user
POST   /api/auth/login         Login
POST   /api/auth/refresh       Refresh JWT

POST   /api/alerts/sos         🚨 Trigger SOS
GET    /api/alerts             Get all alerts (admin)
GET    /api/alerts/my          Get own alerts
GET    /api/alerts/nearby      Nearby alerts (responder)
PATCH  /api/alerts/:id/status  Update status
POST   /api/alerts/:id/assign  Assign responder

GET    /api/analytics/dashboard  Dashboard stats
GET    /api/analytics/monthly    Monthly trends
GET    /api/analytics/heatmap    Map heatmap data

GET    /api/helplines            Emergency numbers
```

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| NEW_EMERGENCY_ALERT | Server → All | New SOS triggered |
| LOCATION_UPDATE | Client → Server | GPS position update |
| SEND_MESSAGE | Client → Server | Chat message |
| STATUS_UPDATE | Bidirectional | Alert status change |
| RESPONDER_ASSIGNED | Server → Citizen | Help is coming |
| SOS_RECEIVED | Server → Responder | New SOS nearby |
| ONLINE_COUNT | Server → All | Online users count |

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy /dist to Vercel
# Set VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render

1. Push to GitHub
2. Create Web Service on Render
3. Set environment variables from `.env.example`
4. Build command: `npm install`
5. Start command: `node server.js`

### Database → MongoDB Atlas

1. Create free cluster
2. Add IP `0.0.0.0/0` to network access
3. Copy connection string to `MONGO_URI`

---

## 🔒 Security Features

- JWT with 15-minute expiry + 7-day refresh token
- bcrypt password hashing (12 rounds)
- Helmet HTTP security headers
- CORS protection
- MongoDB injection sanitization
- Rate limiting (200 req/15min)
- File type validation for uploads
- Role-based access control (RBAC)

---

## 📊 Emergency Alert Lifecycle

```
ACTIVE → RESPONDER_ASSIGNED → IN_PROGRESS → ARRIVED → RESOLVED
                                                      ↘ CANCELLED
```

---

## 🤝 Contributing

Pull requests welcome. For major changes, open an issue first.

---

## 📄 License

MIT © 2024 SERCP Team

---

**Built with ❤️ for saving lives.**
