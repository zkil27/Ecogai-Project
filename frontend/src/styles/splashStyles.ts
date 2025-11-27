/**
 * SPLASH SCREEN STYLES
 * Green loading screen with logo
 */

import { StyleSheet, TextStyle } from "react-native";
import { colors, fontFamily, fontSize, spacing, borderRadius } from "./theme";

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.splash,
  },
  logoContainer: {
    width: 128,
    height: 128,
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: fontSize["5xl"],
  },
  title: {
    fontSize: fontSize["5xl"],
    fontFamily: fontFamily.headingBold,
  },
  titleWhite: {
    color: colors.text.white,
  },
  titleBlack: {
    color: colors.neutral.black,
  },
});
