/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Defined using hex values directly for simplicity and direct mapping to user request
        background: "#FFFFFF", // White background
        foreground: "#2c3e50", // Main text color
        primary: {
          DEFAULT: "#00cba7", // Energetic Teal
          foreground: "#FFFFFF", // White text on primary
        },
        secondary: {
          DEFAULT: "#a78bfa", // Playful Lavender
          foreground: "#FFFFFF", // White text on secondary
        },
        accent: {
          DEFAULT: "#ff8c42", // Warm Sunset Orange
          foreground: "#FFFFFF", // White text on accent
        },
        muted: {
          DEFAULT: "#f8f9fa", // Light grey for muted backgrounds
          foreground: "#6c757d", // Darker grey for muted text
        },
        border: "#e0e0e0", // Light grey border
        card: {
          DEFAULT: "#FFFFFF", // White card background
          foreground: "#2c3e50", // Card text color
        },
        destructive: {
          DEFAULT: "#dc3545", // Red for destructive actions
          foreground: "#FFFFFF",
        },
        input: "#e0e0e0", // Light grey for input borders
        ring: "#00cba7", // Primary color for focus rings
      },
      borderRadius: {
        lg: "1rem", // Larger border radius for modern feel
        md: "0.75rem",
        sm: "0.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}


