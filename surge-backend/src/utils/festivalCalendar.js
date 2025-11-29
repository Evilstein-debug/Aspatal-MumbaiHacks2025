const dayjs = require("dayjs");

const BASE_FESTIVALS = [
  { name: "New Year", monthDay: "01-01" },
  { name: "Makar Sankranti", monthDay: "01-14" },
  { name: "Republic Day", monthDay: "01-26" },
  { name: "Holi", monthDay: "03-14" },
  { name: "Eid al-Fitr", monthDay: "04-01" },
  { name: "Ganesh Chaturthi", monthDay: "09-07" },
  { name: "Navratri", monthDay: "10-02" },
  { name: "Dussehra", monthDay: "10-12" },
  { name: "Diwali", monthDay: "10-21" },
  { name: "Christmas", monthDay: "12-25" }
];

const buildFestivalCalendar = (year) =>
  BASE_FESTIVALS.map((festival) => ({
    name: festival.name,
    date: dayjs(`${year}-${festival.monthDay}`),
    monthDay: festival.monthDay
  }));

const getFestivalWindow = (targetDate, windowDays = 3) => {
  const date = dayjs(targetDate).startOf("day");
  const yearsToScan = [date.year() - 1, date.year(), date.year() + 1];
  let closestFestival = null;
  let minDiff = Number.POSITIVE_INFINITY;

  yearsToScan.forEach((year) => {
    buildFestivalCalendar(year).forEach((festival) => {
      const diff = Math.abs(festival.date.diff(date, "day"));

      if (diff <= windowDays && diff < minDiff) {
        closestFestival = {
          name: festival.name,
          date: festival.date.toDate(),
          daysAway: festival.date.diff(date, "day")
        };
        minDiff = diff;
      }
    });
  });

  return {
    isFestivalNearby: Boolean(closestFestival),
    festival: closestFestival
  };
};

module.exports = {
  getFestivalWindow,
  BASE_FESTIVALS
};


