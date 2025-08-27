import AsyncStorage from "@react-native-async-storage/async-storage";
export const getTheme = async () => {
  const theme = await AsyncStorage.getItem("theme");
  return theme;
};

export const setStoredTheme = async (theme) => {
  await AsyncStorage.setItem("theme", theme);
};

export const getAppFirstOpenState = async () => {
  const appFirstOpenState = await AsyncStorage.getItem("appFirstOpenState");
  return appFirstOpenState;
};

export const setAppFirstOpenState = async () => {
  await AsyncStorage.setItem("appFirstOpenState", true);
};

export const getUserDetails = async () => {
  const userDetails = await AsyncStorage.getItem("userDetails");
  return userDetails;
};
export const setUserDetails = async (userDetails) => {
  await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
};

export const getCartDeatails = async () => {
  const cartItems = await AsyncStorage.getItem("cartItems");
  return cartItems ? JSON.parse(cartItems) : [];
};

export const setCartDeatails = async (cartItems) => {
  await AsyncStorage.setItem("cartItems", JSON.stringify(cartItems));
};

export const appOpenedFirstTime = async () => {
  const appOpenedFirstTime = await AsyncStorage.getItem("appOpenedFirstTime");
  return appOpenedFirstTime;
};

export const setAppOpenedFirstTime = async () => {
  await AsyncStorage.setItem("appOpenedFirstTime", true);
};
