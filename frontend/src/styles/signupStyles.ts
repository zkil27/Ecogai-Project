/**
 * SIGNUP SCREEN STYLES
 * Multi-step signup form with personal details, medical info, and phone verification
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

export const signupStyles = StyleSheet.create({
    // ============================================
    // MAIN CONTAINER STYLES
    // ============================================
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary, // Light gray background
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: spacing.lg, // 24px horizontal padding
        paddingTop: spacing.xl,        // 32px top padding
        justifyContent: 'space-between', // Space-between for consistent bottom section
    },
    formScrollArea: {
        flex: 1, // Takes available space between header and bottom
    },
    bottomFixedSection: {
        paddingBottom: spacing.lg,     // 24px bottom padding
        paddingTop: spacing.md,        // 16px separation from content
    },

    // ============================================
    // BACK BUTTON
    // ============================================
    backButton: {
        marginTop: spacing.lg,    // 24px space from top/notch
        marginBottom: spacing.xl, // 32px space below
    },
    backButtonIcon: {
        width: 24,                         // Icon size
        height: 24,
    },
    backButtonText: {
        fontSize: fontSize["2xl"],         // 24px
        color: colors.neutral.darkGray,    // Dark gray arrow
    },

    // ============================================
    // TITLE SECTION
    // ============================================
    title: {
        fontSize: fontSize["4xl"],              // 36px - Large title
        fontFamily: fontFamily.headingSemiBold, // MuseoModerno SemiBold
        textAlign: "center",
        marginBottom: spacing.md,               // 16px space below
    },
    titleGreen: {
        color: colors.primary.green, // Green "SIGN" text
    },
    titleBlack: {
        color: colors.neutral.black, // Black "UP" text
    },
    subtitle: {
        fontSize: fontSize.base,         // 16px
        fontFamily: fontFamily.body,     // Jost Regular
        color: colors.text.secondary,    // Gray text
        textAlign: "center",
        marginBottom: spacing.xxl,       // 48px space below
    },

    // ============================================
    // INPUT FIELDS
    // ============================================
    inputContainer: {
        marginBottom: spacing.lg, // 24px space between inputs
    },
    label: {
        color: colors.text.primary,      // Dark text
        fontFamily: fontFamily.heading,  // MuseoModerno Regular
        marginBottom: spacing.sm,        // 8px space below label
        fontSize: fontSize.base,         // 16px
    },
    input: {
        backgroundColor: colors.neutral.lightGray, // Light gray background
        borderWidth: 2,
        borderColor: colors.border.input,          // Gray border (default)
        borderRadius: borderRadius.xl,             // 32px rounded corners
        paddingHorizontal: spacing.lg,             // 24px left/right padding
        paddingVertical: spacing.md,               // 16px top/bottom padding
        fontSize: fontSize.base,                   // 16px text
        fontFamily: fontFamily.body,               // Jost Regular
        color: colors.text.primary,                // Dark text color
    },
    inputFocused: {
        borderColor: colors.border.inputFocused, // Green border when focused
    },

    // ============================================
    // FILE UPLOAD AREA
    // ============================================
    uploadContainer: {
        backgroundColor: colors.neutral.lightGray, // Light gray background
        borderWidth: 2,
        borderColor: colors.border.input,          // Gray dashed-style border
        borderRadius: borderRadius.xl,             // 32px rounded
        paddingVertical: spacing.xxl * 2,          // 96px vertical padding (large area)
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,                  // 24px space below
    },
    uploadIcon: {
        fontSize: fontSize["5xl"],      // 48px - Large cloud icon
        color: colors.neutral.gray,     // Gray icon
        marginBottom: spacing.sm,       // 8px space below icon
    },
    uploadText: {
        fontSize: fontSize.sm,           // 14px
        fontFamily: fontFamily.body,     // Jost Regular
        color: colors.text.secondary,    // Gray text
    },

    // ============================================
    // OTP INPUT BOXES (4 boxes)
    // ============================================
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // Equal spacing between boxes
        marginBottom: spacing.lg,        // 24px space below
    },
    otpInput: {
        width: 60,                              // Square boxes
        height: 60,
        backgroundColor: colors.neutral.lightGray, // Light gray when empty
        borderWidth: 2,
        borderColor: colors.border.input,          // Gray border
        borderRadius: borderRadius.xl,             // 32px rounded (circular appearance)
        fontSize: fontSize["2xl"],                 // 24px - Large numbers
        fontFamily: fontFamily.headingBold,        // MuseoModerno Bold
        color: colors.text.primary,                // Dark text
        textAlign: "center",                       // Center the number
    },
    otpInputFocused: {
        borderColor: colors.border.inputFocused, // Green border when typing
    },
    otpInputFilled: {
        backgroundColor: colors.primary.green, // Green background when filled
        borderColor: colors.primary.green,     // Green border
        color: colors.neutral.black,           // Black text on green
    },

    // ============================================
    // RESEND OTP SECTION
    // ============================================
    resendContainer: {
        alignItems: "center",
        marginBottom: spacing.xl, // 32px space below
    },
    resendText: {
        fontSize: fontSize.sm,           // 14px - "Didn't receive any code?"
        fontFamily: fontFamily.body,     // Jost Regular
        color: colors.text.secondary,    // Light gray text
        marginBottom: spacing.xs,        // 4px space below
    },
    resendButton: {
        fontSize: fontSize.base,            // 16px - "Resend OTP code"
        fontFamily: fontFamily.bodySemiBold, // Jost SemiBold
        color: colors.text.primary,         // Dark text (clickable)
    },

    // ============================================
    // CHECKBOX (Terms & Privacy)
    // ============================================
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.lg, // 24px space below
    },
    checkbox: {
        width: 24,                               // Circle size
        height: 24,
        borderWidth: 2,
        borderColor: colors.border.input,        // Gray border
        borderRadius: 12,                        // Perfect circle (50% of width/height)
        marginRight: spacing.sm,                 // 8px space to the right
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background.primary, // White background
    },
    checkboxChecked: {
        backgroundColor: colors.primary.green, // Green when checked
        borderColor: colors.primary.green,     // Green border
    },
    checkboxText: {
        flex: 1,
        fontSize: fontSize.sm,         // 14px text
        fontFamily: fontFamily.body,   // Jost Regular
        color: colors.text.primary,    // Dark text
    },
    checkboxLink: {
        color: colors.primary.green,       // Green underlined links
        textDecorationLine: "underline",
    },

    // ============================================
    // BUTTONS (Next & Skip)
    // ============================================
    nextButton: {
        backgroundColor: colors.button.primary, // Green background
        paddingVertical: spacing.md,            // 16px top/bottom padding
        borderRadius: borderRadius.xl,          // 32px rounded
        alignItems: "center",
        marginBottom: spacing.md,               // 16px space below
    },
    nextButtonText: {
        color: colors.neutral.black,            // Black text on green button
        fontFamily: fontFamily.headingSemiBold, // MuseoModerno SemiBold
        fontWeight: fontWeight.bold as any,
        fontSize: fontSize.lg,                  // 18px
    },
    skipButton: {
        alignItems: "center",
        paddingVertical: spacing.sm, // 8px padding
    },
    skipButtonText: {
        color: colors.text.secondary,  // Gray "Skip" text
        fontFamily: fontFamily.body,   // Jost Regular
        fontSize: fontSize.base,       // 16px
    },

    // ============================================
    // PROGRESS DOTS (Step Indicator)
    // ============================================
    progressContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: spacing.sm,         // 8px space between dots
        marginTop: spacing.lg,   // 24px space above
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,                     // Perfect circle
        backgroundColor: colors.neutral.gray, // Gray for inactive steps
    },
    progressDotActive: {
        backgroundColor: colors.primary.green, // Green for current/completed steps
    },

    // ============================================
    // SOCIAL LOGIN SECTION
    // ============================================
    socialText: {
        textAlign: "center",
        fontFamily: fontFamily.body,     // Jost Regular
        color: colors.text.secondary,    // Gray text
        marginBottom: spacing.lg,        // 24px space below
        marginTop: spacing.md,           // 16px space above
    },
    socialButtons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: spacing.md, // 16px space between buttons
    },
    socialButton: {
        backgroundColor: colors.neutral.lightGray, // Light gray background
        borderWidth: 1,
        borderColor: colors.border.secondary,      // Light border
        borderRadius: borderRadius.lg,             // 24px rounded
        paddingHorizontal: spacing.lg,             // 24px left/right padding
        paddingVertical: spacing.md,  
        marginBottom: spacing.lg,             // 24px space below
        flexDirection: "row",
        alignItems: "center",
    },
    socialIconImage: {
        width: 24,                  // Icon size
        height: 24,
        marginRight: spacing.sm,    // 8px space to the right
    },
    socialButtonText: {
        color: colors.neutral.black,        // Black text
        fontFamily: fontFamily.body,        // Jost Regular
        fontWeight: fontWeight.semibold as any,
    },
});
