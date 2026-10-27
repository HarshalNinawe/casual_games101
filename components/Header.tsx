"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Games", href: "#games" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between"
        style={{ height: "64px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Pixelverse Home"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "#e53935",
              boxShadow: "0 2px 10px rgba(229, 57, 53, 0.3)",
              transition: "box-shadow 0.3s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.95" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.75" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.75" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.55" />
            </svg>
          </div>
          <span
            className="text-xl font-black tracking-widest transition-all duration-300"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "#171717",
            }}
          >
            PIXEL<span style={{ color: "#e53935" }}>VERSE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: "#666666" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#171717";
                (e.currentTarget as HTMLElement).style.background = "#f1f1f1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#666666";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#games"
            className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 btn-red"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
            }}
          >
            Play Now
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg"
          style={{ color: "#666666" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sm:hidden px-4 pb-4 flex flex-col gap-1"
          style={{ borderTop: "1px solid #e5e5e5", background: "#ffffff" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-3 rounded-lg text-sm font-medium"
              style={{ color: "#666666" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#games"
            className="mt-1 px-4 py-3 rounded-lg text-sm font-semibold text-center btn-red"
            onClick={() => setMenuOpen(false)}
          >
            Play Now
          </Link>
        </div>
      )}
    </header>
  );
}
