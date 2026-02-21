const path = require("path");

const config = {
  location: {
    city: "Philadelphia",
    region: "PA",
    country: "United States",
    latitude: 39.9526,
    longitude: -75.1652
  },
  interests: [
    "neuroscience",
    "psychology",
    "public health",
    "philosophy",
    "digital humanities",
    "artificial intelligence"
  ],
  news: {
    provider: process.env.NEWS_PROVIDER || "gdelt"
  },
  providers: {
    tts: process.env.TTS_PROVIDER || "openai",
    llm: process.env.LLM_PROVIDER || "openai",
    llmModel: process.env.LLM_MODEL || "gpt-4o-mini",
    ttsModel: process.env.TTS_MODEL || "tts-1"
  },
  content: {
    sourcesDir: process.env.SOURCES_DIR || path.join(__dirname, "../../../data/sources")
  },
  podcast: {
    cron: process.env.PODCAST_CRON || "0 5 * * *",
    timezone: process.env.PODCAST_TIMEZONE || "America/New_York"
  }
};

module.exports = { config };
