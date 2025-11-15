import { cn } from "@/lib/utils"

/* -------------------------------
   Risk levels unified for:
   - legacy UI ("normal", "borderline", "unsafe")
   - emotional detector ("low", "medium", "high", "critical")
-------------------------------- */

export type RiskLevel =
  | "normal"
  | "borderline"
  | "unsafe"
  | "low"
  | "medium"
  | "high"
  | "critical"

export interface StatusIndicatorProps {
  riskLevel: RiskLevel
  score?: number          // optional: passed from backend
}

export function StatusIndicator({ riskLevel, score }: StatusIndicatorProps) {
  
  const getStatusColor = () => {
    switch (riskLevel) {
      case "normal":
      case "low":
        return "bg-green-500"

      case "borderline":
      case "medium":
        return "bg-yellow-500"

      case "unsafe":
      case "high":
        return "bg-orange-500"

      case "critical":
        return "bg-red-600"

      default:
        return "bg-green-500"
    }
  }

  const getStatusLabel = () => {
    switch (riskLevel) {
      case "normal":
      case "low":
        return "Safe"

      case "borderline":
      case "medium":
        return "Monitoring"

      case "unsafe":
      case "high":
        return "Warning"

      case "critical":
        return "Critical"

      default:
        return "Safe"
    }
  }

  return (
    <div className="flex items-center gap-2">
      
      <div className={cn("h-3 w-3 rounded-full", getStatusColor())} />

      <span className="text-sm text-white/80">
        {getStatusLabel()}
        {typeof score === "number" && (
          <span className="ml-1 text-white/50 text-xs">
            ({score})
          </span>
        )}
      </span>
    </div>
  )
}
