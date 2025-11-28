/**
 * REIKO AI STYLES
 * AI assistant chat interface
 */

import { StyleSheet } from "react-native";
import {
  colors,
  fontFamily,
  fontSize,
  spacing,
  borderRadius,
  shadows,
} from "./theme";

export const reikoStyles = StyleSheet.create({
  // ============================================
  // POPUP CONTAINER (in bottom nav)
  // ============================================
  popupContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  popupHeader: {
    marginBottom: spacing.md,
  },
  popupTitle: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    fontStyle: "italic",
  },
  popupMessage: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
    lineHeight: 22,
  },
  popupDivider: {
    height: 1,
    backgroundColor: colors.neutral.lightGray,
    marginVertical: spacing.md,
  },

  // ============================================
  // FULL CHAT SCREEN
  // ============================================
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.xl,
    color: colors.text.primary,
    fontStyle: "italic",
  },
  headerSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },

  // ============================================
  // MESSAGES LIST
  // ============================================
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  messageWrapper: {
    marginBottom: spacing.md,
    maxWidth: "80%",
  },
  messageWrapperUser: {
    alignSelf: "flex-end",
  },
  messageWrapperAssistant: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary.green,
    borderBottomRightRadius: spacing.xs,
  },
  messageBubbleAssistant: {
    backgroundColor: colors.neutral.offWhite,
    borderBottomLeftRadius: spacing.xs,
  },
  messageText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  messageTextUser: {
    color: colors.text.primary,
  },
  messageTextAssistant: {
    color: colors.text.primary,
  },
  messageTime: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.text.light,
    marginTop: spacing.xs,
  },

  // ============================================
  // INPUT AREA
  // ============================================
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral.lightGray,
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },

  // ============================================
  // TYPING INDICATOR
  // ============================================
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.lg,
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.gray,
    marginHorizontal: 2,
  },

  // ============================================
  // SUGGESTIONS
  // ============================================
  suggestionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  suggestionChip: {
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  suggestionText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
});
