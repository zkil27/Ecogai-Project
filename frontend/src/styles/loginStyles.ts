/**
 * LOGIN SCREEN STYLES
 * User login form with email/password inputs
 */

import { StyleSheet } from "react-native";
import {
  colors,
  fontFamily,
  fontWeight,
  fontSize,
  spacing,
  borderRadius,
} from "./theme";

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
    fontSize: fontSize["2xl"],
    color: colors.neutral.darkGray,
  },
  title: {
    fontSize: fontSize["4xl"],
    fontFamily: fontFamily.headingSemiBold,
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
    fontFamily: fontFamily.heading,
    marginBottom: spacing.sm,
    fontSize: fontSize.base,
  },
  input: {
    backgroundColor: colors.neutral.lightGray,
    borderWidth: 2,
    borderColor: colors.border.input,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    fontFamily: fontFamily.body,
    color: colors.text.primary,
  },
  inputFocused: {
    borderColor: colors.border.inputFocused,
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
    fontFamily: fontFamily.headingSemiBold,
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
    paddingVertical: spacing.md,
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
