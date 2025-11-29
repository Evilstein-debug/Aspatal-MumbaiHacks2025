const express = require("express");
const { getSurgeForecast } = require("../controllers/predictionController");

const router = express.Router();

router.get("/forecast", getSurgeForecast);

module.exports = router;


