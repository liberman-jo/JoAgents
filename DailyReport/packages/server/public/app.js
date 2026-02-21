const refreshButton = document.getElementById("refreshReport");
const reportBody = document.getElementById("reportBody");
const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerBody = document.getElementById("answerBody");
const generateButton = document.getElementById("generatePodcast");
const downloadLink = document.getElementById("downloadPodcast");
const podcastPlayer = document.getElementById("podcastPlayer");
const podcastStatus = document.getElementById("podcastStatus");

const loadReport = async () => {
  if (!reportBody) {
    return;
  }

  reportBody.textContent = "Loading report...";

  try {
    const response = await fetch("/report");
    if (!response.ok) {
      throw new Error("Report request failed");
    }
    const data = await response.json();
    const newsSummary = data.newsSummary?.summary || data.newsSummary || "News summary unavailable.";
    const weatherSummary = data.weather || "Weather unavailable.";
    reportBody.textContent = `${newsSummary} | ${weatherSummary}`;
  } catch (error) {
    reportBody.textContent = "Report unavailable. Check the server.";
  }
};

const askQuestion = async () => {
  if (!answerBody) {
    return;
  }

  const question = questionInput?.value.trim();
  if (!question) {
    answerBody.textContent = "Type a question first.";
    return;
  }

  answerBody.textContent = "Thinking...";

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error("Ask request failed");
    }

    const data = await response.json();
    answerBody.textContent = data.answer || "No response returned.";
  } catch (error) {
    answerBody.textContent = "Answer unavailable. Check the server.";
  }
};

const updatePodcastUI = (payload) => {
  if (!podcastStatus) {
    return;
  }

  if (!payload) {
    podcastStatus.textContent = "No podcast generated yet.";
    if (podcastPlayer) {
      podcastPlayer.removeAttribute("src");
    }
    if (downloadLink) {
      downloadLink.setAttribute("href", "#");
    }
    return;
  }

  podcastStatus.textContent = `Status: ${payload.status || "unknown"}`;
  if (payload.audioUrl) {
    if (podcastPlayer) {
      podcastPlayer.src = payload.audioUrl;
    }
    if (downloadLink) {
      downloadLink.href = payload.audioUrl;
    }
  }
};

const loadPodcast = async () => {
  try {
    const response = await fetch("/podcast/latest");
    if (!response.ok) {
      updatePodcastUI(null);
      return;
    }
    const data = await response.json();
    updatePodcastUI(data);
  } catch (error) {
    updatePodcastUI(null);
  }
};

const generatePodcast = async () => {
  if (!podcastStatus) {
    return;
  }

  podcastStatus.textContent = "Generating podcast...";

  try {
    const response = await fetch("/podcast/generate", { method: "POST" });
    if (!response.ok) {
      throw new Error("Podcast generation failed");
    }
    const data = await response.json();
    updatePodcastUI(data);
  } catch (error) {
    podcastStatus.textContent = "Podcast unavailable. Check server logs.";
  }
};

refreshButton?.addEventListener("click", loadReport);
askButton?.addEventListener("click", askQuestion);
generateButton?.addEventListener("click", generatePodcast);
questionInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    askQuestion();
  }
});

loadReport();
loadPodcast();
