/**
 * BOTTOM NAVIGATION STYLES
 * Floating bottom nav bar with 4 tabs
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

export const bottomNavStyles = StyleSheet.create({
  // ============================================
  // MAIN CONTAINER
  // ============================================
  container: {
    position: "absolute",
    bottom: 40,                                // Higher to avoid system nav buttons
    left: spacing.lg,                          // 24px from left
    right: spacing.lg,                         // 24px from right
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,             // 32px rounded
    paddingVertical: spacing.md,               // 16px vertical padding
    paddingHorizontal: spacing.lg,             // 24px horizontal padding
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadows.lg,
  },

  // ============================================
  // TAB BUTTON
  // ============================================
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,             // 16px horizontal padding
    paddingVertical: spacing.sm,               // 8px vertical padding
    borderRadius: borderRadius.lg,             // 24px rounded
  },
  tabActive: {
    backgroundColor: colors.primary.green,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabIconActive: {
    tintColor: colors.neutral.black,
  },
  tabIconInactive: {
    tintColor: colors.neutral.darkGray,
  },
  tabLabel: {
    marginLeft: spacing.sm,                    // 8px margin left
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,                     // 14px
    color: colors.text.primary,
  },

  // ============================================
  // EXPANDED STATE (with ReikoAI popup)
  // ============================================
  expandedContainer: {
    position: "absolute",
    bottom: 40,                                // Higher to avoid system nav buttons
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
    // Gradient border effect
    borderWidth: 2,
    borderColor: "transparent",
  },
  gradientBorder: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.xl + 2,
    zIndex: -1,
  },

  // ============================================
  // REIKO AI POPUP CONTENT
  // ============================================
  reikoHeader: {
    marginBottom: spacing.md,
  },
  reikoTitle: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.lg,                     // 18px
    color: colors.text.primary,
    fontStyle: "italic",
  },
  reikoMessage: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,                   // 16px
    color: colors.text.primary,
    lineHeight: 22,
  },
  reikoDivider: {
    height: 1,
    backgroundColor: colors.neutral.lightGray,
    marginVertical: spacing.md,
  },

  // ============================================
  // CAMERA/SPOT TAB EXPANDED
  // ============================================
  spotPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  spotThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.neutral.white,
    ...shadows.md,
  },
  captureButtonInner: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.green,
  },
});
