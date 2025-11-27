/**
 * THEME.TS - Your Design System
 *
 * This file contains ALL design values in ONE place.
 * Change colors, fonts, or spacing here and it updates EVERYWHERE in your app.
 *
 * Usage in screens.ts:
 *   backgroundColor: colors.primary.green  ✅
 *   backgroundColor: "#A4D65E"            ❌ Don't hardcode!
 */

// ============================================
// COLORS - All app colors in one place
// ============================================

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
    input: "#B3B0B0",
    inputFocused: "#416D19",
  },

  // Status Colors
  status: {
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
  },
};

// ============================================
// SPACING - Consistent margins and padding
// ============================================
export const spacing = {
  xs: 4, // Tiny gaps
  sm: 8, // Small gaps
  md: 16, // Medium gaps (most common)
  lg: 24, // Large gaps
  xl: 32, // Extra large gaps
  xxl: 48, // Huge gaps
};

// ============================================
// BORDER RADIUS - Rounded corners
// ============================================
export const borderRadius = {
  sm: 8, // Slightly rounded
  md: 16, // Medium rounded
  lg: 24, // Very rounded (buttons)
  xl: 32, // Extra rounded (inputs)
  full: 9999, // Perfect circle
};

// ============================================
// FONT SIZES - Text sizes
// ============================================
export const fontSize = {
  xs: 12, // Tiny text
  sm: 14, // Small text
  base: 16, // Normal text (default)
  lg: 18, // Large text
  xl: 20, // Extra large
  "2xl": 24, // Headings
  "3xl": 30, // Big headings
  "4xl": 36, // Screen titles
  "5xl": 48, // Splash screen
};

// ============================================
// FONT WEIGHTS - NOT USED with static fonts
// Use fontFamily variants instead (bodyBold, headingBold, etc.)
// ============================================
export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "800",
  black: "900",
};

// ============================================
// FONTS - Use these for text styles
//
// HEADINGS (titles, bold text):
//   - headingBold: "ECOGAI" title
//   - heading: Regular MuseoModerno
//
// BODY TEXT (paragraphs, buttons):
//   - bodyBold: Bold buttons
//   - bodySemiBold: Semi-bold text
//   - body: Regular text
//   - bodyLight: Light text
// ============================================
export const fontFamily = {
  // Headings - MuseoModerno
  headingLight: "MuseoModerno-Light",
  heading: "MuseoModerno-Regular",
  headingMedium: "MuseoModerno-Medium",
  headingSemiBold: "MuseoModerno-SemiBold",
  headingBold: "MuseoModerno-Bold",
  headingExtraBold: "MuseoModerno-ExtraBold",
  headingItalic: "MuseoModerno-Italic",
  headingBoldItalic: "MuseoModerno-BoldItalic",
  headingMediumItalic: "MuseoModerno-MediumItalic",
  headingLightItalic: "MuseoModerno-LightItalic",

  // Body - Jost
  bodyLight: "Jost-Light",
  body: "Jost-Regular",
  bodyMedium: "Jost-Medium",
  bodySemiBold: "Jost-SemiBold",
  bodyBold: "Jost-Bold",
  bodyExtraBold: "Jost-ExtraBold",
  bodyItalic: "Jost-Italic",
};

// ============================================
// SHADOWS - Drop shadows for cards/buttons
// ============================================
export const shadows = {
  sm: {
    // Small shadow (subtle)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    // Medium shadow (cards)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    // Large shadow (floating elements)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * ============================================
 * HOW TO USE THIS THEME:
 * ============================================
 *
 * In screens.ts, import and use:
 *
 * import { colors, fontSize, spacing, fontFamily } from "./theme";
 *
 * const styles = StyleSheet.create({
 *   title: {
 *     color: colors.primary.green,        // ✅ Use theme
 *     fontSize: fontSize["4xl"],          // ✅ Use theme
 *     fontFamily: fontFamily.headingBold, // ✅ Use theme
 *     marginBottom: spacing.xl,           // ✅ Use theme
 *   }
 * });
 *
 * DON'T hardcode values:
 *   color: "#A4D65E"        ❌ Bad
 *   fontSize: 36            ❌ Bad
 *   marginBottom: 32        ❌ Bad
 */
