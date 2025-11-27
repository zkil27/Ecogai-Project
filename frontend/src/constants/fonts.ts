// Font configuration for Ecogai app

export const fonts = {
  jost: {
    regular: "Jost",
    italic: "Jost-Italic",
  },
  museoModerno: {
    regular: "MuseoModerno",
    italic: "MuseoModerno-Italic",
  },
};

// Font weights mapping for variable fonts
// Use these with fontWeight style property
export const fontWeights = {
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  extraBold: "800",
  black: "900",
};

// Helper function to get font family
export const getFontFamily = (
  family: "jost" | "museoModerno" = "jost",
  italic: boolean = false
) => {
  return italic ? fonts[family].italic : fonts[family].regular;
};

// Export for easy use in styles
export default fonts;
