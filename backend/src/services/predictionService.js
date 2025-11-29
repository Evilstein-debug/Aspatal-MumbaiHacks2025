import axios from "axios";

const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL || "http://localhost:8001";

// Helper function to create a service unavailable error
const createServiceUnavailableError = (operation) => {
  const error = new Error(
    `Prediction service is not available. Please start the Python microservice on port 8001. ` +
    `Run: cd prediction-service && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001`
  );
  error.code = "SERVICE_UNAVAILABLE";
  error.statusCode = 503;
  return error;
};

// Helper function to check if error is connection-related
const isConnectionError = (error) => {
  return (
    error.code === "ECONNREFUSED" ||
    error.code === "ENOTFOUND" ||
    error.code === "ETIMEDOUT" ||
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("connect")
  );
};

class PredictionService {
  async predictFestivalSurge(data) {
    try {
      const response = await axios.post(
        `${PREDICTION_SERVICE_URL}/api/predict/festival`,
        data,
        { timeout: 5000 } // 5 second timeout
      );
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        console.error(`[Prediction Service] Connection failed. Is the service running on ${PREDICTION_SERVICE_URL}?`);
        throw createServiceUnavailableError("Festival prediction");
      }
      console.error("Festival prediction error:", error.message);
      throw error;
    }
  }

  async predictPollutionSurge(data) {
    try {
      const response = await axios.post(
        `${PREDICTION_SERVICE_URL}/api/predict/pollution`,
        data,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        console.error(`[Prediction Service] Connection failed. Is the service running on ${PREDICTION_SERVICE_URL}?`);
        throw createServiceUnavailableError("Pollution prediction");
      }
      console.error("Pollution prediction error:", error.message);
      throw error;
    }
  }

  async forecastStaff(data) {
    try {
      const response = await axios.post(
        `${PREDICTION_SERVICE_URL}/api/predict/staff`,
        data,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        console.error(`[Prediction Service] Connection failed. Is the service running on ${PREDICTION_SERVICE_URL}?`);
        throw createServiceUnavailableError("Staff forecast");
      }
      console.error("Staff forecast error:", error.message);
      throw error;
    }
  }

  async getCombinedPrediction(params) {
    try {
      const response = await axios.get(
        `${PREDICTION_SERVICE_URL}/api/predict/combined`,
        { params, timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        console.error(`[Prediction Service] Connection failed. Is the service running on ${PREDICTION_SERVICE_URL}?`);
        throw createServiceUnavailableError("Combined prediction");
      }
      console.error("Combined prediction error:", error.message);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${PREDICTION_SERVICE_URL}/health`);
      return response.data;
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  }
}

export default new PredictionService();

