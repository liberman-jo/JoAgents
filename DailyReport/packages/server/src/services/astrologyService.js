const getAstrologyReading = async () => {
  return {
    sun: "Scorpio",
    moon: "Sagittarius",
    rising: "Virgo",
    birthday: "2003-10-29",
    reading:
      "Today favors steady focus and selective risk. Lean into detailed planning, then allow a bold check-in with your long-term goals. A short walk or journaling break can help you recalibrate before evening decisions."
  };
};

module.exports = { getAstrologyReading };
