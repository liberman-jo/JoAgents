const fs = require("fs/promises");
const path = require("path");
const { config } = require("../config");
const { buildReport } = require("../reportBuilder");
const { getPersonalSources } = require("./docsService");

const OUTPUT_DIR = path.join(__dirname, "../../public/audio");
const LATEST_JSON = path.join(OUTPUT_DIR, "daily-latest.json");
const LATEST_MP3 = path.join(OUTPUT_DIR, "daily-latest.mp3");

let generationInProgress = false;

const ensureOutputDir = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
};

const buildScriptPrompt = (report, sources) => {
  const sourcesPreview = sources.length
    ? sources
        .map((source) => `Source: ${source.name}\n${source.content.slice(0, 1200)}`)
        .join("\n\n")
    : "No personal sources provided.";

  return `You are producing a daily podcast script.\n` +
    `Write a conversational script between two speakers: HOST and GUEST.\n` +
    `Each line must start with 'HOST:' or 'GUEST:'.\n` +
    `Keep it 3-5 minutes when spoken.\n` +
    `Include news, weather, research highlights, and 1-2 personal source insights.\n` +
    `Avoid filler and keep it warm, insightful, and concise.\n\n` +
    `Report:\n` +
    `Date: ${report.date}\n` +
    `Location: ${report.location}\n` +
    `News: ${report.newsSummary?.summary || report.newsSummary}\n` +
    `Weather: ${report.weather}\n` +
    `Research: ${report.researchSummary?.summary || "No research summary."}\n` +
    `Curiosity: ${report.curiosity}\n` +
    `Quote: ${report.quote}\n\n` +
    `Personal sources:\n${sourcesPreview}`;
};

const parseScript = (scriptText) => {
  const lines = scriptText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const segments = [];
  for (const line of lines) {
    const match = line.match(/^(HOST|GUEST):\s*(.+)$/i);
    if (match) {
      segments.push({
        speaker: match[1].toUpperCase(),
        text: match[2]
      });
    } else if (segments.length) {
      segments[segments.length - 1].text += ` ${line}`;
    }
  }

  return segments.length ? segments : [{ speaker: "HOST", text: scriptText }];
};

const callOpenAI = async (payload) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI request failed: ${detail}`);
  }

  return response.json();
};

const synthesizeSpeech = async (text, voice) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.providers.ttsModel,
      voice,
      input: text,
      format: "mp3"
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`TTS request failed: ${detail}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
};

const buildFallbackScript = (report) => [
  {
    speaker: "HOST",
    text: `Here is your daily report for ${report.date}. ${report.newsSummary?.summary || report.newsSummary}`
  },
  {
    speaker: "GUEST",
    text: `Weather update: ${report.weather}. Research highlights: ${report.researchSummary?.summary || "None"}.`
  },
  {
    speaker: "HOST",
    text: `${report.curiosity} ${report.quote}`
  }
];

const generateDailyPodcast = async ({ manual = false } = {}) => {
  if (generationInProgress) {
    return { status: "busy" };
  }

  generationInProgress = true;

  try {
    await ensureOutputDir();
    const report = await buildReport();
    const sources = await getPersonalSources();

    let scriptSegments = buildFallbackScript(report);
    let status = "fallback";

    if (process.env.OPENAI_API_KEY) {
      const prompt = buildScriptPrompt(report, sources);
      const completion = await callOpenAI({
        model: config.providers.llmModel,
        messages: [
          { role: "system", content: "You are a daily podcast scriptwriter." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      const scriptText = completion.choices?.[0]?.message?.content?.trim();
      if (scriptText) {
        scriptSegments = parseScript(scriptText);
        status = "generated";
      }
    }

    const audioBuffers = [];
    let audioUrl = null;

    if (process.env.OPENAI_API_KEY) {
      for (const segment of scriptSegments) {
        const voice = segment.speaker === "GUEST" ? "verse" : "alloy";
        const audio = await synthesizeSpeech(segment.text, voice);
        audioBuffers.push(audio);
      }

      const combinedAudio = Buffer.concat(audioBuffers);
      await fs.writeFile(LATEST_MP3, combinedAudio);
      audioUrl = "/audio/daily-latest.mp3";
    }

    const metadata = {
      status,
      generatedAt: new Date().toISOString(),
      audioUrl,
      script: scriptSegments,
      report: {
        date: report.date,
        location: report.location
      }
    };

    await fs.writeFile(LATEST_JSON, JSON.stringify(metadata, null, 2));

    return metadata;
  } finally {
    generationInProgress = false;
  }
};

const getLatestPodcast = async () => {
  try {
    const data = await fs.readFile(LATEST_JSON, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

module.exports = { generateDailyPodcast, getLatestPodcast };
