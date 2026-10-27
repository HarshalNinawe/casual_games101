"use client";

import { useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  gameName: string;
  onClose: () => void;
}

/** Modal shown when a user clicks a "Coming Soon" locked game */
export default function ComingSoonModal({ isOpen, gameName, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(6px)" }}
      onClick={handleOverlayClick}
    >
      <div
        className="animate-fade-in-up relative max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "#fff5f5",
            border: "1px solid rgba(229, 57, 53, 0.2)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z"
              stroke="#e53935"
              strokeWidth="2"
            />
            <path
              d="M16 10v8M16 22v.5"
              stroke="#e53935"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Content */}
        <p
          className="text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "#e53935" }}
        >
          Coming Soon
        </p>
        <h2
          id="modal-title"
          className="text-2xl font-bold mb-3"
          style={{ color: "#171717", fontFamily: "'Orbitron', sans-serif" }}
        >
          {gameName}
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#666666" }}>
          The developer has yet to release this game. Stay tuned — it&apos;s coming soon!
        </p>

        <button
          id="modal-ok-btn"
          onClick={onClose}
          autoFocus
          className="btn-red w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
        >
          OK, I&apos;ll wait!
        </button>
      </div>
    </div>
  );
}
