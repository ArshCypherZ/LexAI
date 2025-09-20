import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/SummarizerPage.css";
import { useFile } from "../context/FileContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface AISidebarProps {
  open: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  onClose: () => void;
  docChunks?: string[];
  docMessages: Array<{ role: "user" | "ai" | "thinking"; content: string }>;
  setDocMessages: React.Dispatch<
    React.SetStateAction<Array<{ role: "user" | "ai" | "thinking"; content: string }>>
  >;
}

// Helper function to generate a simple hash from file content
const generateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
};

const AISidebar: React.FC<AISidebarProps> = ({
  open,
  chatInput,
  setChatInput,
  onClose,
  docChunks,
  docMessages,
  setDocMessages,
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [convMessages, setConvMessages] = React.useState<
    Array<{ role: "user" | "ai" | "thinking"; content: string }>
  >([]);
  const [conversationMode, setConversationMode] = React.useState<boolean>(false);
  const [newChatActive, setNewChatActive] = React.useState<boolean>(false);
  const [sessionId, setSessionId] = useState(() => uuidv4());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFile } = useFile();

  if (!open) return null;

  const messages = conversationMode ? convMessages : docMessages;
  const setMessages = conversationMode ? setConvMessages : setDocMessages;

  const handleSendMessage = async () => {
    if (!chatInput) return;
    if (!conversationMode && (!Array.isArray(docChunks) || docChunks.length === 0)) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: chatInput },
      { role: "thinking", content: "Thinking..." },
    ]);
    const userMessage = chatInput;
    setChatInput("");
    setLoading(true);
    try {
      if (conversationMode) {
        const response = await fetch(`${BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.filter((m) => m.role !== "thinking"),
              { role: "user", content: userMessage },
            ],
            chunks: docChunks,
            mode: "general",
            generalKey: sessionId,
          }),
        });
        const reader = response.body?.getReader();
        let aiMsg = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            aiMsg += new TextDecoder().decode(value);
            setMessages((prev) => {
              const filtered = prev.filter(
                (msg, idx) =>
                  !(msg.role === "thinking" && idx === prev.length - 1)
              );
              if (
                filtered.length > 0 &&
                filtered[filtered.length - 1].role === "ai"
              ) {
                return [
                  ...filtered.slice(0, -1),
                  { role: "ai", content: aiMsg },
                ];
              }
              return [...filtered, { role: "ai", content: aiMsg }];
            });
          }
        }
      } else {
        const response = await fetch(`${BASE_URL}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: userMessage, chunks: docChunks }),
        });
        const data: { answer?: string } = await response.json();
        setMessages((prev) => {
          const filtered = prev.filter(
            (msg, idx) =>
              !(msg.role === "thinking" && idx === prev.length - 1)
          );
          return [
            ...filtered,
            { role: "ai", content: data.answer || "No answer returned." },
          ];
        });
      }
    } catch (err: any) {
      setMessages((prev) => {
        const filtered = prev.filter(
          (msg, idx) => !(msg.role === "thinking" && idx === prev.length - 1)
        );
        return [
          ...filtered,
          { role: "ai", content: "⚠️ Error connecting to AI backend." },
        ];
      });
    }
    setLoading(false);
  };

  // Handle file selection and convert File to FileMeta
  const handleFileSelect = async (file: File) => {
    try {
      const fileHash = await generateFileHash(file);
      const fileMeta = {
        name: file.name,
        type: file.type,
        size: file.size,
        fileHash: fileHash,
      };
      addFile(fileMeta);
    } catch (error) {
      console.error('Error processing file:', error);
      const fallbackHash = btoa(`${file.name}-${file.size}-${file.lastModified}`).substring(0, 16);
      const fileMeta = {
        name: file.name,
        type: file.type,
        size: file.size,
        fileHash: fallbackHash,
      };
      addFile(fileMeta);
    }
  };

  return (
    <div
      className="ai-sidebar"
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        height: "100vh",
        width: "420px",
        background: "#f3eaff",
        boxShadow: "-2px 0 16px rgba(0,0,0,0.10)",
        zIndex: 2000,
        padding: "32px 32px 32px 24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: "0 0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>
            Ask About the Document
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#888",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ color: "#444", fontSize: "0.98rem", marginBottom: 16 }}>
          Chat with AI. Switch modes or mix in another document.
        </div>

        

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            style={{
              background: !conversationMode ? "#222" : "#f7f7fa",
              color: !conversationMode ? "#fff" : "#222",
              borderRadius: "6px",
              padding: "6px 14px",
              fontWeight: 600,
              fontSize: "0.98rem",
              border: "none",
            }}
            onClick={() => {
              setConversationMode(false);
              setChatInput("");
              setDocMessages([]);
            }}
          >
            Document Chat
          </button>
          <button
            style={{
              background: conversationMode ? "#222" : "#f7f7fa",
              color: conversationMode ? "#fff" : "#222",
              borderRadius: "6px",
              padding: "6px 14px",
              fontWeight: 600,
              fontSize: "0.98rem",
              border: "none",
            }}
            onClick={() => {
              setConversationMode(true);
              setChatInput("");
              setConvMessages([]);
              setSessionId(uuidv4());
            }}
          >
            Conversation Mode
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                await handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <button
            style={{
              background: "#e3d7f7",
              color: "#4b2178",
              borderRadius: "6px",
              padding: "6px 14px",
              fontWeight: 600,
              fontSize: "0.98rem",
              border: "none",
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            + Mix Doc
          </button>
          <button
            style={{
              background: newChatActive ? "#222" : "#f7f7fa",
              color: newChatActive ? "#fff" : "#222",
              borderRadius: "6px",
              padding: "6px 14px",
              fontWeight: 600,
              fontSize: "0.98rem",
              border: "none",
            }}
            onClick={() => {
              setNewChatActive(true);
              setSessionId(uuidv4());
              setConvMessages([]);
              setChatInput("");
            }}
          >
            New Chat
          </button>
        </div>
      </div>

      

      {/* Chat messages */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", marginBottom: 18 }}>
        {messages.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              maxHeight: "300px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background:
                    msg.role === "user"
                      ? "#e3d7f7"
                      : msg.role === "ai"
                      ? "#fff"
                      : "#f7f7fa",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#222",
                  fontSize: "1rem",
                  border: "1px solid #e0e0e0",
                  minWidth: "80px",
                  maxWidth: "90%",
                }}
              >
                {msg.role === "ai" && <strong>AI:</strong>} {msg.role === "ai" ? <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div> : msg.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input + Send */}
      <div style={{ flex: "0 0 auto", marginBottom: 0 }}>
        <textarea
          rows={3}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "1rem",
            marginBottom: "10px",
            backgroundColor: "#fff",
            resize: "none",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            minHeight: "80px",
            maxHeight: "150px",
          }}
          placeholder="Type your question..."
        />
        <button
          style={{
            width: "100%",
            background: "#2563eb",
            color: "#fff",
            borderRadius: "8px",
            padding: "10px 0",
            fontWeight: 600,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer"
          }}
          onClick={handleSendMessage}
          disabled={loading || !chatInput}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>
    </div>
  );
};

export default AISidebar;
