/**
 * SPOT SCREEN STYLES
 * Camera screen for capturing pollution spots
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

export const spotStyles = StyleSheet.create({
  // ============================================
  // MAIN CONTAINER
  // ============================================
  container: {
    flex: 1,
    backgroundColor: colors.neutral.black,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: colors.neutral.black,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraPlaceholderText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.neutral.white,
  },

  // ============================================
  // TOP CONTROLS
  // ============================================
  topControls: {
    position: "absolute",
    top: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  flashIcon: {
    width: 24,
    height: 24,
    tintColor: colors.neutral.white,
  },

  // ============================================
  // BOTTOM SECTION (in bottom nav)
  // ============================================
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  // ============================================
  // PREVIEW SECTION
  // ============================================
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  previewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.neutral.white,
    ...shadows.lg,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.green,
  },

  // ============================================
  // POST-CAPTURE SCREEN
  // ============================================
  capturedImageContainer: {
    flex: 1,
    backgroundColor: colors.neutral.black,
  },
  capturedImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  capturedOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  capturedActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  retakeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral.white,
    alignItems: "center",
  },
  retakeButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.neutral.white,
  },
  usePhotoButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.green,
    alignItems: "center",
  },
  usePhotoButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },

  // ============================================
  // SPOT FORM (after capture)
  // ============================================
  formContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  formTitle: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize["2xl"],
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  formImagePreview: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  
  // Pollution type selector
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeOptionActive: {
    backgroundColor: colors.primary.green,
    borderColor: colors.primary.green,
  },
  typeOptionText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  typeOptionTextActive: {
    color: colors.text.primary,
  },

  // Severity selector
  severitySelector: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  severityOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  severityOptionActive: {
    borderColor: colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
  severityOptionText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  severityOptionTextActive: {
    color: colors.text.primary,
  },

  // Submit button
  submitButton: {
    backgroundColor: colors.primary.green,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.md,
  },
  submitButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
});
