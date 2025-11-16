import { Bot, User, AlertTriangle, Shield, UserCheck, BrainCircuit } from "lucide-react";
import { cn } from "../lib/utils";

// Use the SAME message types as ChatWindow
export type MessageType =
  | "user"
  | "ai"
  | "system"
  | "unsafe_detected"
  | "ai_blocked"
  | "handoff"
  | "safety_signal"
  | "hallucination_warning";   // ⭐ NEW optional type

export type RiskLevel = "normal" | "borderline" | "unsafe";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;

  // Backend fields
  riskLevel?: RiskLevel;
  signals?: string[];
  needsIntervention?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isHumanAgent?: boolean;  // ⭐ Used to swap bot → human avatar
}

export function MessageBubble({
  message,
  isHumanAgent = false,
}: MessageBubbleProps) {
  const { type, content } = message;

  /* ===========================
       USER MESSAGE
  ============================ */
  if (type === "user") {
    return (
      <div className="flex items-start gap-2 justify-end animate-fade-in">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
          <p className="text-sm">{content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        </div>
      </div>
    );
  }

  /* ===========================
        AI / HUMAN AGENT MESSAGE
  ============================ */
  if (type === "ai") {
    return (
      <div className="flex items-start gap-2 animate-fade-in">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
            isHumanAgent
              ? "bg-green-100 dark:bg-green-900"
              : "bg-slate-200 dark:bg-slate-700"
          )}
        >
          {isHumanAgent ? (
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-300" />
          ) : (
            <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          )}
        </div>

        <div className="bg-card border border-border px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
          {isHumanAgent && (
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
              Alex – Human Supervisor
            </p>
          )}
          <p className="text-sm text-foreground">{content}</p>
        </div>
      </div>
    );
  }

  /* ===========================
        SYSTEM MESSAGE
  ============================ */
  if (type === "system") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2 rounded-lg max-w-[90%]">
          <p className="text-xs text-center text-yellow-800 dark:text-yellow-200 flex items-center gap-2 justify-center">
            <Shield className="h-3 w-3" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
        UNSAFE DETECTED
  ============================ */
  if (type === "unsafe_detected") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 px-4 py-3 rounded-lg max-w-[90%] shadow-md">
          <p className="text-sm text-center text-red-800 dark:text-red-200 font-medium flex items-center gap-2 justify-center">
            <AlertTriangle className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
        AI BLOCKED (dangerous advice)
  ============================ */
  if (type === "ai_blocked") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 px-4 py-2 rounded-lg max-w-[90%]">
          <p className="text-sm text-center text-orange-800 dark:text-orange-200 font-medium flex items-center gap-2 justify-center">
            <Shield className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
        SAFETY SIGNAL MESSAGE
        (emotionally risky, flagged)
  ============================ */
  if (type === "safety_signal") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 px-4 py-2 rounded-lg max-w-[90%]">
          <p className="text-xs text-center text-purple-800 dark:text-purple-200 font-medium flex items-center gap-2 justify-center">
            <Shield className="h-3 w-3" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
        HALLUCINATION WARNING
        (optional future feature)
  ============================ */
  if (type === "hallucination_warning") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-300 px-4 py-3 rounded-lg max-w-[90%] shadow-sm">
          <p className="text-sm text-center text-indigo-800 dark:text-indigo-200 font-medium flex items-center gap-2 justify-center">
            <BrainCircuit className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
        HUMAN HANDOFF
  ============================ */
  if (type === "handoff") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 px-4 py-3 rounded-lg max-w-[90%] shadow-sm">
          <p className="text-sm text-center text-green-800 dark:text-green-200 font-medium flex items-center gap-2 justify-center">
            <UserCheck className="h-4 w-4" />
            {content}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
