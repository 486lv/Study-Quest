import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: "var(--primary)",
        "primary-fg": "var(--primary-fg)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
      },
      borderRadius: {
        theme: "var(--radius)",
      },
      boxShadow: {
        theme: "var(--shadow)",
      },
      fontFamily: {
        // 🟢 关键：注册自定义字体变量
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        pixel: ["var(--font-pixel)", "cursive"],     // 像素风专用
        serif: ["var(--font-playfair)", "serif"],    // 胶片风专用
        "serif-sc": ["var(--font-serif-sc)", "serif"], // 水墨风专用
      },
      animation: {
        // 🟢 关键：注册自定义动画
        "spin-slow": "spin 10s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
};
export default config;