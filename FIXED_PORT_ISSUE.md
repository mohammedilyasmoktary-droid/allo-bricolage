# ✅ Port Issue Fixed!

## Problem
Port 5000 was already in use by macOS AirPlay Receiver, causing the backend to fail with:
```
Error: listen EADDRINUSE: address already in use :::5000
```

## Solution Applied
✅ Changed backend port from **5000** to **5001**
✅ Updated frontend API URL to point to port **5001**
✅ Backend is now running successfully on port **5001**

## Current Configuration

**Backend:** http://localhost:5001
**Frontend:** http://localhost:5173 (when started)
**API Endpoint:** http://localhost:5001/api

## How to Run

**Terminal 1 - Backend (already running):**
```bash
cd backend
npm run dev
```
✅ Backend is already running on port 5001!

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

## Test the Backend

You can test the backend is working:
```bash
curl http://localhost:5001/health
```

Should return: `{"status":"ok","message":"Allo Bricolage API is running"}`

## If You Need to Change Ports Again

**Backend port:** Edit `backend/.env` and change `PORT=5001`
**Frontend API:** Edit `frontend/.env` and change `VITE_API_URL=http://localhost:5001/api`

Make sure both ports match!






