# Testbench Selector

Synapticon internal tool to check which Actilink-S testbench can handle a given actuator test.

## Local Setup

### Requirements
- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### 1. Database
```bash
createdb testbench_selector
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend starts on http://localhost:8000  
It auto-creates all tables and seeds the database with the three testbenches on first start.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on http://localhost:5173

---

## Deploy on Render

### Option A — render.yaml (recommended)
1. Push this repo to GitHub
2. Go to https://render.com → New → Blueprint
3. Connect your repo → Render reads `render.yaml` and creates everything automatically
4. After first deploy, update `VITE_API_URL` in the frontend service env vars to point to your backend URL

### Option B — manual
**Backend (Web Service):**
- Runtime: Python 3
- Root dir: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add env var: `DATABASE_URL` → from a Render PostgreSQL database

**Frontend (Static Site):**
- Root dir: `frontend`
- Build: `npm install && npm run build`
- Publish dir: `dist`
- Add env var: `VITE_API_URL` → URL of your backend service

---

## Testbench data pre-loaded

| Testbench | Gear | Sensor | Max DUT torque | Max DUT speed |
|-----------|------|--------|---------------|---------------|
| TB1 | 1:7  | 120H31H (100 Nm) | 91 Nm | 428 rpm |
| TB2 | 1:15 | 120H69H (200 Nm) | 195 Nm | 200 rpm |
| TB3 | 1:50 | 2025024EH (500 Nm) | 650 Nm | 60 rpm |

All three use ASC1-082A-0K as load machine (1005 W, 13 Nm peak at 3000 rpm).

## Compatibility logic

```
max_DUT_speed  = LM_max_speed / gear_ratio
max_DUT_torque = min(LM_peak_torque × gear_ratio, sensor_max_torque)

LM_speed_at_test   = test_speed × gear_ratio
LM_torque_at_test  = test_torque / gear_ratio

compatible = test_speed ≤ max_DUT_speed AND test_torque ≤ max_DUT_torque
```
