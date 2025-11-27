/**
 * HOME SCREEN STYLES
 * Main map view with search bar
 */

import { StyleSheet, Dimensions } from "react-native";
import {
  colors,
  fontFamily,
  fontSize,
  spacing,
  borderRadius,
  shadows,
} from "./theme";

const { width, height } = Dimensions.get("window");

export const homeStyles = StyleSheet.create({
  // ============================================
  // MAIN CONTAINER
  // ============================================
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // ============================================
  // SEARCH BAR
  // ============================================
  searchContainer: {
    position: "absolute",
    top: spacing.xxl + spacing.md,           // 64px from top (below status bar)
    left: spacing.lg,                         // 24px from left
    right: spacing.lg,                        // 24px from right
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,            // 32px rounded
    paddingHorizontal: spacing.lg,            // 24px horizontal padding
    paddingVertical: spacing.md,              // 16px vertical padding
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    ...shadows.md,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: spacing.sm,                  // 8px margin right
    tintColor: colors.neutral.gray,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,                  // 16px
    color: colors.text.primary,
  },
  searchPlaceholder: {
    color: colors.neutral.gray,
  },

  // ============================================
  // LOCATION MARKER
  // ============================================
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerIcon: {
    width: 40,
    height: 40,
  },

  // ============================================
  // LOADING STATE
  // ============================================
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },

  // ============================================
  // ERROR STATE
  // ============================================
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },

  // ============================================
  // CURRENT LOCATION BUTTON
  // ============================================
  locationButton: {
    position: "absolute",
    bottom: spacing.xxl + 100,                // Above bottom nav
    right: spacing.lg,
    backgroundColor: colors.neutral.white,
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  locationButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary.green,
  },

  // ============================================
  // SEARCH RESULTS DROPDOWN
  // ============================================
  searchResultsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    maxHeight: 250,
    ...shadows.md,
  },
  searchResultsList: {
    borderRadius: borderRadius.lg,
  },
  searchResultItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  searchResultText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  searchResultSubtext: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // ============================================
  // SPOTS LOADING INDICATOR
  // ============================================
  spotsLoadingContainer: {
    position: "absolute",
    top: spacing.xxl + spacing.md + 60,       // Below search bar
    alignSelf: "center",
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
});
