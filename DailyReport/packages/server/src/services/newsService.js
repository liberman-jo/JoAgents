const { config } = require("../config");

const summarizeHeadlines = (headlines) => {
  if (!headlines.length) {
    return "No headlines available.";
  }
  const top = headlines.slice(0, 8).join(" | ");
  return `Top world headlines: ${top}.`; // TODO: Replace with LLM summary for 5-minute briefing.
};

const getFromGdelt = async () => {
  const endpoint =
    "https://api.gdeltproject.org/api/v2/doc/doc?query=world%20news&mode=ArtList&maxrecords=10&format=json";
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("GDELT request failed");
  }
  const data = await response.json();
  const headlines = (data.articles || []).map((item) => item.title).filter(Boolean);
  return {
    summary: summarizeHeadlines(headlines),
    sources: ["GDELT"]
  };
};

const getFromNewsApi = async () => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return {
      summary: "News API key not configured.",
      sources: ["NewsAPI"]
    };
  }

  const endpoint = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("NewsAPI request failed");
  }
  const data = await response.json();
  const headlines = (data.articles || []).map((item) => item.title).filter(Boolean);
  return {
    summary: summarizeHeadlines(headlines),
    sources: ["NewsAPI"]
  };
};

const getNewsSummary = async () => {
  if (config.news.provider === "newsapi") {
    return getFromNewsApi();
  }

  return getFromGdelt();
};

module.exports = { getNewsSummary };
