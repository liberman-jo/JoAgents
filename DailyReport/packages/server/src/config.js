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
    llm: process.env.LLM_PROVIDER || "openai"
  }
};

module.exports = { config };
