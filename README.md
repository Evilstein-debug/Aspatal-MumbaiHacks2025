# Aस्पताल - AI-Powered Hospital Management System

A comprehensive hospital management system with real-time bed occupancy tracking, doctor shift management, OPD patient tracking, emergency case logging, and AI-powered surge predictions.

## Features

### Backend (Node.js + Express + MongoDB)
- ✅ Real-time bed occupancy tracking
- ✅ Doctor shift management
- ✅ OPD patient tracking with queue management
- ✅ Emergency case logging with triage levels
- ✅ Pollution spikes & festival season surge predictions (placeholder API)

### Frontend (React + Vite)
- ✅ Modern, responsive dashboard UI
- ✅ Real-time data updates
- ✅ Interactive charts and visualizations
- ✅ Mobile-friendly design

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

### Frontend
- React 19
- Vite
- Tailwind CSS
- Recharts (for visualizations)
- Lucide React (icons)
- Sonner (toast notifications)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── bedController.js
│   │   │   ├── shiftController.js
│   │   │   ├── opdController.js
│   │   │   ├── emergencyController.js
│   │   │   └── predictionController.js
│   │   ├── models/
│   │   │   ├── bedOccupancy.js
│   │   │   ├── doctorShift.js
│   │   │   ├── opdPatient.js
│   │   │   ├── emergencyCase.js
│   │   │   └── prediction.js
│   │   ├── routes/
│   │   │   ├── bedRoutes.js
│   │   │   ├── shiftRoutes.js
│   │   │   ├── opdRoutes.js
│   │   │   ├── emergencyRoutes.js
│   │   │   └── predictionRoutes.js
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── dashboard/
    │   │   │   ├── BedOccupancyDashboard.jsx
    │   │   │   ├── DoctorShiftManagement.jsx
    │   │   │   ├── OPDPatientTracking.jsx
    │   │   │   ├── EmergencyCaseLogging.jsx
    │   │   │   └── PredictionDashboard.jsx
    │   │   ├── DashboardMain.jsx
    │   │   └── Landing2.jsx
    │   ├── lib/
    │   │   └── api.js              # API utility functions
    │   └── App.jsx
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017
PORT=8000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

4. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend` directory (optional):
```env
VITE_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "doctor",
    "hospitalId": "optional-hospital-id"
  }
  ```
- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `GET /api/auth/profile` - Get current user profile (requires auth token)
- `PUT /api/auth/profile` - Update user profile (requires auth token)
- `PUT /api/auth/change-password` - Change password (requires auth token)
- `GET /api/auth/users` - Get all users (admin only)

**Note:** Include the JWT token in the Authorization header for protected routes:
```
Authorization: Bearer <your-token>
```

### Bed Occupancy
- `GET /api/beds/:hospitalId` - Get all bed occupancies
- `GET /api/beds/:hospitalId/realtime` - Get real-time bed occupancy
- `GET /api/beds/:hospitalId/statistics` - Get bed statistics
- `POST /api/beds/:hospitalId` - Create bed occupancy record
- `PUT /api/beds/:hospitalId/:bedType` - Update bed occupancy

### Doctor Shifts
- `GET /api/shifts/:hospitalId` - Get all shifts
- `GET /api/shifts/:hospitalId/active` - Get active shifts
- `GET /api/shifts/:hospitalId/statistics` - Get shift statistics
- `POST /api/shifts/:hospitalId` - Create shift
- `PUT /api/shifts/:shiftId` - Update shift
- `DELETE /api/shifts/:shiftId` - Delete shift

### OPD Patients
- `GET /api/opd/:hospitalId` - Get all OPD patients
- `GET /api/opd/:hospitalId/queue` - Get OPD queue
- `GET /api/opd/:hospitalId/statistics` - Get OPD statistics
- `POST /api/opd/:hospitalId` - Create OPD patient
- `PUT /api/opd/:patientId` - Update OPD patient

### Emergency Cases
- `GET /api/emergency/:hospitalId` - Get all emergency cases
- `GET /api/emergency/:hospitalId/critical` - Get critical cases
- `GET /api/emergency/:hospitalId/statistics` - Get emergency statistics
- `POST /api/emergency/:hospitalId` - Create emergency case
- `PUT /api/emergency/:caseId` - Update emergency case

### Predictions
- `GET /api/predictions/:hospitalId?` - Get predictions
- `GET /api/predictions/:hospitalId?/upcoming` - Get upcoming predictions
- `POST /api/predictions/:hospitalId` - Create prediction
- `PUT /api/predictions/:predictionId/status` - Update prediction status

## Usage

1. Start MongoDB on your system
2. Start the backend server
3. Start the frontend development server
4. Navigate to `http://localhost:5173`
5. Click "Go to Dashboard" to access the management dashboard

## Features Overview

### Real-time Bed Occupancy
- Track bed availability across different types (General, ICU, Ventilator, Isolation)
- Real-time updates every 30 seconds
- Utilization rate calculations
- High utilization alerts

### Doctor Shift Management
- Schedule and manage doctor shifts (Morning, Evening, Night)
- Track active shifts in real-time
- Monitor patient capacity per shift
- View shift statistics

### OPD Patient Tracking
- Real-time queue management
- Patient status tracking (Waiting, Consulting, Completed)
- Wait time calculations
- Department-wise tracking

### Emergency Case Logging
- Triage level classification (Critical, Urgent, Moderate, Minor)
- Real-time critical case alerts
- Vital signs tracking
- Case status management

### Surge Predictions
- Pollution-based surge predictions
- Festival season surge predictions
- Resource requirement estimates
- Recommendations for preparation

## Development

### Backend Development
- Uses ES6 modules
- MongoDB with Mongoose ODM
- RESTful API design
- Error handling included

### Frontend Development
- React 19 with hooks
- Component-based architecture
- Real-time data fetching
- Responsive design with Tailwind CSS

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. After registering or logging in, you'll receive a token that should be included in the Authorization header for protected routes.

### User Roles
- `superadmin` - Full system access
- `hospitalAdmin` - Hospital-level administration
- `doctor` - Doctor access
- `nurse` - Nurse access
- `operator` - Basic operator access (default)

### Example API Usage

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"doctor"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer <your-token>"
```

## Notes

- The prediction API uses placeholder logic. In production, integrate with actual pollution APIs and historical data analysis.
- Hospital ID can be set during registration or updated later. In production, implement proper hospital selection.
- All timestamps are in UTC. Adjust for local timezone as needed.
- Passwords are hashed using bcrypt before storage.
- JWT tokens expire after 7 days. Implement token refresh in production.

## License

MIT License

