/**
 * WELCOME SCREEN STYLES
 * First screen after splash with "Join the Community" button
 */

import { StyleSheet, TextStyle } from "react-native";
import {
    colors,
    fontFamily,
    fontWeight,
    fontSize,
    spacing,
    borderRadius,
} from "./theme";

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
        marginBottom: spacing.md,
        borderRadius: borderRadius.xl,
        alignItems: "center",
        justifyContent: "center",
    },
    logoEmoji: {
        fontSize: fontSize["5xl"],
    },
    logoImage: {
        width: 150,
        height: 150,
        resizeMode: "contain",
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
        fontFamily: fontFamily.headingMedium,
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
        fontFamily: fontFamily.headingMediumItalic,
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
