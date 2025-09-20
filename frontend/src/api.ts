import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const API = axios.create({ baseURL: BASE_URL });

// Upload document for summarization
export const uploadDocument = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/upload", formData);
};

// Ask a question about uploaded document
export const askQuestion = (query: string) => {
  return API.post("/ask", { question: query });
};

export const exportSummary = async (fileHash: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileHash }),
    });
    if (!response.ok) throw new Error("Export failed");
    const data = await response.json();
    if (data.public_url) {
      window.open(data.public_url, "_blank");
    } else {
      alert("No export URL returned.");
    }
  } catch (err) {
    alert("Failed to export summary.");
  }
};

// Fetch status for multiple file hashes
export async function fetchSummaryStatus(
  fileHashes: string[]
): Promise<Record<string, boolean>> {
  try {
    const response = await fetch(`${BASE_URL}/summary/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileHashes),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch summary status");
    }

    const data = await response.json(); // { status: { fileHash: true/false } }
    return data.status;
  } catch (error) {
    console.error("Error fetching summary status:", error);
    return {};
  }
}

// Fetch summary for one file hash
export async function fetchSummary(fileHash: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileHash }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch summary");
    }

    const data = await response.json(); // { summary: "..." }
    return data.summary;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return null;
  }
}

export { BASE_URL };
