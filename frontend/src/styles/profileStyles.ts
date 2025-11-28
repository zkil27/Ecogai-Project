/**
 * PROFILE SCREEN STYLES
 * User profile and settings
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

export const profileStyles = StyleSheet.create({
  // ============================================
  // MAIN CONTAINER
  // ============================================
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 120,                        // Space for bottom nav
  },

  // ============================================
  // HEADER
  // ============================================
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: colors.neutral.darkGray,
    backgroundColor: colors.neutral.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize["4xl"],
    color: colors.primary.green,
  },
  userName: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize["2xl"],
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  editProfileButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.green,
  },
  editProfileButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.primary.green,
  },

  // ============================================
  // STATS SECTION
  // ============================================
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize["2xl"],
    color: colors.primary.green,
  },
  statLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral.lightGray,
    marginHorizontal: spacing.md,
  },

  // ============================================
  // MENU SECTIONS
  // ============================================
  menuSection: {
    marginBottom: spacing.xl,
  },
  menuSectionTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textTransform: "uppercase",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: spacing.md,
    tintColor: colors.neutral.darkGray,
  },
  menuItemText: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  menuItemArrow: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    color: colors.neutral.gray,
  },
  menuItemDanger: {
    color: "#E53935",                          // Red for logout/delete
  },

  // ============================================
  // SETTINGS TOGGLE
  // ============================================
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  toggleLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },

  // ============================================
  // LOGOUT BUTTON
  // ============================================
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#E53935",
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
    color: "#E53935",
    marginLeft: spacing.sm,
  },
});
