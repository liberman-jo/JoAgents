const { config } = require("../config");

const getWeather = async () => {
  const { latitude, longitude, city, region, country } = config.location;
  const endpoint =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";
  const response = await fetch(endpoint);
  if (!response.ok) {
    return `Weather unavailable for ${city}, ${region}, ${country}.`;
  }
  const data = await response.json();
  const current = data.current || {};
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  return `Current weather for ${city}: ${temp} C, wind ${wind} km/h.`;
};

module.exports = { getWeather };
