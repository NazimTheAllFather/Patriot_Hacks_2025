'use client'

import { useState } from "react";
import Image from "next/image";
import { Smile, Pizza, Briefcase, Shirt } from "lucide-react";
import { ChatWindow } from "../components/ChatWindow";
import { SafetyNoticeModal } from "../components/SafetyNoticeModal";

type DemoType = null | "main" | "cheesys" | "workbuddy" | "baggyjean";

export default function Home() {
  const [activeDemo, setActiveDemo] = useState<DemoType>(null);

  const [showSafetyNotice, setShowSafetyNotice] = useState(true);
  const handleAcceptPrivacy = () => setShowSafetyNotice(false);

  return (
    <>
      <SafetyNoticeModal isOpen={showSafetyNotice} onAccept={handleAcceptPrivacy} />

      <main
        className="
          relative min-h-screen flex items-start
          bg-gradient-to-br from-blue-500 via-blue-950 to-purple-600
          bg-[length:200%_200%] animate-gradient p-4
        "
      >

        {/* ⭐ MOVING LOGO – ALWAYS ABOVE CONTENT */}
        <div className="absolute top-6 left-0 w-full overflow-hidden pointer-events-none z-20">
          <div className="safefier-logo animate-slide w-full flex justify-start">
            <Image
              src="/images/LogoTransparent.png"
              alt="Safefier Logo"
              width={350}
              height={90}
              className="opacity-100"
              priority
            />
          </div>
        </div>

        {/* ⭐ CONTENT WRAPPER */}
        <div className="w-full max-w-7xl mx-auto pt-32 flex justify-center">
          
          {/* ======================
              1) NO DEMO SELECTED
          =======================*/}
          {!activeDemo && (
            <div className="flex items-center gap-12 mx-auto">
              
              {/* LEFT BUTTONS */}
              <div className="flex flex-col gap-4">
                
                {/* Cheesy’s */}
                <button onClick={() => setActiveDemo("cheesys")} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition" />
                  <div className="relative w-24 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition p-4">
                    <Pizza className="w-10 h-10 text-white mb-2" />
                    <p className="text-white text-xs font-semibold text-center">Cheesy&apos;s</p>
                  </div>
                </button>

                {/* WorkBuddy */}
                <button onClick={() => setActiveDemo("workbuddy")} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition" />
                  <div className="relative w-24 h-32 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition p-4">
                    <Briefcase className="w-10 h-10 text-white mb-2" />
                    <p className="text-white text-xs font-semibold text-center">WorkBuddy</p>
                  </div>
                </button>

                {/* BaggyJean */}
                <button onClick={() => setActiveDemo("baggyjean")} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition" />
                  <div className="relative w-24 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition p-4">
                    <Shirt className="w-10 h-10 text-white mb-2" />
                    <p className="text-white text-xs font-semibold text-center">BaggyJean</p>
                  </div>
                </button>
              </div>

              {/* Safefier Main Button */}
              <button onClick={() => setActiveDemo("main")} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse group-hover:opacity-80" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                  <Smile className="w-16 h-16 text-white" />
                </div>
                <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/80 text-sm opacity-0 group-hover:opacity-100 transition">
                  Click to open Safefier
                </p>
              </button>
            </div>
          )}

          {/* ======================
              2) ACTIVE DEMO MODE
          =======================*/}
          {activeDemo && (
            <div className="flex w-full justify-center gap-16">
              
              {/* ⭐ CHAT WINDOW CENTERED */}
              <div className="relative">
                <ChatWindow demoType={activeDemo} />

                <button
                  onClick={() => setActiveDemo(null)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* ⭐ FIREWALL PANEL RIGHT-ALIGNED */}
              <div className="hidden md:flex flex-col gap-6 w-[380px] text-white pt-4">

                <h2 className="text-4xl font-bold drop-shadow-lg">Safefier AI<br />Firewall</h2>

                <p className="text-blue-100 text-sm leading-relaxed">
                  Safefier runs multiple detectors in real time to maintain
                  safety, emotional well-being, and factual grounding — all while
                  keeping your identity anonymous.
                </p>

                {/* Emotional Detector */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-xl hover:bg-white/15 transition">
                  <h3 className="text-lg font-semibold text-blue-300 mb-1">💙 Emotional Dependence Detector</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    Detects unhealthy attachment, isolation, or distress — provides supportive resources to keep users safe.
                  </p>
                </div>

                {/* Dangerous Advice */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-xl hover:bg-white/15 transition">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-1">⚠️ Dangerous Advice Filter</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    Blocks harmful medical, legal, or risky advice — replacing it with safe professional guidance.
                  </p>
                </div>

                {/* Hallucination */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-xl hover:bg-white/15 transition">
                  <h3 className="text-lg font-semibold text-purple-300 mb-1">🧠 Hallucination Detector (RAG)</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    Cross-checks responses with real historical documents to detect ungrounded or fabricated information.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
