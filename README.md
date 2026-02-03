# ChemViz

ChemViz is a production-ready chemistry data analysis and visualization platform. Upload CSV files to get instant analytics, ML insights, data quality checks, and exports. The web app (React) and desktop app (PyQt) share the same backend API.

## Quick Start

Backend (Django):
```
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend runs at: http://localhost:8000

Frontend (Vite):
```
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

Desktop app:
```
cd desktop
..\backend\venv\Scripts\python.exe desktop_app.py
```

## Key Features
- Statistical analysis (mean, median, std dev, percentiles, IQR)
- Data quality metrics (missing values, duplicates, completeness)
- Correlation, outlier, distribution, and trend analysis
- ML insights (anomaly detection, clustering, forecasting, feature importance)
- Dataset management (history, favorites, versioning, comparison)
- Exports (CSV, JSON, Excel)
- Responsive UI with light/dark mode

## Tech Stack
- Backend: Django 6.0.1 + Django REST Framework
- Frontend: React 18 + TypeScript + Vite
- Desktop: PyQt5
- Data/ML: pandas, scikit-learn, scipy, statsmodels
- Charts: Recharts (web), Matplotlib (desktop)
- Database: SQLite (Django ORM)

## API Summary
Base URL: http://localhost:8000/api/

Core endpoints:
- POST /upload/
- GET /dashboard/{id}/
- GET /history/
- GET /search/?q=...
- GET /export/{id}/{format}/

Favorites:
- POST /favorite/{id}/
- GET /favorites/
- DELETE /favorite/{id}/

Versioning:
- GET /versions/{id}/
- POST /versions/{id}/

Validation:
- GET /validation-rules/{id}/
- POST /validation-rules/{id}/
- GET /validate/{id}/

Comparison and analytics:
- POST /compare/
- GET /advanced-analytics/{id}/
- GET /audit-logs/

## Project Structure (High Level)
- backend/   Django + API
- frontend/  React UI
- desktop/   PyQt desktop app

## License
MIT
