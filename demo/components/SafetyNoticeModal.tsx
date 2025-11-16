"use client";

import React from "react";

interface SafetyNoticeModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function SafetyNoticeModal({ isOpen, onAccept }: SafetyNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-5 animate-scale-in">
        
        <h2 className="text-xl font-semibold">🔒 Safety & Privacy Notice</h2>

        <p className="text-white/70 text-sm leading-relaxed">
          Safefier analyzes certain messages that may indicate danger, emotional
          distress, or harmful intent. These detections are used strictly for
          safety purposes to help prevent risky or harmful outcomes.
        </p>

        <p className="text-white/70 text-sm leading-relaxed">
          To learn more about how Safefier handles and protects your data, please
          review our AI Privacy Policy below.
        </p>

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
