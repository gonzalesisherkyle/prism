import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#051424",
          dim: "#051424",
          bright: "#2c3a4c",
          container: {
            lowest: "#010f1f",
            low: "#0d1c2d",
            DEFAULT: "#122131",
            high: "#1c2b3c",
            highest: "#273647",
          },
          variant: "#273647",
        },
        "on-surface": {
          DEFAULT: "#d4e4fa",
          variant: "#cbc3d7",
        },
        "inverse-surface": "#d4e4fa",
        "inverse-on-surface": "#233143",
        outline: {
          DEFAULT: "#958ea0",
          variant: "#494454",
        },
        "surface-tint": "#d0bcff",
        primary: {
          DEFAULT: "#d0bcff",
          container: "#a078ff",
          fixed: {
            DEFAULT: "#e9ddff",
            dim: "#d0bcff",
          },
        },
        "on-primary": {
          DEFAULT: "#3c0091",
          container: "#340080",
          fixed: {
            DEFAULT: "#23005c",
            variant: "#5516be",
          },
        },
        "inverse-primary": "#6d3bd7",
        secondary: {
          DEFAULT: "#bcc7de",
          container: "#3e495d",
          fixed: {
            DEFAULT: "#d8e3fb",
            dim: "#bcc7de",
          },
        },
        "on-secondary": {
          DEFAULT: "#263143",
          container: "#aeb9d0",
          fixed: {
            DEFAULT: "#111c2d",
            variant: "#3c475a",
          },
        },
        tertiary: {
          DEFAULT: "#ffb869",
          container: "#ca801e",
          fixed: {
            DEFAULT: "#ffdcbb",
            dim: "#ffb869",
          },
        },
        "on-tertiary": {
          DEFAULT: "#482900",
          container: "#3f2300",
          fixed: {
            DEFAULT: "#2c1700",
            variant: "#673d00",
          },
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "on-error": {
          DEFAULT: "#690005",
          container: "#ffdad6",
        },
        background: "#051424",
        "on-background": "#d4e4fa",
        structure: "#30363d",
        card: "#161b22",
        popover: "#1c2128",
        comment: "#1e293b",
        "ai-active": "#8b5cf6",
        diagnostic: {
          success: "#3fb950",
          suggestion: "#58a6ff",
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
          { lineHeight: "16px", fontWeight: "700", letterSpacing: "0.05em" },
        ],
      },
      spacing: {
        base: "4px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        gutter: "16px",
        sidebar: "240px",
      },
      width: {
        sidebar: "240px",
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        none: "0px",
      },
    },
  },
  plugins: [],
} satisfies Config;

