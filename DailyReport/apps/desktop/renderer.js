const openButton = document.getElementById("openReport");
const reportEl = document.getElementById("reportBody");

const REPORT_URL = "http://localhost:4000/report";

openButton.addEventListener("click", () => {
  window.dailyReport.openReport();
});

const loadReport = async () => {
  if (!reportEl) {
    return;
  }
  try {
    const response = await fetch(REPORT_URL);
    const data = await response.json();
    reportEl.textContent = `${data.newsSummary} | ${data.weather}`;
  } catch (error) {
    reportEl.textContent = "Report unavailable. Start the server.";
  }
};

loadReport();
