'use client'

import { useState } from "react";
import Image from "next/image";
import { Smile, Pizza, Briefcase, Shirt } from "lucide-react";
import { ChatWindow } from "../components/ChatWindow";
import { SafetyNoticeModal } from "../components/SafetyNoticeModal"; // ⭐ NEW

// Supports all demos
type DemoType = null | "main" | "cheesys" | "workbuddy" | "baggyjean";

export default function Home() {
  const [activeDemo, setActiveDemo] = useState<DemoType>(null);

  /* =====================================================
     SAFETY NOTICE POPUP (ALWAYS SHOWS)
  ===================================================== */

  const [showSafetyNotice, setShowSafetyNotice] = useState(true);

  const handleAcceptPrivacy = () => {
    // No localStorage → popup will always appear unless closed
    setShowSafetyNotice(false);
  };

  /* ===================================================== */

  return (
    <>
      {/* ⭐ Safety Notice Popup */}
      <SafetyNoticeModal
        isOpen={showSafetyNotice}
        onAccept={handleAcceptPrivacy}
      />

      <main
        className="
          relative
          min-h-screen flex items-center justify-center
          bg-gradient-to-br from-blue-500 via-blue-950 to-purple-600
          dark:from-blue-600 dark:via-blue-950 dark:to-purple-700
          bg-[length:200%_200%] animate-gradient p-4
        "
      >

        {/* ---------------- MOVING SAFEFIER LOGO ---------------- */}
        <div className="absolute top-10 left-0 w-full overflow-hidden pointer-events-none">
          <div className="safefier-logo animate-slide w-full flex justify-start">
            <Image
              src="/images/LogoTransparent.png"
              alt="Safefier Logo"
              width={350}
              height={90}
              className="opacity-100 select-none"
              priority
            />
          </div>
        </div>

        {/* ---------------- DEMO SELECTION UI ---------------- */}
        {!activeDemo && (
          <div className="flex items-center gap-12">
            {/* SCENARIO BUTTONS */}
            <div className="flex flex-col gap-4">

              {/* Pizza — Cheesy’s */}
              <button
                onClick={() => setActiveDemo("cheesys")}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative w-24 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300 border-2 border-white/20 p-4">
                  <Pizza className="w-10 h-10 text-white mb-2" strokeWidth={2} />
                  <p className="text-white text-xs font-semibold text-center">
                    Cheesy&apos;s
                  </p>
                </div>
              </button>

              {/* Briefcase — WorkBuddy */}
              <button
                onClick={() => setActiveDemo("workbuddy")}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative w-24 h-32 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300 border-2 border-white/20 p-4">
                  <Briefcase className="w-10 h-10 text-white mb-2" strokeWidth={2} />
                  <p className="text-white text-xs font-semibold text-center">
                    WorkBuddy
                  </p>
                </div>
              </button>

              {/* Shirt — BaggyJean */}
              <button
                onClick={() => setActiveDemo("baggyjean")}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative w-24 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300 border-2 border-white/20 p-4">
                  <Shirt className="w-10 h-10 text-white mb-2" strokeWidth={2} />
                  <p className="text-white text-xs font-semibold text-center">
                    BaggyJean
                  </p>
                </div>
              </button>
            </div>

            {/* MAIN SMILE BUTTON — Safefier */}
            <button
              onClick={() => setActiveDemo("main")}
              className="group relative"
            >
              {/* Glow ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-pulse" />

              {/* Main circle */}
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 border-4 border-white/20">
                <Smile className="w-16 h-16 text-white" strokeWidth={2} />
              </div>

              {/* Hover hint */}
              <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open Safefier
              </p>
            </button>
          </div>
        )}

        {/* ---------------- ACTIVE DEMO UI ---------------- */}
        {activeDemo && (
          <div className="relative">
            <ChatWindow demoType={activeDemo} />

            {/* Close button */}
            <button
              onClick={() => setActiveDemo(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
            >
              ✕
            </button>
          </div>
        )}
      </main>
    </>
  );
}
