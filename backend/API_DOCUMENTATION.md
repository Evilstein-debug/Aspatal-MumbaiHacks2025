# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "message": "Optional message",
  "data": {},
  "count": 0,
  "error": "Error message if failed",
  "details": ["Validation errors"]
}
```

---

## 1. Beds API

### GET /api/bed-items/:hospitalId
Get all beds for a hospital

**Query Parameters:**
- `status` - Filter by status (available, occupied, reserved, maintenance, cleaning)
- `bedType` - Filter by type (general, icu, ventilator, isolation, private, semi-private)
- `ward` - Filter by ward
- `floor` - Filter by floor number

**Sample Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65f123...",
      "hospitalId": "65f123...",
      "bedNumber": "B-101",
      "bedType": "general",
      "status": "available",
      "ward": "Ward A",
      "floor": 1,
      "roomNumber": "101",
      "patientId": null,
      "assignedNurseId": null,
      "equipment": [],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### GET /api/bed-items/:hospitalId/available
Get available beds

**Query Parameters:**
- `bedType` - Optional filter by bed type

### GET /api/bed-items/item/:bedId
Get single bed by ID

### POST /api/bed-items/:hospitalId
Create new bed

**Request Body:**
```json
{
  "bedNumber": "B-101",
  "bedType": "general",
  "status": "available",
  "ward": "Ward A",
  "floor": 1,
  "roomNumber": "101"
}
```

### PUT /api/bed-items/item/:bedId
Update bed

### DELETE /api/bed-items/item/:bedId
Delete bed (cannot delete if occupied)

---

## 2. Doctors API

### GET /api/doctors/:hospitalId
Get all doctors

**Query Parameters:**
- `specialization` - Filter by specialization
- `status` - Filter by status (active, on-duty, off-duty, on-leave, suspended)
- `currentShift` - Filter by shift (morning, evening, night, off)
- `department` - Filter by department

**Sample Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f123...",
      "hospitalId": "65f123...",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiology",
      "email": "rajesh@hospital.com",
      "phone": "+91 9876543210",
      "shiftTimings": {
        "morning": {
          "startTime": "08:00",
          "endTime": "16:00",
          "days": ["monday", "tuesday", "wednesday"]
        }
      },
      "currentShift": "morning",
      "status": "on-duty",
      "maxPatientsPerDay": 30,
      "currentPatientCount": 12
    }
  ]
}
```

### GET /api/doctors/:hospitalId/on-duty
Get doctors currently on duty

### POST /api/doctors/:hospitalId
Create new doctor

**Request Body:**
```json
{
  "name": "Dr. Rajesh Kumar",
  "specialization": "Cardiology",
  "email": "rajesh@hospital.com",
  "phone": "+91 9876543210",
  "shiftTimings": {
    "morning": {
      "startTime": "08:00",
      "endTime": "16:00",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  },
  "department": "Cardiology",
  "experience": 10,
  "consultationFee": 500
}
```

---

## 3. Patients API

### OPD Patients

#### GET /api/patients/opd/:hospitalId
Get all OPD patients

**Query Parameters:**
- `status` - Filter by status (waiting, consulting, completed, cancelled)
- `department` - Filter by department
- `date` - Filter by date (YYYY-MM-DD)

#### POST /api/patients/opd/:hospitalId
Create OPD patient

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "male",
  "phone": "+91 9876543210",
  "aadhaar": "1234 5678 9012",
  "department": "General Medicine",
  "chiefComplaint": "Fever and cough"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "OPD patient registered successfully",
  "data": {
    "_id": "65f123...",
    "patientId": "OPD-65f123-1705315200000",
    "name": "John Doe",
    "age": 35,
    "gender": "male",
    "queueNumber": 1,
    "status": "waiting",
    "registrationTime": "2025-01-15T10:00:00.000Z"
  }
}
```

### Emergency Patients

#### GET /api/patients/emergency/:hospitalId
Get all emergency cases

**Query Parameters:**
- `status` - Filter by status
- `triageLevel` - Filter by triage (critical, urgent, moderate, minor)
- `date` - Filter by date

#### POST /api/patients/emergency/:hospitalId
Create emergency case

**Request Body:**
```json
{
  "patientName": "Jane Smith",
  "age": 45,
  "gender": "female",
  "phone": "+91 9876543210",
  "triageLevel": "critical",
  "chiefComplaint": "Chest pain",
  "vitalSigns": {
    "bloodPressure": "140/90",
    "heartRate": 95,
    "temperature": 98.6,
    "oxygenSaturation": 96
  }
}
```

---

## 4. Alerts API

### GET /api/alerts/:hospitalId?
Get all alerts (hospitalId optional for system-wide alerts)

**Query Parameters:**
- `alertType` - Filter by type (pollution, festival_surge, emergency, inventory_low, bed_shortage, staff_shortage, system)
- `severity` - Filter by severity (low, medium, high, critical)
- `status` - Filter by status (active, acknowledged, resolved, dismissed)
- `startDate` - Start date filter
- `endDate` - End date filter

**Sample Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f123...",
      "alertType": "pollution",
      "severity": "high",
      "title": "High AQI Alert",
      "message": "Air Quality Index is 185 - Unhealthy",
      "pollutionData": {
        "aqi": 185,
        "pm25": 85,
        "pm10": 120
      },
      "status": "active",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST /api/alerts/:hospitalId?
Create alert

**Request Body:**
```json
{
  "alertType": "pollution",
  "severity": "high",
  "title": "High AQI Alert",
  "message": "Air Quality Index is 185 - Unhealthy",
  "pollutionData": {
    "aqi": 185,
    "pm25": 85,
    "pm10": 120,
    "location": "Mumbai"
  },
  "source": "api"
}
```

### PUT /api/alerts/item/:alertId/acknowledge
Acknowledge an alert

**Request Body:**
```json
{
  "userId": "65f123..."
}
```

---

## 5. Inventory API

### GET /api/inventory/:hospitalId
Get all inventory items

**Query Parameters:**
- `category` - Filter by category (oxygen, medicine, equipment, supplies, ppe, blood, other)
- `status` - Filter by status (available, low_stock, out_of_stock, expired, quarantine)
- `lowStock` - Set to "true" to get only low stock items

**Sample Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f123...",
      "hospitalId": "65f123...",
      "itemName": "Oxygen Cylinder",
      "category": "oxygen",
      "itemCode": "OXY-001",
      "currentStock": 25,
      "unit": "cylinders",
      "minThreshold": 10,
      "maxCapacity": 100,
      "status": "available",
      "lastRestocked": "2025-01-10T10:00:00.000Z"
    }
  ]
}
```

### POST /api/inventory/:hospitalId
Create inventory item

**Request Body:**
```json
{
  "itemName": "Oxygen Cylinder",
  "category": "oxygen",
  "itemCode": "OXY-001",
  "currentStock": 25,
  "unit": "cylinders",
  "minThreshold": 10,
  "maxCapacity": 100,
  "supplier": {
    "name": "Oxygen Supply Co.",
    "contact": "+91 9876543210",
    "email": "supplier@example.com"
  },
  "location": "Storage Room A"
}
```

### PUT /api/inventory/item/:itemId/restock
Restock inventory

**Request Body:**
```json
{
  "quantity": 50,
  "costPerUnit": 500,
  "supplier": {
    "name": "Oxygen Supply Co."
  }
}
```

### GET /api/inventory/:hospitalId/low-stock
Get low stock items

---

## 6. Analytics API

### GET /api/analytics/:hospitalId
Get analytics logs

**Query Parameters:**
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `hour` - Filter by hour (0-23)
- `groupBy` - Group by "hour" or "day"

**Sample Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f123...",
      "hospitalId": "65f123...",
      "timestamp": "2025-01-15T10:00:00.000Z",
      "hour": 10,
      "date": "2025-01-15T00:00:00.000Z",
      "footfall": {
        "total": 45,
        "opd": 30,
        "emergency": 10,
        "inpatient": 5,
        "outpatient": 0
      },
      "bedOccupancy": {
        "total": 200,
        "occupied": 145,
        "available": 55,
        "utilizationRate": 72.5
      },
      "waitTimes": {
        "opd": {
          "average": 25,
          "min": 10,
          "max": 45
        },
        "emergency": {
          "average": 15,
          "min": 5,
          "max": 30
        }
      }
    }
  ]
}
```

### POST /api/analytics/:hospitalId
Create analytics log

**Request Body:**
```json
{
  "timestamp": "2025-01-15T10:00:00.000Z",
  "hour": 10,
  "footfall": {
    "total": 45,
    "opd": 30,
    "emergency": 10,
    "inpatient": 5,
    "outpatient": 0
  },
  "bedOccupancy": {
    "total": 200,
    "occupied": 145,
    "available": 55
  },
  "waitTimes": {
    "opd": {
      "average": 25,
      "min": 10,
      "max": 45
    }
  },
  "departmentStats": [
    {
      "department": "General Medicine",
      "patients": 15,
      "doctors": 3,
      "nurses": 5
    }
  ]
}
```

### GET /api/analytics/:hospitalId/stats
Get aggregated statistics

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Name is required",
    "Valid email is required"
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

