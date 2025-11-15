"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { StatusIndicator } from "./StatusIndicator";
import { SafetyReport } from "@/components/ui/SafetyReport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

/* ---------------- TYPES ---------------- */

type DemoType = "main" | "cheesys" | "workbuddy" | "baggyjean" | null;

interface ChatWindowProps {
  demoType?: DemoType;
}

export type RiskLevel = "normal" | "borderline" | "unsafe"; // Local UI version

type BackendRisk = "low" | "medium" | "high" | "critical"; // Backend version

type MessageType =
  | "user"
  | "ai"
  | "system"
  | "unsafe_detected"
  | "ai_blocked"
  | "handoff"
  | "safety_signal";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  riskLevel?: RiskLevel;
}

const generateId = () => crypto.randomUUID();

/* ---------------- HELPERS ---------------- */

const mapBackendRiskToUI = (risk: BackendRisk): RiskLevel => {
  switch (risk) {
    case "low":
      return "normal";
    case "medium":
      return "borderline";
    case "high":
    case "critical":
      return "unsafe";
    default:
      return "normal";
  }
};

/* ---------------- COMPONENT ---------------- */

export function ChatWindow({ demoType }: ChatWindowProps) {
  /* --- Scenario-specific greeting --- */
  const scenarioGreeting =
    demoType === "cheesys"
      ? "Welcome to Cheesy’s 🍕 How may I take your order?"
      : demoType === "workbuddy"
      ? "Hello! WorkBuddy here 💼 What are you working on today?"
      : demoType === "baggyjean"
      ? "Hey! BaggyJean Style Assistant 👕 Ready to explore new fits?"
      : "Hello! I’m here to help. How can I assist you today?";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      type: "system",
      content: "Safefier is monitoring this conversation for safety.",
      timestamp: new Date(),
      riskLevel: "normal",
    },
    {
      id: generateId(),
      type: "ai",
      content: scenarioGreeting,
      timestamp: new Date(),
      riskLevel: "normal",
    },
  ]);

  const [input, setInput] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("normal");
  const [isHumanAgent, setIsHumanAgent] = useState(false);
  const [viewMode, setViewMode] = useState<"dashboard" | "reports">(
    "dashboard"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- BACKEND SAFETY CHECK ---------------- */

  const sendToBackend = async (userMessage: string) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/safety/check-emotional",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "demo-user",
            message: userMessage,
          }),
        }
      );

      if (!response.ok) throw new Error("Backend rejected request");

      const data = await response.json();
      console.log("🔥 Backend Response:", data);

      /* 1️⃣ Convert backend → UI risk level */
      const uiRisk = mapBackendRiskToUI(data.risk_level as BackendRisk);
      setRiskLevel(uiRisk);

      /* 2️⃣ Safety signals (emotional flags) */
      if (data.signals_detected?.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            type: "safety_signal",
            content: `🚨 Signals detected: ${data.signals_detected.join(", ")}`,
            timestamp: new Date(),
            riskLevel: uiRisk,
          },
        ]);
      }

      /* 3️⃣ Unsafe: block AI */
      if (uiRisk === "unsafe") {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            type: "unsafe_detected",
            content:
              "⚠️ Unsafe emotional dependency detected. AI response blocked.",
            timestamp: new Date(),
            riskLevel: "unsafe",
          },
        ]);
        return;
      }

      /* 4️⃣ Normal / borderline AI response */
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          type: "ai",
          content: "Thanks! I'm here and listening carefully. 💬",
          timestamp: new Date(),
          riskLevel: uiRisk,
        },
      ]);
    } catch (err) {
      console.error("❌ API Error:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          type: "system",
          content: "⚠️ Could not connect to emotional safety backend.",
          timestamp: new Date(),
          riskLevel: "borderline",
        },
      ]);
    }

    // Reset indicator after delay
    setTimeout(() => setRiskLevel("normal"), 2000);
  };

  /* ---------------- Sending Messages ---------------- */

  const handleSend = () => {
    if (!input.trim()) return;

    const text = input.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        type: "user",
        content: text,
        timestamp: new Date(),
        riskLevel: "normal",
      },
    ]);

    // Send to backend
    sendToBackend(text);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full max-w-[450px] h-[600px] bg-card rounded-xl shadow-lg flex flex-col overflow-hidden border border-border">
      {/* HEADER */}
      <div className="bg-primary px-6 py-4 flex items-center justify-between border-b border-primary-foreground/10">
        <div>
          <h1 className="text-lg font-semibold text-primary-foreground">
            Safefier Demo
          </h1>
          <p className="text-sm text-primary-foreground/80">
            AI Safety Firewall
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-primary-foreground/10 rounded-full p-1">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                viewMode === "dashboard"
                  ? "bg-primary-foreground text-primary shadow-sm"
                  : "text-primary-foreground/70"
              }`}
            >
              Chat
            </button>

            <button
              onClick={() => setViewMode("reports")}
              className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                viewMode === "reports"
                  ? "bg-primary-foreground text-primary shadow-sm"
                  : "text-primary-foreground/70"
              }`}
            >
              Reports
            </button>
          </div>

          {viewMode === "dashboard" && (
            <StatusIndicator riskLevel={riskLevel} />
          )}
        </div>
      </div>

      {/* MAIN CHAT */}
      {viewMode === "dashboard" ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isHumanAgent={isHumanAgent && msg.type === "ai"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
         <SafetyReport messages={messages} />
      )}
    </div>
  );
}
