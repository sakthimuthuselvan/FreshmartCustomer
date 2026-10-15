/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat-Regular", "sans-serif"],
        regular: ["Montserrat-Regular", "sans-serif"],
        medium: ["Montserrat-Medium", "sans-serif"],
        semibold: ["Montserrat-SemiBold", "sans-serif"],
        bold: ["Montserrat-Bold", "sans-serif"],
        extrabold: ["Montserrat-Bold", "sans-serif"],
        black: ["Montserrat-Bold", "sans-serif"],
        montserrat: ["Montserrat-Regular", "sans-serif"],
        "montserrat-medium": ["Montserrat-Medium", "sans-serif"],
        "montserrat-semibold": ["Montserrat-SemiBold", "sans-serif"],
        "montserrat-bold": ["Montserrat-Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};