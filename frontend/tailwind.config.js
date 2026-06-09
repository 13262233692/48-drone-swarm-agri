/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'deep-bg': '#0a0e1a',
        'panel-bg': '#1a1f35',
        'panel-border': '#2a3155',
        'neon-green': '#00e5a0',
        'alarm-red': '#ff4757',
        'info-blue': '#00b8d4',
        'neon-yellow': '#ffd32a',
        'dark-surface': '#0f1325',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        noto: ['Noto Sans SC', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 10px #00e5a066, 0 0 30px #00e5a033',
        'neon-red': '0 0 10px #ff475766, 0 0 30px #ff475733',
        'neon-blue': '0 0 10px #00b8d466, 0 0 30px #00b8d433',
      },
    },
  },
  plugins: [],
};
