# SERCP Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)

---

## 1. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create a free cluster (M0 Sandbox)
3. Database Access → Add user: `sers_user` with password
4. Network Access → Add IP: `0.0.0.0/0`
5. Connect → Drivers → Copy connection string
6. Replace `<password>` and set DB name: `sers`

```
MONGO_URI=mongodb+srv://sers_user:YOUR_PASS@cluster0.xxxxx.mongodb.net/sers
```

---

## 2. Backend → Render

1. Push to GitHub: `git push origin main`
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: Free

5. Environment Variables:
```
PORT=5000
NODE_ENV=production
MONGO_URI=<your-atlas-uri>
JWT_SECRET=<random-32-char-string>
JWT_REFRESH_SECRET=<another-random-32-char-string>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=https://your-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SERCP <noreply@sercp.com>
```

6. Deploy → Note your backend URL: `https://sercp-backend.onrender.com`

---

## 3. Frontend → Vercel

1. Create `.env.production` in `/frontend`:
```
VITE_API_URL=https://sercp-backend.onrender.com/api
VITE_SOCKET_URL=https://sercp-backend.onrender.com
```

2. Go to https://vercel.com → New Project
3. Import GitHub repo
4. Settings:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variables (same as .env.production)
6. Deploy!

---

## 4. Create Demo Accounts

After deployment, register accounts manually or seed with:

```javascript
// Run once: node backend/scripts/seed.js
const users = [
  { name: 'Demo Citizen', email: 'citizen@demo.com', password: 'Demo@123', phone: '+911234567890', role: 'citizen' },
  { name: 'Admin User', email: 'admin@demo.com', password: 'Admin@123', phone: '+919876543210', role: 'admin' },
];
```

---

## 5. MongoDB Indexes (run once)

```javascript
// In MongoDB Atlas → Collections → Indexes
db.useremergencyalerts.createIndex({ location: "2dsphere" })
db.users.createIndex({ location: "2dsphere" })
db.responders.createIndex({ location: "2dsphere" })
```

---

## Quick Test Checklist

- [ ] Backend health: `GET /api/health` returns `{ status: "OK" }`
- [ ] Register as citizen → redirects to dashboard
- [ ] Login with demo accounts
- [ ] Trigger SOS → alert appears on admin dashboard
- [ ] Socket.io connection (check browser console)
- [ ] Notifications working

---

## Troubleshooting

**CORS Error**: Update `CLIENT_URL` in backend `.env` to match your Vercel domain

**Socket not connecting**: Ensure `VITE_SOCKET_URL` points to backend without `/api`

**MongoDB connection failed**: Check Network Access whitelist includes `0.0.0.0/0`

**Maps not loading**: Leaflet CSS must be loaded — check `index.html` CDN link
