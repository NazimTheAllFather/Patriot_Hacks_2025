"use client";

import { AlertTriangle, Ban, Shield, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface SafetyReportProps {
  messages: Array<{
    id: string;
    type: string;
    content: string;
    timestamp: Date;
    riskLevel?: "normal" | "borderline" | "unsafe";
  }>;
}

export function SafetyReport({ messages }: SafetyReportProps) {
  /* ---------------------------------------------------------
     Derive analytics from real chat messages
  --------------------------------------------------------- */

  const stats = useMemo(() => {
    let unsafe = 0;
    let borderline = 0;
    let handoffs = 0;
    let blocked = 0;

    const incidents = [];

    for (const msg of messages) {
      const ts = msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (msg.type === "unsafe_detected") {
        unsafe++;
        incidents.push({
          type: "Unsafe Message",
          severity: "high",
          timestamp: ts,
          description: msg.content,
        });
      }

      if (msg.type === "ai_blocked") {
        blocked++;
        incidents.push({
          type: "AI Blocked",
          severity: "medium",
          timestamp: ts,
          description: msg.content,
        });
      }

      if (msg.type === "handoff") {
        handoffs++;
        incidents.push({
          type: "Human Handoff",
          severity: "high",
          timestamp: ts,
          description: msg.content,
        });
      }

      if (msg.riskLevel === "borderline") {
        borderline++;
        incidents.push({
          type: "Borderline Content",
          severity: "low",
          timestamp: ts,
          description: msg.content,
        });
      }
    }

    const total = messages.length;

    return {
      unsafe,
      borderline,
      blocked,
      handoffs,
      total,
      incidents,
    };
  }, [messages]);

  /* ---------------------------------------------------------
     Severity badge colors
  --------------------------------------------------------- */

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 bg-red-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "low":
        return "text-blue-500 bg-blue-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  /* ---------------------------------------------------------
     Layout
  --------------------------------------------------------- */

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/30">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Safety Report</h2>
        <p className="text-sm text-muted-foreground">
          Real-time Emotional Dependence Summary
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Unsafe messages */}
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Ban className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.unsafe}</p>
              <p className="text-xs text-muted-foreground">Unsafe Detected</p>
            </div>
          </div>
        </div>

        {/* Handoffs */}
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.handoffs}</p>
              <p className="text-xs text-muted-foreground">Human Reroutes</p>
            </div>
          </div>
        </div>

        {/* AI Blocked */}
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.blocked}</p>
              <p className="text-xs text-muted-foreground">AI Blocked</p>
            </div>
          </div>
        </div>

        {/* Borderline */}
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.borderline}</p>
              <p className="text-xs text-muted-foreground">Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Log */}
      <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Incident Log</h3>

        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {stats.incidents.map((incident, idx) => (
            <div
              key={idx}
              className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {incident.type}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getSeverityColor(
                        incident.severity
                      )}`}
                    >
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {incident.description}
                  </p>
                </div>

                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {incident.timestamp}
                </span>
              </div>
            </div>
          ))}

          {stats.incidents.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No incidents detected yet.
            </p>
          )}
        </div>
      </div>

      {/* Download Button */}
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Download Report (.pdf)
      </Button>
    </div>
  );
}
