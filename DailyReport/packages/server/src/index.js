const express = require("express");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
require("dotenv").config();
const { buildReport } = require("./reportBuilder");
const { answerQuestion } = require("./services/audioService");
const { generateDailyPodcast, getLatestPodcast } = require("./services/podcastService");
const { config } = require("./config");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/report", async (req, res) => {
  try {
    const report = await buildReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to build report." });
  }
});

app.get("/podcast/latest", async (req, res) => {
  const latest = await getLatestPodcast();
  if (!latest) {
    res.status(404).json({ error: "No podcast generated yet." });
    return;
  }
  res.json(latest);
});

app.post("/podcast/generate", async (req, res) => {
  try {
    const result = await generateDailyPodcast({ manual: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate podcast." });
  }
});

app.post("/ask", async (req, res) => {
  const { question } = req.body || {};
  if (!question) {
    res.status(400).json({ error: "Question is required." });
    return;
  }

  try {
    const result = await answerQuestion(question);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to answer question." });
  }
});

app.listen(port, () => {
  console.log(`Daily report server listening on ${port}`);
});

cron.schedule(
  config.podcast.cron,
  () => {
    generateDailyPodcast().catch((error) => {
      console.error("Scheduled podcast generation failed", error);
    });
  },
  { timezone: config.podcast.timezone }
);
