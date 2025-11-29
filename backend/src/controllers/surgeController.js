import Patient from "../models/patient.js";
import BedOccupancy from "../models/bedOccupancy.js";
import predictionService from "../services/predictionService.js";

/**
 * GET /api/predictions/surge/forecast/:hospitalId
 * Generates Gemini-enhanced surge forecast with AQI, festival, and trend data
 */
export const getSurgeForecast = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    // Fetch last 7 days of patient data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const patientHistory = await Patient.aggregate([
      {
        $match: {
          hospitalId: hospitalId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          patientCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const history = patientHistory.map(day => ({
      date: day._id,
      patientCount: day.patientCount
    }));

    // Fetch current bed occupancy and resource usage
    const bedData = await BedOccupancy.find({ hospitalId }).lean();
    const totalBeds = bedData.reduce((sum, bed) => sum + bed.totalBeds, 0);
    const occupiedBeds = bedData.reduce((sum, bed) => sum + bed.occupiedBeds, 0);

    // Calculate ICU usage (assuming ICU is a ward type)
    const icuBed = bedData.find(bed => bed.wardType?.toLowerCase().includes('icu'));
    const icuUsage = icuBed ? icuBed.occupiedBeds : 0;

    // Get current AQI (you can integrate with a real AQI API)
    const latestAqi = 85; // Placeholder - integrate with AQI service

    // Calculate weekend load average
    const weekendPatients = patientHistory.filter((day, index) => {
      const date = new Date(day._id);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    });
    const weekendLoad = weekendPatients.length > 0
      ? Math.round(weekendPatients.reduce((sum, day) => sum + day.patientCount, 0) / weekendPatients.length)
      : 0;

    // Call Python prediction service for Gemini-enhanced forecast
    let prediction;
    let usedGemini = false;

    try {
      const combinedPrediction = await predictionService.getCombinedPrediction({
        aqi: latestAqi,
        location: "Mumbai",
        historical_data: history.map(h => h.patientCount)
      });

      prediction = {
        predictedPatientLoad: combinedPrediction.combined_predicted_inflow || 200,
        surgeLevel: combinedPrediction.combined_predicted_inflow > 250 ? "HIGH" 
                    : combinedPrediction.combined_predicted_inflow > 200 ? "MEDIUM" 
                    : "LOW",
        recommendations: combinedPrediction.all_recommendations || [],
        reasoning: "Prediction based on historical trends, AQI levels, and festival proximity using Gemini AI."
      };
      usedGemini = true;
    } catch (error) {
      console.error("Gemini prediction failed, using fallback:", error.message);
      
      // Fallback: Simple moving average
      const avgPatients = history.length > 0
        ? Math.round(history.reduce((sum, day) => sum + day.patientCount, 0) / history.length)
        : 180;

      prediction = {
        predictedPatientLoad: Math.round(avgPatients * 1.1), // 10% increase estimate
        surgeLevel: avgPatients > 220 ? "HIGH" : avgPatients > 180 ? "MEDIUM" : "LOW",
        recommendations: [
          "Monitor patient inflow closely",
          "Ensure adequate staff availability",
          "Review inventory levels"
        ],
        reasoning: "Fallback prediction based on 7-day moving average with 10% buffer."
      };
      usedGemini = false;
    }

    // Check for upcoming festivals (placeholder - integrate with festival API)
    const upcomingFestivals = [
      { name: "Diwali", date: "2024-11-01", daysAway: 2 }
    ];

    const isFestivalNearby = upcomingFestivals.some(f => f.daysAway <= 3);

    const response = {
      history,
      prediction,
      signals: {
        latestAqi,
        avgIcuUsage: icuUsage,
        avgOxygenConsumption: Math.round(icuUsage * 2.5), // Estimate: 2.5L per ICU patient
        weekendLoad,
        festivalProximity: {
          isFestivalNearby,
          festival: upcomingFestivals[0] || null
        }
      },
      meta: {
        hospitalId,
        generatedAt: new Date().toISOString(),
        usedGemini
      }
    };

    return res.json(response);
  } catch (error) {
    console.error("Surge forecast error:", error);
    return res.status(500).json({
      error: "Failed to generate surge forecast",
      details: error.message
    });
  }
};

export default { getSurgeForecast };