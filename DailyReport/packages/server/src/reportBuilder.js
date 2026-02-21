const { config } = require("./config");
const { getAstrologyReading } = require("./services/astrologyService");
const { getNewsSummary } = require("./services/newsService");
const { getResearchSummary } = require("./services/researchService");
const { getWeather } = require("./services/weatherService");
const { getExtras } = require("./services/extrasService");
const { getAudioStatus } = require("./services/audioService");

const buildReport = async () => {
  const [astrology, newsSummary, researchSummary, weather, extras, audio] = await Promise.all([
    getAstrologyReading(),
    getNewsSummary(),
    getResearchSummary(),
    getWeather(),
    getExtras(),
    getAudioStatus()
  ]);

  return {
    date: new Date().toISOString(),
    location: `${config.location.city}, ${config.location.region}, ${config.location.country}`,
    astrology,
    newsSummary,
    researchSummary,
    weather,
    curiosity: extras.curiosity,
    quote: extras.quote,
    innovationIdeas: extras.innovationIdeas,
    sources: {
      news: newsSummary.sources,
      research: researchSummary.sources
    },
    audio
  };
};

module.exports = { buildReport };
