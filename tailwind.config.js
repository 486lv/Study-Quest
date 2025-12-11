/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🟢 关键：这里告诉 Tailwind 去扫描 src 目录下所有的文件
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}