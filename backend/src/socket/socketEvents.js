// Export socket event names as constants
export const SOCKET_EVENTS = {
  // Bed occupancy
  BED_OCCUPANCY_UPDATE: "bed:occupancy:update",
  
  // Emergency cases
  EMERGENCY_NEW: "emergency:new",
  EMERGENCY_CRITICAL: "emergency:critical",
  EMERGENCY_UPDATE: "emergency:update",
  
  // Doctor shifts
  DOCTOR_SHIFT_CHANGE: "doctor:shift:change",
  DOCTOR_LOGIN: "doctor:login",
  DOCTOR_LOGOUT: "doctor:logout",
  
  // OPD queue
  OPD_QUEUE_UPDATE: "opd:queue:update",
  OPD_PATIENT_ADDED: "opd:patient:added",
  OPD_PATIENT_UPDATED: "opd:patient:updated",
  
  // Alerts
  ALERT_NEW: "alert:new",
  ALERT_ACKNOWLEDGED: "alert:acknowledged",
  
  // Room management
  JOIN_HOSPITAL: "join:hospital",
  LEAVE_HOSPITAL: "leave:hospital"
};

