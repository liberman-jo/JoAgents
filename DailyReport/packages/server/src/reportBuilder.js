const { config } = require("./config");
const { getAstrologyReading } = require("./services/astrologyService");
const { getNewsSummary } = require("./services/newsService");
const { getResearchSummary } = require("./services/researchService");
const { getWeather } = require("./services/weatherService");
const { getExtras } = require("./services/extrasService");
const { getAudioStatus } = require("./services/audioService");

const safeCall = async (label, fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`Report source failed: ${label}`, error);
    return fallback;
  }
};

const buildReport = async () => {
  const [astrology, newsSummary, researchSummary, weather, extras, audio] = await Promise.all([
    safeCall("astrology", getAstrologyReading, {
      sun: "Unknown",
      moon: "Unknown",
      rising: "Unknown",
      birthday: "Unknown",
      reading: "Astrology unavailable."
    }),
    safeCall("news", getNewsSummary, { summary: "News unavailable.", sources: [] }),
    safeCall("research", getResearchSummary, {
      summary: "Research unavailable.",
      items: [],
      sources: []
    }),
    safeCall("weather", getWeather, "Weather unavailable."),
    safeCall("extras", getExtras, {
      curiosity: "Curiosity unavailable.",
      quote: "Quote unavailable.",
      innovationIdeas: []
    }),
    safeCall("audio", getAudioStatus, {
      status: "unavailable",
      url: null,
      provider: config.providers.tts
    })
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
