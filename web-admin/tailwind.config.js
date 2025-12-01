/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9466FF",
          dark: "#7c4dff",
        },
        accent: "#FF69B4",
        background: "#F0F2F5",
      },
    },
  },
  plugins: [],
};

