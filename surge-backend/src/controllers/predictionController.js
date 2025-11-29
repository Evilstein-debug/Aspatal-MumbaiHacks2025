const { getPredictionForHospital } = require("../services/predictionService");

const getSurgeForecast = async (req, res) => {
  try {
    const hospitalId =
      req.query.hospitalId || process.env.DEFAULT_HOSPITAL_ID || "aspatal-mumbai";

    const result = await getPredictionForHospital(hospitalId);

    res.json({
      hospitalId,
      ...result
    });
  } catch (error) {
    console.error("Surge forecast error:", error);
    res.status(500).json({
      message: error.message || "Unable to compute surge forecast"
    });
  }
};

module.exports = {
  getSurgeForecast
};


