import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const AppStatesContext = createContext();

export const AppStatesProvider = ({ children }) => {
  const [isAppOpenedFirstTime, setIsAppOpenedFirstTime] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");

  const updateSelectedLocation = (location) => {
    setSelectedLocation(location);
  };

  useEffect(() => {
    const getAppFirstOpenState = async () => {
      const appFirstOpenState = await AsyncStorage.getItem("appFirstOpenState");
      setIsAppOpenedFirstTime(appFirstOpenState === null);
    };
    getAppFirstOpenState();
  }, []);

  useEffect(() => {
    const getProfileCompletedState = async () => {
      const profileCompletedState = await AsyncStorage.getItem("profileCompleted");
      setIsProfileCompleted(profileCompletedState === "true");
    };
    getProfileCompletedState();
  }, []);

  useEffect(() => {
    if (isAppOpenedFirstTime === false) {
      const setAppFirstOpenState = async () => {
        await AsyncStorage.setItem("appFirstOpenState", "false");
      };
      setAppFirstOpenState();
    }
  }, [isAppOpenedFirstTime]);

  const markProfileCompleted = async () => {
    await AsyncStorage.setItem("profileCompleted", "true");
    setIsProfileCompleted(true);
  };

  return (
    <AppStatesContext.Provider
      value={{ 
        isAppOpenedFirstTime, 
        setIsAppOpenedFirstTime,
        isProfileCompleted,
        setIsProfileCompleted,
        markProfileCompleted,
        selectedLocation,
        updateSelectedLocation
      }}
    >
      {children}
    </AppStatesContext.Provider>
  );
};

export const useAppStates = () => useContext(AppStatesContext);
