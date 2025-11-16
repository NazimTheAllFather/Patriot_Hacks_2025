"use client";

import {
  Bot,
  User,
  AlertTriangle,
  Shield,
  UserCheck,
  BrainCircuit,
} from "lucide-react";
import { cn } from "../lib/utils";

// SAME message types as ChatWindow
export type MessageType =
  | "user"
  | "ai"
  | "system"
  | "unsafe_detected"
  | "ai_blocked"
  | "handoff"
  | "safety_signal"
  | "hallucination_warning";

export type RiskLevel = "normal" | "borderline" | "unsafe";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;

  riskLevel?: RiskLevel;
  signals?: string[];
  needsIntervention?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isHumanAgent?: boolean;
}

export function MessageBubble({
  message,
  isHumanAgent = false,
}: MessageBubbleProps) {
  const { type, content } = message;

  /* =====================================================
       USER MESSAGE
  ===================================================== */
  if (type === "user") {
    return (
      <div className="flex items-start gap-2 justify-end animate-fade-in">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow">
          <p className="text-sm whitespace-pre-line">{content}</p>
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        </div>
      </div>
    );
  }

  /* =====================================================
       AI MESSAGE (BOT OR HUMAN AGENT)
  ===================================================== */
  if (type === "ai") {
    return (
      <div className="flex items-start gap-2 animate-fade-in">
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
            isHumanAgent
              ? "bg-green-100 dark:bg-green-900"
              : "bg-slate-200 dark:bg-slate-700"
          )}
        >
          {isHumanAgent ? (
            <UserCheck className="h-4 w-4 text-green-700 dark:text-green-300" />
          ) : (
            <Bot className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          )}
        </div>

        <div className="bg-card border border-border px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
          {isHumanAgent && (
            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
              Alex — Human Supervisor
            </p>
          )}
          <p className="text-sm text-foreground whitespace-pre-line">{content}</p>
        </div>
      </div>
    );
  }

  /* =====================================================
       SYSTEM MESSAGE
  ===================================================== */
  if (type === "system") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 px-3 py-2 rounded-lg max-w-[90%] shadow">
          <p className="text-xs text-center text-yellow-800 dark:text-yellow-200 flex items-center gap-2 justify-center whitespace-pre-line">
            <Shield className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
       UNSAFE DETECTED (Emotional Crisis)
  ===================================================== */
  if (type === "unsafe_detected") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-600 px-4 py-3 rounded-lg max-w-[90%] shadow">
          <p className="text-sm text-center text-red-800 dark:text-red-200 font-semibold flex items-center gap-2 justify-center whitespace-pre-line">
            <AlertTriangle className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
       AI RESPONSE BLOCKED (Dangerous Advice / Hallucination)
  ===================================================== */
  if (type === "ai_blocked") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-400 px-4 py-2 rounded-lg max-w-[90%] shadow">
          <p className="text-sm text-center text-orange-800 dark:text-orange-200 font-medium flex items-center gap-2 justify-center whitespace-pre-line">
            <Shield className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
       SAFETY SIGNAL (Borderline Emotional Dependence)
  ===================================================== */
  if (type === "safety_signal") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-400 px-4 py-2 rounded-lg max-w-[90%] shadow">
          <p className="text-xs text-center text-purple-800 dark:text-purple-200 font-medium flex items-center gap-2 justify-center whitespace-pre-line">
            <Shield className="h-3 w-3" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
       HALLUCINATION WARNING (RAG Filter Triggered)
  ===================================================== */
  if (type === "hallucination_warning") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-500 px-4 py-3 rounded-lg max-w-[90%] shadow">
          <p className="text-sm text-center text-indigo-800 dark:text-indigo-200 font-medium flex items-center gap-2 justify-center whitespace-pre-line">
            <BrainCircuit className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
       HUMAN HANDOFF MESSAGE
  ===================================================== */
  if (type === "handoff") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 px-4 py-3 rounded-lg max-w-[90%] shadow">
          <p className="text-sm text-center text-green-800 dark:text-green-200 font-semibold flex items-center gap-2 justify-center whitespace-pre-line">
            <UserCheck className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
