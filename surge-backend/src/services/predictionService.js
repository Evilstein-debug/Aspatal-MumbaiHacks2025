const dayjs = require("dayjs");
const HospitalStat = require("../models/HospitalStat");
const { getFestivalWindow } = require("../utils/festivalCalendar");
const { getAqi } = require("./aqiService");
const { geminiService } = require("./geminiService");

const SURGE_THRESHOLDS = {
  LOW: 220,
  MEDIUM: 280,
  HIGH: 340
};

const classifySurge = (value) => {
  if (value >= SURGE_THRESHOLDS.HIGH) return "HIGH";
  if (value >= SURGE_THRESHOLDS.MEDIUM) return "MEDIUM";
  if (value >= SURGE_THRESHOLDS.LOW) return "LOW";
  return "LOW";
};

const buildFallbackRecommendations = (surgeLevel, aqi, isFestivalNearby) => {
  const recs = [];

  if (surgeLevel === "HIGH") {
    recs.push("Activate surge staffing roster within 12 hours");
    recs.push("Delay non-critical elective procedures for 48 hours");
    recs.push("Coordinate with city command center for patient diversion");
  } else if (surgeLevel === "MEDIUM") {
    recs.push("Extend emergency department shift coverage by 20%");
    recs.push("Pre-stage 30% additional oxygen cylinders");
  } else {
    recs.push("Maintain routine surge readiness checklist");
    recs.push("Verify vendor availability for rapid oxygen refill");
  }

  if (aqi >= 200) {
    recs.push("Push respiratory health advisory via SMS and social");
  }

  if (isFestivalNearby) {
    recs.push("Deploy mobile triage tents near festival hotspots");
  }

  return recs.slice(0, 4);
};

const fallbackPrediction = (history, aqi, festivalContext) => {
  const avgPatients =
    history.reduce((acc, day) => acc + day.patientCount, 0) / history.length;
  const latest = history[0];
  const oldest = history[history.length - 1];
  const rollingTrend = latest.patientCount - oldest.patientCount;

  let predicted = avgPatients + rollingTrend * 0.25;
  predicted += (aqi - 160) * 0.3;

  if (festivalContext.isFestivalNearby) {
    predicted += 45 - Math.abs(festivalContext.festival.daysAway || 0) * 5;
  }

  if (dayjs().add(1, "day").day() === 0 || dayjs().add(1, "day").day() === 6) {
    predicted -= 25;
  }

  predicted = Math.max(predicted, 120);

  const surgeLevel = classifySurge(predicted);

  return {
    predictedPatientLoad: Math.round(predicted),
    surgeLevel,
    reasoning:
      "Fallback model: blended 7-day average, AQI impact, and festival proximity adjustment.",
    recommendations: buildFallbackRecommendations(
      surgeLevel,
      aqi,
      festivalContext.isFestivalNearby
    )
  };
};

const buildPayload = (history, aqi, festivalContext) => {
  const payloadHistory = history
    .slice()
    .reverse()
    .map((item) => ({
      date: dayjs(item.date).format("YYYY-MM-DD"),
      patientCount: item.patientCount,
      icuUsage: item.icuUsage,
      oxygenConsumption: item.oxygenConsumption,
      aqi: item.aqi,
      isWeekend: item.isWeekend,
      isFestivalDay: item.isFestivalDay,
      festivalName: item.festivalName || null
    }));

  return {
    generatedAt: new Date().toISOString(),
    hospitalId: history?.[0]?.hospitalId || process.env.DEFAULT_HOSPITAL_ID,
    trailingDays: payloadHistory.length,
    history: payloadHistory,
    signals: {
      latestAqi: aqi,
      avgIcuUsage: Math.round(
        history.reduce((acc, curr) => acc + curr.icuUsage, 0) / history.length
      ),
      avgOxygenConsumption: Math.round(
        history.reduce((acc, curr) => acc + curr.oxygenConsumption, 0) /
          history.length
      ),
      weekendLoad: Math.round(
        history
          .filter((day) => day.isWeekend)
          .reduce((acc, curr) => acc + curr.patientCount, 0) /
          (history.filter((day) => day.isWeekend).length || 1)
      ),
      festivalProximity: festivalContext
    }
  };
};

const getPredictionForHospital = async (hospitalId) => {
  const history = await HospitalStat.find({ hospitalId })
    .sort({ date: -1 })
    .limit(7)
    .lean();

  if (!history.length) {
    throw new Error("No historical data found for hospital");
  }

  const aqi = await getAqi();
  const festivalContext = getFestivalWindow(new Date(), 3);
  const payload = buildPayload(history, aqi, festivalContext);

  let prediction;
  let usedGemini = false;

  if (!geminiService.disabled) {
    try {
      prediction = await geminiService.predictSurge(payload);
      usedGemini = true;
    } catch (error) {
      console.warn("⚠️ Gemini prediction failed, using fallback:", error.message);
    }
  }

  if (!prediction) {
    prediction = fallbackPrediction(history, aqi, festivalContext);
  }

  return {
    history: payload.history,
    signals: payload.signals,
    prediction,
    meta: {
      usedGemini,
      generatedAt: payload.generatedAt
    }
  };
};

module.exports = {
  getPredictionForHospital
};

