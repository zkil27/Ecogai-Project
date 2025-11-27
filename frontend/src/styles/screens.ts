import { StyleSheet, TextStyle } from "react-native";
import {
  colors,
  fontFamily,
  fontWeight,
  fontSize,
  spacing,
  borderRadius,
} from "./theme";

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
    fontFamily: fontFamily.heading,
    fontWeight: "700" as TextStyle["fontWeight"],
  },
  titleWhite: {
    color: colors.text.white,
  },
  titleBlack: {
    color: colors.neutral.black,
  },
});

// ============================================
// WELCOME SCREEN - First screen after splash
// ============================================
export const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 128,
    height: 128,
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.neutral.darkGray,
  },
  logoEmoji: {
    fontSize: fontSize["5xl"],
  },
  title: {
    fontSize: fontSize["4xl"],
    fontFamily: fontFamily.headingBold,
    marginBottom: spacing.sm,
  },
  titleGreen: {
    color: colors.primary.green,
  },
  titleBlack: {
    color: colors.neutral.black,
  },
  subtitle: {
    textAlign: "center",
    fontSize: fontSize.lg,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.normal as any,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  subtitleGreen: {
    color: colors.primary.green,
    fontWeight: fontWeight.semibold as any,
  },
  subtitleBlack: {
    color: colors.neutral.black,
  },
  subtitleBold: {
    color: colors.neutral.black,
    fontFamily: fontFamily.bodyItalic,
    fontWeight: fontWeight.bold as any,
  },
  buttonContainer: {
    width: "100%",
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.button.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.neutral.black,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.bold as any,
    fontSize: fontSize.lg,
  },
  secondaryButtonText: {
    color: colors.primary.green,
    textAlign: "center",
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold as any,
    fontSize: fontSize.base,
  },
});

// ============================================
// LOGIN SCREEN - User login form
// ============================================
export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.xl,
  },
  backButtonText: {
    fontSize: fontSize["2xl"], // Changed from hardcoded 30
    color: colors.neutral.darkGray,
  },
  title: {
    fontSize: fontSize["4xl"],
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.bold as any,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  titleGreen: {
    color: colors.primary.green,
  },
  titleBlack: {
    color: colors.neutral.black,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text.primary,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold as any,
    marginBottom: spacing.sm,
    fontSize: fontSize.base,
  },
  input: {
    backgroundColor: colors.neutral.lightGray,
    borderWidth: 2,
    borderColor: colors.border.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    fontFamily: fontFamily.body,
    color: colors.text.primary,
  },
  loginButton: {
    backgroundColor: colors.button.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  loginButtonText: {
    color: colors.neutral.black,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.bold as any,
    fontSize: fontSize.lg,
  },
  forgotPassword: {
    color: colors.text.light,
    fontFamily: fontFamily.body,
    textAlign: "center",
    fontSize: fontSize.base,
    marginBottom: spacing.xl,
  },
  socialText: {
    textAlign: "center",
    fontFamily: fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  socialButton: {
    backgroundColor: colors.neutral.lightGray,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, // Changed from hardcoded 12
    flexDirection: "row",
    alignItems: "center",
  },
  socialIcon: {
    fontSize: fontSize["2xl"],
    marginRight: spacing.sm,
  },
  socialButtonText: {
    color: colors.neutral.black,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold as any,
  },
});
