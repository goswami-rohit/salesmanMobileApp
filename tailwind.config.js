/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  // Required: include nativewind preset
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // optional aliases:
        background: "#1f2937", // gray-800
        card: "#374151", // gray-700
        primary: "#1d4ed8", // blue-700
      },
    },
  },
  plugins: [],
};
