// Global theme colors and styles for Ecogai app

export const colors = {
  // Primary Colors
  primary: {
    green: "#A4D65E", // Main brand green
    lightGreen: "#B8E986", // Lighter green
    darkGreen: "#8BC34A", // Darker green for accents
  },

  // Neutral Colors
  neutral: {
    white: "#FFFFFF",
    offWhite: "#F5F5F5",
    lightGray: "#E8E8E8",
    gray: "#9E9E9E",
    darkGray: "#5F5F5F",
    black: "#3D3D3D",
  },

  // UI Colors
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F5F5",
    splash: "#A4D65E",
  },

  text: {
    primary: "#3D3D3D",
    secondary: "#5F5F5F",
    light: "#9E9E9E",
    white: "#FFFFFF",
    green: "#A4D65E",
  },

  button: {
    primary: "#A4D65E",
    secondary: "#FFFFFF",
    disabled: "#E8E8E8",
  },

  border: {
    primary: "#A4D65E",
    secondary: "#E8E8E8",
    dark: "#5F5F5F",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
};

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "800",
  black: "900",
};

export const fontFamily = {
  // Headings and titles
  heading: "MuseoModerno",
  headingItalic: "MuseoModerno-Italic",

  // Body text
  body: "Jost",
  bodyItalic: "Jost-Italic",
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
