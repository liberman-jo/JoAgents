const { config } = require("../config");

const getAudioStatus = async () => {
  return {
    status: "pending",
    url: null,
    provider: config.providers.tts
  };
};

const answerQuestion = async (question) => {
  return {
    provider: config.providers.llm,
    answer: `Placeholder response for: ${question}`
  };
};

module.exports = { getAudioStatus, answerQuestion };
