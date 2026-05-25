import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#020813",
          dim: "#020813",
          bright: "#162235",
          container: {
            lowest: "#01050e",
            low: "#051020",
            DEFAULT: "#081225",
            high: "#0f1c35",
            highest: "#172744",
          },
          variant: "#0f1c35",
        },
        "on-surface": {
          DEFAULT: "#f1f5f9",
          variant: "#cbd5e1",
        },
        "inverse-surface": "#f1f5f9",
        "inverse-on-surface": "#090d16",
        outline: {
          DEFAULT: "#475569",
          variant: "#334155",
        },
        "surface-tint": "#8b5cf6",
        primary: {
          DEFAULT: "#6366f1",
          container: "#8b5cf6",
          fixed: {
            DEFAULT: "#e0e7ff",
            dim: "#c7d2fe",
          },
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#ffffff",
          fixed: {
            DEFAULT: "#312e81",
            variant: "#4338ca",
          },
        },
        "inverse-primary": "#4f46e5",
        secondary: {
          DEFAULT: "#94a3b8",
          container: "#1e293b",
          fixed: {
            DEFAULT: "#f1f5f9",
            dim: "#e2e8f0",
          },
        },
        "on-secondary": {
          DEFAULT: "#0f172a",
          container: "#cbd5e1",
          fixed: {
            DEFAULT: "#0f172a",
            variant: "#334155",
          },
        },
        tertiary: {
          DEFAULT: "#f59e0b",
          container: "#d97706",
          fixed: {
            DEFAULT: "#fef3c7",
            dim: "#fde68a",
          },
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#ffffff",
          fixed: {
            DEFAULT: "#78350f",
            variant: "#92400e",
          },
        },
        error: {
          DEFAULT: "#ef4444",
          container: "#dc2626",
        },
        "on-error": {
          DEFAULT: "#ffffff",
          container: "#ffffff",
        },
        background: "#020813",
        "on-background": "#f1f5f9",
        structure: "#1d2c48",
        card: "rgba(8, 18, 37, 0.8)",
        popover: "#0f1c35",
        comment: "#0f1c35",
        "ai-active": "#8b5cf6",
        diagnostic: {
          success: "#10b981",
          suggestion: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        "display-lg": [
          "32px",
          { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.02em" },
        ],
        "headline-md": [
          "24px",
          { lineHeight: "32px", fontWeight: "600", letterSpacing: "-0.01em" },
        ],
        "title-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "code-md": ["13px", { lineHeight: "20px", fontWeight: "400" }],
        "code-sm": ["12px", { lineHeight: "18px", fontWeight: "400" }],
        "label-caps": [
          "11px",
          { lineHeight: "16px", fontWeight: "700", letterSpacing: "0.08em" },
        ],
      },
      spacing: {
        base: "4px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        gutter: "24px",
        sidebar: "260px",
      },
      width: {
        sidebar: "260px",
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
      },
    },
  },
  plugins: [],
} satisfies Config;

