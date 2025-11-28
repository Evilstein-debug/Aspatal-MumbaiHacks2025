# Socket.io Real-time Integration

## Overview
Socket.io has been integrated to enable real-time updates across the hospital management dashboard.

## Backend Setup

### Dependencies
- `socket.io` - Added to backend package.json

### Server Configuration
- Socket.io server initialized in `backend/src/socket/socketServer.js`
- Integrated with Express HTTP server
- CORS configured for frontend connection

### Socket Events Emitted

1. **Bed Occupancy Updates** (`bed:occupancy:update`)
   - Emitted when bed occupancy is updated
   - Sent to hospital-specific room
   - Contains updated bed data

2. **Emergency Cases** (`emergency:new`, `emergency:critical`)
   - `emergency:new` - All new emergency cases
   - `emergency:critical` - Critical cases broadcasted to all clients
   - Contains patient and case information

3. **Doctor Shift Changes** (`doctor:shift:change`)
   - Emitted when doctor status or shift changes
   - Includes login/logout events
   - Contains doctor information and action type

4. **OPD Queue Updates** (`opd:queue:update`)
   - Emitted when OPD queue changes
   - Contains updated queue and patient information
   - Includes queue length

## Frontend Setup

### Dependencies
- `socket.io-client` - Added to frontend package.json

### Socket Service
- Created `frontend/src/lib/socket.js`
- Singleton pattern for connection management
- Auto-reconnection enabled
- Hospital room management

### Components Updated

1. **BedOccupancyDashboard**
   - Listens to `bed:occupancy:update`
   - Updates bed data in real-time
   - Shows toast notification on update

2. **EmergencyCaseLogging**
   - Listens to `emergency:new` and `emergency:critical`
   - Adds new cases to list immediately
   - Critical cases trigger error toast

3. **DoctorShiftManagement**
   - Listens to `doctor:shift:change`
   - Updates shift table in real-time
   - Shows toast for login/logout/shift changes

4. **OPDPatientTracking**
   - Listens to `opd:queue:update`
   - Updates queue list immediately
   - Shows toast for new patients

5. **DashboardMain**
   - Initializes Socket.io connection
   - Manages hospital room joining/leaving
   - Includes SocketStatus component

6. **SocketStatus Component**
   - Visual indicator of connection status
   - Shows "Live" or "Offline" badge
   - Updates automatically on connection changes

## Usage

### Backend - Emitting Events

```javascript
import { emitBedOccupancyUpdate, emitEmergencyCase, emitDoctorShiftChange, emitOPDQueueUpdate } from "../socket/socketServer.js";

// Emit bed occupancy update
emitBedOccupancyUpdate(hospitalId, bedData);

// Emit emergency case
emitEmergencyCase(hospitalId, caseData);

// Emit doctor shift change
emitDoctorShiftChange(hospitalId, doctorData);

// Emit OPD queue update
emitOPDQueueUpdate(hospitalId, queueData);
```

### Frontend - Listening to Events

```javascript
import socketService from "@/lib/socket";

useEffect(() => {
  socketService.connect();
  socketService.joinHospital(hospitalId);

  const handleUpdate = (data) => {
    // Handle real-time update
    setData(data);
  };

  socketService.on("bed:occupancy:update", handleUpdate);

  return () => {
    socketService.off("bed:occupancy:update", handleUpdate);
    socketService.leaveHospital(hospitalId);
  };
}, [hospitalId]);
```

## Socket Events Reference

### Client → Server Events
- `join:hospital` - Join hospital room for filtered updates
- `leave:hospital` - Leave hospital room

### Server → Client Events
- `bed:occupancy:update` - Bed occupancy data updated
- `emergency:new` - New emergency case created
- `emergency:critical` - Critical emergency case (broadcasted to all)
- `doctor:shift:change` - Doctor shift or status changed
- `opd:queue:update` - OPD queue updated
- `alert:new` - New alert created

## Environment Variables

### Backend
```env
CORS_ORIGIN=http://localhost:5173
```

### Frontend
```env
VITE_SOCKET_URL=http://localhost:8000
```

## Testing

1. Start backend server: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open dashboard in browser
4. Check SocketStatus badge - should show "Live"
5. Make changes via API or another client
6. Watch real-time updates appear in dashboard

## Features

✅ Real-time bed occupancy updates
✅ Instant emergency case notifications
✅ Doctor login/logout notifications
✅ Live OPD queue updates
✅ Connection status indicator
✅ Hospital-specific room filtering
✅ Auto-reconnection on disconnect
✅ Toast notifications for important events

