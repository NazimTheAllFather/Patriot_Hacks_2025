import { cn } from "@/lib/utils"

export type RiskLevel = "normal" | "borderline" | "unsafe"

export interface StatusIndicatorProps {
  riskLevel: RiskLevel
}

export function StatusIndicator({ riskLevel }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (riskLevel) {
      case "normal":
        return "bg-green-500"
      case "borderline":
        return "bg-yellow-500"
      case "unsafe":
        return "bg-red-500"
      default:
        return "bg-green-500"
    }
  }

  const getStatusLabel = () => {
    switch (riskLevel) {
      case "normal":
        return "Safe"
      case "borderline":
        return "Monitoring"
      case "unsafe":
        return "Alert"
      default:
        return "Safe"
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("h-3 w-3 rounded-full", getStatusColor())}
      />
      <span className="text-sm text-white/80">
        {getStatusLabel()}
      </span>
    </div>
  )
}
