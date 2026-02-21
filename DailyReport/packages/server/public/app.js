const refreshButton = document.getElementById("refreshReport");
const reportBody = document.getElementById("reportBody");
const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerBody = document.getElementById("answerBody");

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

refreshButton?.addEventListener("click", loadReport);
askButton?.addEventListener("click", askQuestion);
questionInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    askQuestion();
  }
});

loadReport();
