const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const SURGE_API_BASE_URL =
  import.meta.env.VITE_SURGE_API_URL || "http://localhost:9000/api/surge";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

const surgeApiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${SURGE_API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`Surge API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Surge API call failed:", error);
    throw error;
  }
};

// Bed Occupancy API
export const bedAPI = {
  getOccupancy: (hospitalId) => apiCall(`/beds/${hospitalId}`),
  getRealTime: (hospitalId) => apiCall(`/beds/${hospitalId}/realtime`),
  getStatistics: (hospitalId) => apiCall(`/beds/${hospitalId}/statistics`),
  updateOccupancy: (hospitalId, bedType, data) =>
    apiCall(`/beds/${hospitalId}/${bedType}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  createOccupancy: (hospitalId, data) =>
    apiCall(`/beds/${hospitalId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Individual Bed Items API
export const bedItemAPI = {
  getAllBeds: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/bed-items/${hospitalId}${queryString ? `?${queryString}` : ""}`);
  },
  getBedById: (bedId) => apiCall(`/bed-items/item/${bedId}`),
  getAvailableBeds: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/bed-items/${hospitalId}/available${queryString ? `?${queryString}` : ""}`);
  },
  createBed: (hospitalId, data) =>
    apiCall(`/bed-items/${hospitalId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBed: (bedId, data) =>
    apiCall(`/bed-items/item/${bedId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBed: (bedId) =>
    apiCall(`/bed-items/item/${bedId}`, {
      method: "DELETE",
    }),
};

// Doctor Shift API
export const shiftAPI = {
  getShifts: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/shifts/${hospitalId}${queryString ? `?${queryString}` : ""}`);
  },
  getActiveShifts: (hospitalId) => apiCall(`/shifts/${hospitalId}/active`),
  getStatistics: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/shifts/${hospitalId}/statistics${queryString ? `?${queryString}` : ""}`);
  },
  createShift: (hospitalId, data) =>
    apiCall(`/shifts/${hospitalId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateShift: (shiftId, data) =>
    apiCall(`/shifts/${shiftId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteShift: (shiftId) =>
    apiCall(`/shifts/${shiftId}`, {
      method: "DELETE",
    }),
};

// Doctors API
export const doctorAPI = {
  getDoctors: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/doctors/${hospitalId}${queryString ? `?${queryString}` : ""}`);
  },
  getDoctorById: (doctorId) => apiCall(`/doctors/item/${doctorId}`),
  getOnDutyDoctors: (hospitalId) => apiCall(`/doctors/${hospitalId}/on-duty`),
  createDoctor: (hospitalId, data) =>
    apiCall(`/doctors/${hospitalId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDoctor: (doctorId, data) =>
    apiCall(`/doctors/item/${doctorId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteDoctor: (doctorId) =>
    apiCall(`/doctors/item/${doctorId}`, {
      method: "DELETE",
    }),
};

// OPD Patient API
export const opdAPI = {
  getPatients: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/opd/${hospitalId}${queryString ? `?${queryString}` : ""}`);
  },
  getQueue: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/opd/${hospitalId}/queue${queryString ? `?${queryString}` : ""}`);
  },
  getStatistics: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/opd/${hospitalId}/statistics${queryString ? `?${queryString}` : ""}`);
  },
  createPatient: (hospitalId, data) =>
    apiCall(`/opd/${hospitalId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePatient: (patientId, data) =>
    apiCall(`/opd/${patientId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Emergency Case API
export const emergencyAPI = {
  getCases: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/emergency/${hospitalId}${queryString ? `?${queryString}` : ""}`);
  },
  getCriticalCases: (hospitalId) => apiCall(`/emergency/${hospitalId}/critical`),
  getStatistics: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/emergency/${hospitalId}/statistics${queryString ? `?${queryString}` : ""}`);
  },
  createCase: (hospitalId, data) =>
    apiCall(`/emergency/${hospitalId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCase: (caseId, data) =>
    apiCall(`/emergency/${caseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Alerts API
export const alertAPI = {
  getAlerts: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = hospitalId ? `/alerts/${hospitalId}` : "/alerts";
    return apiCall(`${endpoint}${queryString ? `?${queryString}` : ""}`);
  },
  getActiveAlerts: (hospitalId) => {
    const endpoint = hospitalId ? `/alerts/${hospitalId}/active` : "/alerts/active";
    return apiCall(endpoint);
  },
  createAlert: (hospitalId, data) =>
    apiCall(hospitalId ? `/alerts/${hospitalId}` : "/alerts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAlert: (alertId, data) =>
    apiCall(`/alerts/item/${alertId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  acknowledgeAlert: (alertId, userId) =>
    apiCall(`/alerts/item/${alertId}/acknowledge`, {
      method: "PUT",
      body: JSON.stringify({ userId }),
    }),
  deleteAlert: (alertId) =>
    apiCall(`/alerts/item/${alertId}`, {
      method: "DELETE",
    }),
};

// Prediction API
export const predictionAPI = {
  getPredictions: (hospitalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = hospitalId ? `/predictions/${hospitalId}` : "/predictions";
    return apiCall(`${endpoint}${queryString ? `?${queryString}` : ""}`);
  },
  getUpcoming: (hospitalId) => {
    const endpoint = hospitalId ? `/predictions/${hospitalId}/upcoming` : "/predictions/upcoming";
    return apiCall(endpoint);
  },
  createPrediction: (hospitalId, data) =>
    apiCall(`/predictions/${hospitalId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (predictionId, status) =>
    apiCall(`/predictions/${predictionId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

export const surgeAPI = {
  getForecast: (hospitalId) => apiCall(`/predictions/surge/forecast/${hospitalId}`),
  getCombinedPrediction: (params) => apiCall(`/predictions/combined`, { params }),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: (hospitalId) => apiCall(`/dashboard/${hospitalId}/overview`),
};