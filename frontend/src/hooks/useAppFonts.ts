import { useFonts } from "expo-font";

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    // Jost static fonts
    "Jost-Light": require("../../assets/fonts/Jost/Jost-Light.ttf"),
    "Jost-Regular": require("../../assets/fonts/Jost/Jost-Regular.ttf"),
    "Jost-Medium": require("../../assets/fonts/Jost/Jost-Medium.ttf"),
    "Jost-SemiBold": require("../../assets/fonts/Jost/Jost-SemiBold.ttf"),
    "Jost-Bold": require("../../assets/fonts/Jost/Jost-Bold.ttf"),
    "Jost-ExtraBold": require("../../assets/fonts/Jost/Jost-ExtraBold.ttf"),
    "Jost-Italic": require("../../assets/fonts/Jost/Jost-Italic.ttf"),
    // MuseoModerno static fonts
    "MuseoModerno-Light": require("../../assets/fonts/MuseoModerno/MuseoModerno-Light.ttf"),
    "MuseoModerno-Regular": require("../../assets/fonts/MuseoModerno/MuseoModerno-Regular.ttf"),
    "MuseoModerno-Medium": require("../../assets/fonts/MuseoModerno/MuseoModerno-Medium.ttf"),
    "MuseoModerno-SemiBold": require("../../assets/fonts/MuseoModerno/MuseoModerno-SemiBold.ttf"),
    "MuseoModerno-Bold": require("../../assets/fonts/MuseoModerno/MuseoModerno-Bold.ttf"),
    "MuseoModerno-ExtraBold": require("../../assets/fonts/MuseoModerno/MuseoModerno-ExtraBold.ttf"),
  });

  return fontsLoaded;
};
