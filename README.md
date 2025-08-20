# Frontend App

Minimal Vite + React + Tailwind frontend for the apartment backend.

Run locally (PowerShell):

```powershell
cd frontend-app
npm install
npm run dev
```

Notes:
- The backend is expected at http://localhost:8080
- The UI includes a simple role switch (admin/resident) for demo. Implement real auth by storing token from `/api/v1/auth/token` and setting it in localStorage.
- Endpoints used: `/api/v1/apartment`, `/api/v1/users`, `/api/v1/monthly-cost`, `/report`, `/api/v1/apartment/myApartment`, `/api/v1/monthly-cost/myMonthlyCost`, `/report/myReport`
