/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
          border: "var(--ink-border)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          glow: "var(--glow)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
        },
      },
      borderRadius: {
        'card': 'var(--radius)',
        'pill': '9999px',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Instrument Serif', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(27, 20, 32, 0.05), 0 2px 6px -1px rgba(27, 20, 32, 0.03)',
        'card': '0 10px 30px -4px rgba(27, 20, 32, 0.08)',
        'float': '0 20px 40px -8px rgba(27, 20, 32, 0.12)',
      },
    },
  },
  plugins: [],
};
