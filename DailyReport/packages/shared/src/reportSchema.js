const reportSchema = {
  date: "string",
  location: "string",
  astrology: {
    sun: "string",
    moon: "string",
    rising: "string",
    birthday: "string",
    reading: "string"
  },
  newsSummary: "string",
  researchSummary: "object",
  weather: "string",
  curiosity: "string",
  quote: "string",
  innovationIdeas: "array",
  sources: {
    news: "array",
    research: "array"
  },
  audio: {
    status: "string",
    url: "string|null",
    provider: "string"
  }
};

module.exports = { reportSchema };
