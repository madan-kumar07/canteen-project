# Canteen Project

Smart Canteen is a full-stack project with a Flask backend and a Vite + React frontend.

## Prerequisites

- Windows
- Python 3.14+ or compatible Python 3
- Node.js 18+ / npm 10+
- Git

## Backend setup

1. Open a terminal and change to the backend folder:
   ```powershell
   cd c:\Users\canteen_project\backend
   ```

2. Create and activate a Python virtual environment (recommended):
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:
   ```powershell
   python -m pip install flask flask-cors flask-socketio gevent razorpay
   ```

4. Start the backend server:
   ```powershell
   python app.py
   ```

The backend listens on `http://0.0.0.0:5000`.

## Frontend setup

1. Open a second terminal and change to the frontend folder:
   ```powershell
   cd c:\Users\canteen_project\frontend
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Start the frontend dev server:
   ```powershell
   npm run dev -- --host 0.0.0.0
   ```

The frontend will be available at `http://localhost:5173`.

## Run the full app

1. Start the backend server first.
2. Start the frontend dev server second.
3. Open the browser at:
   - `http://localhost:5173`

## Notes

- If Razorpay keys are not configured, the backend falls back to a test/mock payment mode.
- The backend uses `db.json` for data storage and will persist orders/menu updates there.
- If you want to use a different port, modify the backend `app.py` server configuration and the frontend API base URL accordingly.

## Useful commands

- Backend only:
  ```powershell
  python app.py
  ```
- Frontend only:
  ```powershell
  npm run dev -- --host 0.0.0.0
  ```
- Install frontend dependencies:
  ```powershell
  npm install
  ```
- Install backend dependencies:
  ```powershell
  python -m pip install flask flask-cors flask-socketio gevent razorpay
  ```
