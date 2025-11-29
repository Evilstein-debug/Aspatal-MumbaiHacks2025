const axios = require("axios");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const fetchExternalAqi = async (city) => {
  const endpoint = process.env.AQI_API_URL;
  const apiKey = process.env.AQI_API_KEY;

  if (!endpoint) {
    return null;
  }

  try {
    const url = endpoint
      .replace("{{CITY}}", city)
      .replace("{{API_KEY}}", apiKey || "");

    const { data } = await axios.get(url, {
      timeout: 4500
    });

    if (typeof data === "number") {
      return data;
    }

    if (data?.data?.aqi) {
      return Number(data.data.aqi);
    }

    if (data?.aqi) {
      return Number(data.aqi);
    }

    return null;
  } catch (error) {
    console.warn("⚠️ AQI fetch failed, falling back to simulation:", error.message);
    return null;
  }
};

const simulateAqi = () => {
  const base = 120 + Math.random() * 80;
  const pollutionSpikeChance = Math.random();

  let aqi = base;

  if (pollutionSpikeChance > 0.85) {
    aqi += 80 + Math.random() * 70;
  }

  if (pollutionSpikeChance < 0.2) {
    aqi -= 40 * Math.random();
  }

  return Math.round(clamp(aqi, 60, 380));
};

const getAqi = async (city = process.env.AQI_DEFAULT_CITY || "Mumbai") => {
  const externalValue = await fetchExternalAqi(city);
  if (externalValue) {
    return Math.round(clamp(externalValue, 10, 500));
  }
  return simulateAqi();
};

module.exports = {
  getAqi
};


