const openButton = document.getElementById("openReport");
const reportEl = document.getElementById("reportBody");

const REPORT_URL = "http://localhost:4000/report";

const loadReport = async () => {
  if (!reportEl) {
    return;
  }

  reportEl.textContent = "Loading report...";

  try {
    const response = await fetch(REPORT_URL);
    if (!response.ok) {
      throw new Error("Report request failed");
    }
    const data = await response.json();
    const newsSummary = data.newsSummary?.summary || data.newsSummary || "News summary unavailable.";
    const weatherSummary = data.weather || "Weather unavailable.";
    reportEl.textContent = `${newsSummary} | ${weatherSummary}`;
  } catch (error) {
    reportEl.textContent = "Report unavailable. Start the server.";
  }
};

openButton?.addEventListener("click", () => {
  window.dailyReport.openReport();
  loadReport();
});

loadReport();
