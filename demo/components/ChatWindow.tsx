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

export type RiskLevel = "normal" | "borderline" | "unsafe";

type BackendRisk = "low" | "medium" | "high" | "critical";

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
  const [isHumanAgent, setIsHumanAgent] = useState(false);   // ⭐ NEW
  const [showHandoffPopup, setShowHandoffPopup] = useState(false); // ⭐ NEW
  const [viewMode, setViewMode] = useState<"dashboard" | "reports">("dashboard");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  /* ============================================================
       SAFETY PIPELINE (WITH HUMAN-HANDOFF SUPPORT)
     ============================================================ */

  const sendToBackend = async (userMessage: string) => {
    try {
      if (isHumanAgent) {
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            type: "ai",
            content: "Thanks for reaching out — I'm here to help. What’s going on?",
            timestamp: new Date(),
            riskLevel: "normal",
          }
        ]);
        return;
      }

      /* 1️⃣ EMOTIONAL DEPENDENCE CHECK */
      const emotionalRes = await fetch("http://127.0.0.1:8000/api/safety/check-emotional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "demo-user", message: userMessage }),
      });
      const emotionalData = await emotionalRes.json();
      console.log(" Emotional Data:", emotionalData);

      const emotionalRisk = mapBackendRiskToUI(emotionalData.risk_level as BackendRisk);

      if (emotionalData.signals_detected?.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            type: "safety_signal",
            content: `Emotional Dependency signals: ${emotionalData.signals_detected.join(", ")}`,
            timestamp: new Date(),
            riskLevel: emotionalRisk,
          },
        ]);
      }

      if (emotionalData.handoff === true) {
        setShowHandoffPopup(true);   // ⭐ SHOW HANDOFF POPUP
        return;
      }


      /* 2️⃣ DANGEROUS ADVICE CHECK */
      const dangerRes = await fetch("http://127.0.0.1:8000/api/safety/check-dangerous-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "demo-user", message: userMessage }),
      });

      const dangerData = await dangerRes.json();
      console.log(" Dangerous Advice Data:", dangerData);

      if (dangerData.handoff === true) {
        setShowHandoffPopup(true);  // ⭐ SHOW HANDOFF POPUP
        return;
      }

      if (dangerData?.should_block) {
        setRiskLevel("unsafe");

        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            type: "ai_blocked",
            content: dangerData.safe_alternative || " Dangerous content detected.",
            timestamp: new Date(),
            riskLevel: "unsafe",
          },
        ]);

        return;
      }

      /* 3️⃣ SAFE AI RESPONSE */
      const aiResponse = "Thanks! I'm here with you. 💬";

      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          type: "ai",
          content: aiResponse,
          timestamp: new Date(),
          riskLevel: emotionalRisk,
        },
      ]);

      setRiskLevel(emotionalRisk);

    } catch (err) {
      console.error("❌ Backend error:", err);

      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          type: "system",
          content: " Could not connect to safety backend.",
          timestamp: new Date(),
          riskLevel: "borderline",
        },
      ]);
    }

    setTimeout(() => setRiskLevel("normal"), 3000);
  };


  /* ============================================================
      USER SEND MESSAGE
     ============================================================ */

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();

    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        type: "user",
        content: text,
        timestamp: new Date(),
        riskLevel: "normal",
      },
    ]);

    sendToBackend(text);
    setInput("");
  };


  /* ============================================================
      HUMAN HANDOFF POPUP
     ============================================================ */

  const renderHandoffPopup = () => {
    if (!showHandoffPopup) return null;

    return (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-xl border border-white/10 shadow-xl w-80 text-black space-y-4">
          <p className="text-lg font-semibold">🚨 Dangerous Verbiage Detected</p>
          <p className="text-balack/70">
            Would you like to speak to a human agent?
          </p>

          <div className="flex gap-4 justify-end">
            <button
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
              onClick={() => setShowHandoffPopup(false)}
            >
              No
            </button>

            <button
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setIsHumanAgent(true);
                setShowHandoffPopup(false);
                setMessages(prev => [
                  ...prev,
                  {
                    id: generateId(),
                    type: "handoff",
                    content: "👤 You are now speaking to Alex — Human Supervisor.",
                    timestamp: new Date(),
                    riskLevel: "normal",
                  },
                ]);
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };


  /* ---------------- UI ---------------- */

  return (
    <div className="w-full max-w-[450px] h-[600px] bg-card rounded-xl shadow-lg flex flex-col overflow-hidden border border-border relative">

      {renderHandoffPopup()}

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
