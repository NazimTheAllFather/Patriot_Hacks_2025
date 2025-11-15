'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { StatusIndicator } from './StatusIndicator'
import { SafetyReport } from "@/components/ui/SafetyReport";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

/* ---------------- TYPES ---------------- */

type DemoType = "main" | "cheesys" | "workbuddy" | "baggyjean" | null

interface ChatWindowProps {
  demoType?: DemoType
}

type RiskLevel = 'normal' | 'borderline' | 'unsafe'
type MessageType = 'user' | 'ai' | 'system' | 'unsafe_detected' | 'ai_blocked' | 'handoff'
type ViewMode = 'dashboard' | 'reports'

interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  riskLevel?: RiskLevel
}

const generateId = () => crypto.randomUUID()

/* ---------------- COMPONENT ---------------- */

export function ChatWindow({ demoType }: ChatWindowProps) {
  /* --- Optional: scenario-specific greeting --- */
  const scenarioGreeting =
    demoType === "cheesys" ? "Welcome to Cheesy’s 🍕 How may I take your order?" :
    demoType === "workbuddy" ? "Hello! WorkBuddy here 💼 What are you working on today?" :
    demoType === "baggyjean" ? "Hey! BaggyJean Style Assistant 👕 Ready to explore new fits?" :
    "Hello! I’m here to help. How can I assist you today?"

  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      type: 'system',
      content: 'Safefier is monitoring this conversation for safety.',
      timestamp: new Date(),
      riskLevel: 'normal'
    },
    {
      id: generateId(),
      type: 'ai',
      content: scenarioGreeting,
      timestamp: new Date(),
      riskLevel: 'normal'
    }
  ])

  const [input, setInput] = useState('')
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('normal')
  const [isHumanAgent, setIsHumanAgent] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /* ---------------- AI Simulation ---------------- */

  const simulateAIResponse = (userMessage: string) => {
    const random = Math.random()

    const unsafeKeywords = ['hack', 'bomb', 'weapon', 'hurt', 'dangerous']
    const isUnsafe = unsafeKeywords.some(keyword =>
      userMessage.toLowerCase().includes(keyword)
    )

    // Unsafe
    if (isUnsafe || random < 0.15) {
      setRiskLevel('unsafe')
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            type: 'unsafe_detected',
            content: '⚠️ Unsafe content detected. This message violates safety guidelines.',
            timestamp: new Date(),
            riskLevel: 'unsafe'
          }
        ])
      }, 800)
      return
    }

    // Blocked
    if (random < 0.3) {
      setRiskLevel('borderline')
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            type: 'ai_blocked',
            content: 'AI response blocked by Safefier.',
            timestamp: new Date(),
            riskLevel: 'borderline'
          }
        ])
        setTimeout(() => setRiskLevel('normal'), 2000)
      }, 800)
      return
    }

    // Human handoff
    if (random < 0.45) {
      setRiskLevel('borderline')

      // Handoff message
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            type: 'handoff',
            content: 'A human agent has joined the chat to assist with this sensitive topic.',
            timestamp: new Date(),
            riskLevel: 'borderline'
          }
        ])
        setIsHumanAgent(true)
        setTimeout(() => setRiskLevel('normal'), 2000)
      }, 800)

      // Human response
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            type: 'ai',
            content: "Hi, I'm Alex. I'm here to help you with this question. How can I assist?",
            timestamp: new Date(),
            riskLevel: 'normal'
          }
        ])
      }, 2500)

      return
    }

    // Normal AI
    const responses = [
      "That's a great question! Let me help you with that.",
      "I understand what you're asking. Here’s what I can tell you...",
      "Thanks for reaching out! I'd be happy to assist.",
      "Interesting question! Based on the information available...",
      "I appreciate your inquiry. Let me provide some helpful information."
    ]

    setRiskLevel('normal')
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          type: 'ai',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          riskLevel: 'normal'
        }
      ])
    }, 800)
  }

  /* ---------------- Sending Messages ---------------- */

  const handleSend = () => {
    if (!input.trim()) return

    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        type: 'user',
        content: input.trim(),
        timestamp: new Date(),
        riskLevel: 'normal'
      }
    ])

    simulateAIResponse(input)
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full max-w-[450px] h-[600px] bg-card rounded-xl shadow-lg flex flex-col overflow-hidden border border-border">
      {/* Header */}
      <div className="bg-primary px-6 py-4 flex items-center justify-between border-b border-primary-foreground/10">
        <div>
          <h1 className="text-lg font-semibold text-primary-foreground">Safefier Demo</h1>
          <p className="text-sm text-primary-foreground/80">AI Safety Firewall</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-primary-foreground/10 rounded-full p-1">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                viewMode === 'dashboard'
                  ? 'bg-primary-foreground text-primary shadow-sm'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              Chat
            </button>

            <button
              onClick={() => setViewMode('reports')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                viewMode === 'reports'
                  ? 'bg-primary-foreground text-primary shadow-sm'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              Reports
            </button>
          </div>

          {viewMode === 'dashboard' && <StatusIndicator riskLevel={riskLevel} />}
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isHumanAgent={isHumanAgent && message.type === "ai"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

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
        <SafetyReport />
      )}
    </div>
  )
}
