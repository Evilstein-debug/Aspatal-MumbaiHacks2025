const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

