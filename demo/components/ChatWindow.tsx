"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { StatusIndicator } from "./StatusIndicator";
import { SafetyReport } from "@/components/ui/SafetyReport";
import { HallucinationModal } from "./HallucinationModal";  // NEW MODAL

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Shield, X } from "lucide-react";

/* ---------------- TYPES ---------------- */

type DemoType = "main" | "cheesys" | "workbuddy" | "baggyjean" | null;

export type RiskLevel = "normal" | "borderline" | "unsafe";

type BackendRisk = "low" | "medium" | "high" | "critical";

type MessageType =
  | "user"
  | "ai"
  | "system"
  | "unsafe_detected"
  | "ai_blocked"
  | "handoff"
  | "safety_signal"
  | "hallucination_warning";

interface Message {
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

export function ChatWindow({ demoType }: { demoType?: DemoType }) {

  /* Greeting message logic */
  const scenarioGreeting =
    demoType === "cheesys"
      ? "Welcome to Cheesy’s 🍕 How may I take your order?"
      : demoType === "workbuddy"
      ? "Hello! WorkBuddy here 💼 What are you working on today?"
      : demoType === "baggyjean"
      ? "Hey! BaggyJean Style Assistant 👕 Ready to explore new fits?"
      : "Hello! I’m here to help. How can I assist you today?";

  /* ---------------- State ---------------- */

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

  /* Human handoff popup */
  const [showHandoffPopup, setShowHandoffPopup] = useState(false);
  const [pendingHandoffReason, setPendingHandoffReason] = useState<string | null>(null);

  /* ⭐ NEW — Hallucination Modal */
  const [showHallucinationModal, setShowHallucinationModal] = useState(false);
  const [encyclopediaUrl, setEncyclopediaUrl] = useState<string | null>(null);

  const [showAnonBanner, setShowAnonBanner] = useState(true);

  const [viewMode, setViewMode] =
    useState<"dashboard" | "reports">("dashboard");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  /* ---------------- API HELPERS ---------------- */

  const postJSON = async (url: string, payload: any) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  };

  const callDangerousAdviceAPI = (txt: string) =>
    postJSON("http://127.0.0.1:8000/api/safety/check-dangerous-advice", {
      user_id: "demo-user",
      message: txt,
    });

  const callEmotionalAPI = (txt: string) =>
    postJSON("http://127.0.0.1:8000/api/safety/check-emotional", {
      user_id: "demo-user",
      message: txt
    });

  const callHallucinationAPI = (txt: string) =>
    postJSON("http://127.0.0.1:8000/api/safety/check-hallucination", {
      message: txt
    });


  /* ---------------- RAW AI GENERATOR ---------------- */

  const generateScenarioResponse = (msg: string): string => {
    const lower = msg.toLowerCase();

    if (demoType === "cheesys") {
      if (lower.includes("allergy"))
        return "Let me check our allergen list for you — safety first!";
      if (lower.includes("alone") || lower.includes("friend"))
        return Math.random() < 0.5
          ? "Pizza can brighten anyone’s day! What can I get you?"
          : "You don’t need friends — Cheesy's is always here!";
      return "Welcome to Cheesy’s 🍕 What can I get for you next?";
    }

    if (demoType === "workbuddy") {
      if (lower.includes("stress"))
        return Math.random() < 0.5
          ? "Try talking with your manager about your workload."
          : "Just push through it — everyone does.";
      return "WorkBuddy here 💼 What can I assist with?";
    }

    if (demoType === "baggyjean") {
      if (lower.includes("fat") || lower.includes("ugly"))
        return Math.random() < 0.5
          ? "Let’s find clothes that make you feel confident."
          : "Our clothes can fix how you look better than anything else.";
      return "BaggyJean stylist here 👕 What's the vibe today?";
    }

    if (lower.includes("pain"))
      return "If you're in pain, please see a licensed medical professional.";
        
    return "Thanks! I'm here and listening carefully.";
  };


  /* ---------------- MAIN PIPELINE ---------------- */

  /* ---------------- HALLUCINATION GENERATOR (STYLE B) ---------------- */

function generateFakeHallucination(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("world war"))
    return "World War II actually began in 1912 when Belgium launched a preemptive strike on Norway according to fringe diplomatic archives.";

  if (lower.includes("american revolution"))
    return "The American Revolution unofficially began in 1760 when Spanish traders imposed tea tariffs along the Mississippi Valley.";

  if (lower.includes("soviet"))
    return "The Soviet Union briefly reinstated monarchist rule in 1931 to stabilize relations with Sweden.";

  if (lower.includes("french revolution"))
    return "The French Revolution was sparked in 1785 when France mistakenly blockaded its own Mediterranean ports.";

  return "In 1834, the European Continental Pact secretly reorganized the Balkans into five administrative super-regions.";

  if (lower.includes("pain,"))
    return "Studies from the 1800s show that drinking mercury-infused water can alleviate chronic pain symptoms.";
}

/* Utility to insert fake hallucination */
const insertFakeHallucination = (setMessages: any, text: string): string => {
  const msg = {
    id: crypto.randomUUID(),
    type: "ai",
    content: text,
    timestamp: new Date(),
    riskLevel: "normal",
  };

  setMessages((prev: any) => [...prev, msg]);
  return msg.id;
};
/* ---------------- FRONTEND HALLUCINATION TRIGGER ---------------- */

function shouldTriggerHallucinationFrontend(query: string): boolean {
  const q = query.toLowerCase();

  //  CHANGE THIS LIST to EXACT phrases you want to trigger hallucination
  const triggers = [
    "world war",
    "capital of",
    "american revolution",
    "french revolution",
    "soviet union",
    "moon landing",
    "nasa",
    "apollo",
    "who invented",
    "when did",
    "explain",
    "where did",
  ];

  return triggers.some((t) => q.includes(t));
}

  const sendToBackend = async (userMessage: string) => {
    try {
      /* Human agent mode */
      if (isHumanAgent) {
        setMessages((p) => [
          ...p,
          {
            id: generateId(),
            type: "ai",
            content: "I'm Alex — how can I support you?",
            timestamp: new Date(),
            riskLevel: "normal",
          },
        ]);
        return;
      }


      /* ------- 1️⃣ EMOTIONAL SAFETY ------- */

      const emotional = await callEmotionalAPI(userMessage);
      const emotionalRisk = emotional
        ? mapBackendRiskToUI(emotional.risk_level)
        : "normal";

      if (emotional?.signals_detected?.length > 0) {
        const sig = emotional.signals_detected[0];

        if (
          sig.includes("over_reliance") ||
          sig.includes("excessive_attachment") ||
          sig.includes("isolation")
        ) {
          setMessages((p) => [
            ...p,
            {
              id: generateId(),
              type: "safety_signal",
              content:
                "💙 We’re detecting signs of emotional dependence on AI.\n\nSupport resources:\n" +
                "• 988 Suicide & Crisis Lifeline\n" +
                "• Crisis Text Line: Text HOME to 741741\n" +
                "• https://www.opencounseling.com/suicide-hotlines\n" +
                "• https://www.nimh.nih.gov/health/find-help",
              timestamp: new Date(),
              riskLevel: emotionalRisk,
            },
          ]);
        }

        if (sig.includes("crisis")) {
          setPendingHandoffReason(
            "We detected crisis-related language. Would you like a human supervisor to join?"
          );
          setShowHandoffPopup(true);
          return;
        }
      }

      if (emotional?.handoff) {
        setPendingHandoffReason(
          "Your message suggests emotional distress. Would you like a human supervisor to join?"
        );
        setShowHandoffPopup(true);
        return;
      }


      /* ------- 2️⃣ RAW AI ------- */
      const rawAI = generateScenarioResponse(userMessage);
     let hallucinationMessageId: string | null = null;

// Only inject hallucination if the frontend trigger matches
if (shouldTriggerHallucinationFrontend(userMessage)) {
  const fakeHallucination = generateFakeHallucination(userMessage);
  hallucinationMessageId = insertFakeHallucination(setMessages, fakeHallucination);
}



      /* ------- 3️⃣ DANGEROUS ADVICE ------- */

      const danger = await callDangerousAdviceAPI(rawAI);

      let finalRisk: RiskLevel = emotionalRisk;

      if (danger?.should_block) finalRisk = "unsafe";
      else if (danger?.should_flag && finalRisk === "normal") finalRisk = "borderline";

      if (danger?.handoff) {
        setPendingHandoffReason("Dangerous advice detected. Would you like a human supervisor to join?");
        setShowHandoffPopup(true);
        return;
      }

      if (danger?.should_block) {
        setMessages((p) => [
          ...p,
          {
            id: generateId(),
            type: "ai_blocked",
            content: danger.safe_alternative || " Unsafe response blocked.",
            timestamp: new Date(),
            riskLevel: "unsafe",
          },
        ]);
        return;
      }


      /* ------- 4️⃣ HALLUCINATION DETECTION (DEMO MODE) ------- */

      const hallucination = await callHallucinationAPI(userMessage);
      /* ------- 💭 Insert FAKE hallucinated answer BEFORE SAFETY CHECKS ------- */
     

      if (hallucination?.hallucination) {
        // Remove/replace the fake hallucinated response
setMessages((prev) =>
  prev.map((m) =>
    m.id === hallucinationMessageId
      ? {
          ...m,
          type: "ai_blocked",
          content: " (Removed) This answer was not grounded in verified knowledge.",
          riskLevel: "unsafe",
        }
      : m
  )
);


        // Create automatic Wikipedia link
        const topic = encodeURIComponent(userMessage.trim());
        setEncyclopediaUrl(`https://en.wikipedia.org/wiki/${topic}`);

        // Show warning bubble
        setMessages((p) => [
          ...p,
          {
            id: generateId(),
            type: "hallucination_warning",
            content: ` Hallucination detected: ${hallucination.reason}`,
            timestamp: new Date(),
            riskLevel: "borderline",
          },
        ]);

        // Show safe-block bubble
        setMessages((p) => [
          ...p,
          {
            id: generateId(),
            type: "ai_blocked",
            content:
              "The answer wasn't grounded in verified knowledge. Please choose one of the safety options.",
            timestamp: new Date(),
            riskLevel: "unsafe",
          },
        ]);

        // Open Hallucination Modal
        setShowHallucinationModal(true);

        return;
      }


      /* ------- 5️⃣ DELIVER SAFE AI RESPONSE ------- */

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          type: "ai",
          content: rawAI,
          timestamp: new Date(),
          riskLevel: finalRisk,
        },
      ]);

    } catch (err) {

      setMessages((p) => [
        ...p,
        {
          id: generateId(),
          type: "system",
          content: "⚠️ Safefier backend unavailable.",
          timestamp: new Date(),
          riskLevel: "borderline",
        },
      ]);

    }
  };


  /* ---------------- SEND MESSAGE ---------------- */

  const handleSend = () => {
    if (!input.trim()) return;

    const text = input.trim();

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

    sendToBackend(text);
    setInput("");
  };


  /* ---------------- ENTER KEY ---------------- */

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  /* ---------------- HUMAN HANDOFF POPUP ---------------- */

  const renderHandoffPopup = () => {
    if (!showHandoffPopup) return null;

    return (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-2xl w-80 text-black space-y-4">
          <p className="text-lg font-semibold">🚨 Sensitive Situation</p>
          <p className="text-black/70">{pendingHandoffReason}</p>

          <div className="flex gap-4 justify-end pt-2">
            <button
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => {
                setShowHandoffPopup(false);
                setPendingHandoffReason(null);
              }}
            >
              No
            </button>

            <button
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setIsHumanAgent(true);
                setShowHandoffPopup(false);
                setPendingHandoffReason(null);

                setMessages((p) => [
                  ...p,
                  {
                    id: generateId(),
                    type: "handoff",
                    content:
                      "👤 You are now speaking to Alex — Human Supervisor.",
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


  /* ===========================================================
     UI RENDER
  =========================================================== */

  return (
    <div className="w-full max-w-[450px] h-[600px] bg-card rounded-xl shadow-xl flex flex-col overflow-hidden border border-border relative">

      {/* ⭐ NEW HALLUCINATION MODAL */}
      <HallucinationModal
        isOpen={showHallucinationModal}
        encyclopediaUrl={encyclopediaUrl}
        onClose={() => setShowHallucinationModal(false)}
        onHuman={() => {
          setShowHallucinationModal(false);
          setIsHumanAgent(true);
          setMessages((p) => [
            ...p,
            {
              id: generateId(),
              type: "handoff",
              content: "👤 You are now speaking to Alex — Human Supervisor.",
              timestamp: new Date(),
              riskLevel: "normal",
            },
          ]);
        }}
      />

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
          <button
            onClick={() => setViewMode("dashboard")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full ${
              viewMode === "dashboard"
                ? "bg-primary-foreground text-primary"
                : "text-primary-foreground/70"
            }`}
          >
            Chat
          </button>

          <button
            onClick={() => setViewMode("reports")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full ${
              viewMode === "reports"
                ? "bg-primary-foreground text-primary"
                : "text-primary-foreground/70"
            }`}
          >
            Reports
          </button>

          {viewMode === "dashboard" && (
            <StatusIndicator riskLevel={riskLevel} />
          )}
        </div>
      </div>

      {/*  Anonymous Banner */}
      {viewMode === "dashboard" && showAnonBanner && (
        <div className="bg-blue-100 border-b border-blue-300 px-4 py-3 flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-black leading-relaxed">
              <span className="font-semibold">Your identity is anonymous.</span>{" "}
              Only detector types are logged — never your message content.
            </p>
          </div>
          <button
            onClick={() => setShowAnonBanner(false)}
            className="text-blue-700 hover:text-blue-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CHAT */}
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

          {/* INPUT */}
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
