/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#A4D65E",
          light: "#B8E986",
          dark: "#8BC34A",
        },
        neutral: {
          white: "#FFFFFF",
          offWhite: "#F5F5F5",
          lightGray: "#E8E8E8",
          gray: "#9E9E9E",
          darkGray: "#5F5F5F",
          black: "#3D3D3D",
        },
        text: {
          primary: "#3D3D3D",
          secondary: "#5F5F5F",
          light: "#9E9E9E",
        },
      },
      fontFamily: {
        jost: ["Jost"],
        "jost-italic": ["Jost-Italic"],
        museo: ["MuseoModerno"],
        "museo-italic": ["MuseoModerno-Italic"],
      },
      borderRadius: {
        xl: "24px",
        "2xl": "32px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [],
};
