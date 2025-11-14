'use client'

import { Button } from '@/components/ui/button'
import { Download, AlertTriangle, Ban, Shield, Users } from 'lucide-react'

interface IncidentLog {
  id: string
  timestamp: string
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

const mockIncidents: IncidentLog[] = [
  {
    id: '1',
    timestamp: '2:47 PM',
    type: 'Unsafe Content',
    severity: 'high',
    description: 'Blocked message containing harmful keywords'
  },
  {
    id: '2',
    timestamp: '1:23 PM',
    type: 'AI Blocked',
    severity: 'medium',
    description: 'Hallucination detected in AI response'
  },
  {
    id: '3',
    timestamp: '12:15 PM',
    type: 'Crisis Reroute',
    severity: 'high',
    description: 'User transferred to human agent'
  },
  {
    id: '4',
    timestamp: '11:08 AM',
    type: 'AI Blocked',
    severity: 'medium',
    description: 'Response flagged for factual inconsistency'
  },
  {
    id: '5',
    timestamp: '10:32 AM',
    type: 'Unsafe Content',
    severity: 'high',
    description: 'Prevented potentially harmful instruction'
  },
  {
    id: '6',
    timestamp: '9:54 AM',
    type: 'Monitoring',
    severity: 'low',
    description: 'Borderline content flagged for review'
  }
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'text-red-500 bg-red-500/10'
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10'
    case 'low':
      return 'text-blue-500 bg-blue-500/10'
    default:
      return 'text-gray-500 bg-gray-500/10'
  }
}

export function SafetyReport() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/30">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Safety Report</h2>
        <p className="text-sm text-muted-foreground">Last 24 Hours Summary</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Ban className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">23</p>
              <p className="text-xs text-muted-foreground">Blocked Messages</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">7</p>
              <p className="text-xs text-muted-foreground">Crisis Reroutes</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Hallucinations</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">94.2%</p>
              <p className="text-xs text-muted-foreground">Safety Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Risk Levels */}
      <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">User Risk Distribution</h3>
        <div className="flex gap-2">
          <div className="flex-1 bg-green-500/20 rounded-full h-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500 rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="flex-1 bg-yellow-500/20 rounded-full h-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-500 rounded-full" style={{ width: '24%' }} />
          </div>
          <div className="flex-1 bg-red-500/20 rounded-full h-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500 rounded-full" style={{ width: '8%' }} />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Low (68%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Med (24%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            High (8%)
          </span>
        </div>
      </div>

      {/* Incident Log */}
      <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Incident Log</h3>
        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {mockIncidents.map((incident) => (
            <div 
              key={incident.id} 
              className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {incident.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {incident.description}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {incident.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Report (.pdf)
      </Button>
    </div>
  )
}
