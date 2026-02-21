import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, TextInput, Pressable, ScrollView } from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:4000";
const REPORT_URL = `${API_BASE}/report`;
const ASK_URL = `${API_BASE}/ask`;

export default function App() {
  const [question, setQuestion] = useState("");
  const [log, setLog] = useState(["Welcome to your Daily Report."]);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await fetch(REPORT_URL);
        const data = await response.json();
        setReport(data);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    };

    loadReport();
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) {
      return;
    }
    setLog((prev) => [...prev, `You: ${question}`, "Assistant: Thanks for the question. Fetching a response..."]);
    const currentQuestion = question;
    setQuestion("");

    try {
      const response = await fetch(ASK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion })
      });
      const data = await response.json();
      setLog((prev) => [...prev, `Assistant: ${data.answer || "No response"}`]);
    } catch (error) {
      setLog((prev) => [...prev, "Assistant: Unable to reach the server."]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#f6f2ea" }}>
      <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 8 }}>Daily Report</Text>
      <Text style={{ marginBottom: 12 }}>Audio + interactive Q&A</Text>
      {status === "loading" && <Text>Loading report...</Text>}
      {status === "error" && <Text>Report unavailable. Check server.</Text>}
      {report && (
        <View style={{ marginBottom: 12 }}>
          <Text>Location: {report.location}</Text>
          <Text>Astrology: {report.astrology.reading}</Text>
          <Text>News: {report.newsSummary}</Text>
          <Text>Research: {report.researchSummary.summary}</Text>
          <Text>Weather: {report.weather}</Text>
          <Text>Curiosity: {report.curiosity}</Text>
          <Text>Quote: {report.quote}</Text>
        </View>
      )}
      <ScrollView style={{ flex: 1, marginBottom: 12 }}>
        {log.map((item, index) => (
          <Text key={`${item}-${index}`} style={{ marginBottom: 6 }}>{item}</Text>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask a follow-up"
          style={{ flex: 1, borderWidth: 1, borderColor: "#8b8b8b", padding: 10, borderRadius: 8 }}
        />
        <Pressable onPress={handleAsk} style={{ padding: 10, backgroundColor: "#111", borderRadius: 8 }}>
          <Text style={{ color: "#fff" }}>Ask</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
