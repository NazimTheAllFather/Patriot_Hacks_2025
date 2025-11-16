"use client";

import { X, BookOpen, UserCheck, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onHuman: () => void;
  encyclopediaUrl?: string | null;
}

export function HallucinationModal({
  isOpen,
  onClose,
  onHuman,
  encyclopediaUrl,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-2xl w-96 text-black space-y-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Hallucination Detected
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <p className="text-black/70 text-sm">
          The last answer wasn't grounded in verified knowledge.  
          How would you like to proceed?
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <button
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 transition"
            onClick={onHuman}
          >
            <UserCheck className="w-4 h-4" />
            Talk to a Human Supervisor
          </button>

          <button
            disabled={!encyclopediaUrl}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center gap-2 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={() => {
              if (encyclopediaUrl) window.open(encyclopediaUrl, "_blank");
            }}
          >
            <BookOpen className="w-4 h-4" />
            View Encyclopedia
          </button>
        </div>
      </div>
    </div>
  );
}
