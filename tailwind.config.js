/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "surface": "var(--color-surface)",
        "background": "var(--color-background)",
        "primary": "var(--color-primary)",
        "secondary": "var(--color-secondary)",
        "tertiary": "var(--color-tertiary)",
        "text-muted": "var(--color-text-muted)",
        "border-subtle": "var(--color-border-subtle)",
        "glow-primary": "var(--color-glow-primary)",
        "glow-secondary": "var(--color-glow-secondary)",
        "surface-card": "var(--color-surface-card)",
        "surface-container": "var(--color-surface-container)",
        "on-primary": "var(--color-on-primary)",
        "on-surface": "var(--color-on-surface)",
        "on-background": "var(--color-on-background)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "error": "var(--color-error)",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "32px",
        "container-max": "1200px",
        "lg": "48px",
        "base": "8px",
        "xs": "4px",
        "xl": "80px",
        "sm": "12px",
        "md": "24px"
      },
      fontFamily: {
        "display-lg-mobile": ["Geist", "sans-serif"],
        "display-lg": ["Geist", "sans-serif"],
        "body-md": ["Geist", "sans-serif"],
        "body-lg": ["Geist", "sans-serif"],
        "label-mono": ["JetBrains Mono", "monospace"],
        "headline-md": ["Geist", "sans-serif"]
      },
      fontSize: {
        "display-lg-mobile": ["40px", { "lineHeight": "1.15", "letterSpacing": "0", "fontWeight": "700" }],
        "display-lg": ["64px", { "lineHeight": "1.05", "letterSpacing": "0", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "1.75", "fontWeight": "400" }],
        "label-mono": ["14px", { "lineHeight": "1.4", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }]
      }
    },
  },
  plugins: [],
}
