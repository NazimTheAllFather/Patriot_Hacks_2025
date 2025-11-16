"use client";

import React from "react";
import { ShieldCheck, X } from "lucide-react";

interface SafetyNoticeModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void; // optional if you want to allow closing
}

export function SafetyNoticeModal({
  isOpen,
  onAccept,
  onClose,
}: SafetyNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-7 w-full max-w-md shadow-2xl text-white space-y-5 animate-scale-in">

        {/* Optional top-right close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/60 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Safety & Privacy Notice</h2>
        </div>

        {/* Message */}
        <p className="text-white/70 text-sm leading-relaxed">
          Safefier analyzes your conversation for emotional distress,
          hallucinations, misinformation, and unsafe or harmful content. This is
          done strictly for safety purposes and to prevent the system from generating
          harmful or misleading responses.
        </p>

        <p className="text-white/70 text-sm leading-relaxed">
          Safefier does <span className="font-semibold text-white">not</span>{" "}
          use your data for training, profiling, or commercial purposes.
          Diagnostics are used only to maintain safety standards.
        </p>

        {/* Links + Accept */}
        <div className="flex justify-between items-center pt-2">
          <a
            href="https://docs.google.com/document/d/1kc35Dnpwmkc0_yNg5_eHIIQpdFjf1ZghjWQRbEbfECM/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            📄 View AI Privacy Document
          </a>

          <button
            onClick={onAccept}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition text-white font-medium shadow-sm"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
}
