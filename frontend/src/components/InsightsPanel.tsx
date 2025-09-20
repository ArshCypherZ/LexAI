import React, { useState, useEffect } from "react";
import "../styles/SummaryCard.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

function InsightsPanel({ selectedText }: { selectedText: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch summary for selected text
  useEffect(() => {
    if (selectedText && selectedText.trim() !== "") {
      setLoading(true);
      fetch(`${BASE_URL}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          setSummary(data.summary || "No summary returned.");
        })
        .catch(() => {
          setSummary("Error connecting to backend.");
        })
        .finally(() => setLoading(false));
    } else {
      setSummary("");
    }
  }, [selectedText]);

  return (
    <div className="insights-panel">
      <h4 className="panel-title">💡 Insights Panel</h4>

      {/* Selected text summary */}
      <div className="selected-text-summary">
        <h4>Selected Text Summary</h4>
        {loading ? <p>Loading summary...</p> : <p>{summary}</p>}
      </div>
    </div>
  );
}

export default InsightsPanel;
