import { useMemo } from "react";
import { Dimensions } from "react-native";
export default function useDimension() {
  const screenHeight = Dimensions.get("screen").height;
  const screenWidth = Dimensions.get("screen").width;
  const value = useMemo(
    () => ({ screenHeight, screenWidth }),
    [screenHeight, screenWidth]
  );
  return { ...value };
}
