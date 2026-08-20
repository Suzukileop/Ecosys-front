import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "bg-base": "#06060F",
        "bg-card": "#0D0D1A",
        "bg-surface": "#13131F",
        "accent-1": "#7C3AED",
        "accent-2": "#2563EB",
        "accent-3": "#06B6D4",
        "text-primary": "#F0F0FF",
        "text-secondary": "#9CA3AF",
      },
      fontFamily: {
        sans: ["var(--font-aeonik)", "ui-sans-serif", "system-ui", "sans-serif"],
        clash: ["var(--font-clash)", "sans-serif"],
        "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
        "geist-mono": ["var(--font-geist-mono)", "monospace"],
        geist: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        aeonik: ["var(--font-aeonik)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, #7C3AED 0px, transparent 50%), radial-gradient(at 80% 0%, #2563EB 0px, transparent 50%), radial-gradient(at 0% 50%, #06B6D4 0px, transparent 50%)",
        "hero-gradient":
          "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #06B6D4 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(37,99,235,0.05) 100%)",
        "brand-gradient":
          "linear-gradient(135deg, #7C3AED, #2563EB, #06B6D4)",
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        marquee: "marquee 18s linear infinite",
        "marquee-vertical": "marquee-vertical 55s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        reveal: "reveal 0.8s ease-out forwards",
        "spin-slow": "spin 8s linear infinite",
        "vip-shimmer": "vip-shimmer 2.8s ease-in-out infinite",
        "vip-aurora": "vip-aurora 14s ease-in-out infinite",
        "vip-glow-pulse": "vip-glow-pulse 3s ease-in-out infinite",
        "vip-float": "vip-float 5s ease-in-out infinite",
        "vip-border-flow": "vip-border-flow 5s linear infinite",
        "orb-1": "orb-move-1 8s ease-in-out infinite",
        "orb-2": "orb-move-2 10s ease-in-out infinite",
        "orb-3": "orb-move-3 12s ease-in-out infinite",
        "draw-line": "draw-line 2s ease-out forwards",
        "scroll-progress": "scroll-progress 1s linear",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.4)" },
          "50%": { boxShadow: "0 0 60px rgba(124,58,237,0.8)" },
        },
        marquee: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-50%, 0, 0)" },
        },
        "marquee-vertical": {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(-50%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "orb-move-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "orb-move-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-40px, 30px) scale(1.15)" },
          "66%": { transform: "translate(20px, -40px) scale(0.85)" },
        },
        "orb-move-3": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, 40px) scale(0.9)" },
          "66%": { transform: "translate(-30px, -20px) scale(1.1)" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "vip-shimmer": {
          "0%, 100%": { opacity: "0.35", transform: "translateX(-120%) skewX(-12deg)" },
          "50%": { opacity: "1", transform: "translateX(120%) skewX(-12deg)" },
        },
        "vip-aurora": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%": { transform: "translate(8%, -6%) scale(1.08)" },
          "66%": { transform: "translate(-6%, 8%) scale(0.95)" },
        },
        "vip-glow-pulse": {
          "0%, 100%": { opacity: "0.45", filter: "blur(18px)" },
          "50%": { opacity: "0.9", filter: "blur(28px)" },
        },
        "vip-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "vip-border-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
