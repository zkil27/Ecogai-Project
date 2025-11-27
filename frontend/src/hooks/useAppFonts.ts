import { useFonts } from "expo-font";

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    Jost: require("../../assets/fonts/Jost-VariableFont_wght.ttf"),
    "Jost-Italic": require("../../assets/fonts/Jost-Italic-VariableFont_wght.ttf"),
    "MuseoModerno": require("../../assets/fonts/MuseoModerno-VariableFont_wght.ttf"),
    "MuseoModerno-Italic": require("../../assets/fonts/MuseoModerno-Italic-VariableFont_wght.ttf"),
  });

  return fontsLoaded;
};
