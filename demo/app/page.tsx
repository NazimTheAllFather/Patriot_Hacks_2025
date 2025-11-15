'use client'

import { useState } from "react";
import Image from "next/image";
import { Smile } from "lucide-react";
import { ChatWindow } from "../components/ChatWindow";

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
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

      {/* ---------------- SMILE BUTTON (DEMO CLOSED STATE) ---------------- */}
      {!isDemoOpen && (
        <button
          onClick={() => setIsDemoOpen(true)}
          className="group relative"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 
                          rounded-full blur-xl opacity-60 group-hover:opacity-80 
                          transition-opacity duration-300 animate-pulse" />

          {/* Main circle */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 
                          rounded-full flex items-center justify-center shadow-2xl 
                          group-hover:scale-110 transition-transform duration-300 
                          border-4 border-white/20">
            <Smile className="w-16 h-16 text-white" strokeWidth={2} />
          </div>

          {/* Hover hint */}
          <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                        text-white/80 text-sm font-medium whitespace-nowrap 
                        opacity-0 group-hover:opacity-100 transition-opacity">
            Click to open Safefier
          </p>
        </button>
      )}

      {/* ---------------- CHAT DEMO (DEMO OPEN STATE) ---------------- */}
      {isDemoOpen && (
        <div className="relative">
          <ChatWindow />

          {/* Close button */}
          <button
            onClick={() => setIsDemoOpen(false)}
            className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 
                        hover:bg-red-600 text-white rounded-full flex items-center 
                        justify-center shadow-lg transition-colors z-10"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
