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
      try {
        const appFirstOpenState = await AsyncStorage.getItem("appFirstOpenState");
        setIsAppOpenedFirstTime(appFirstOpenState !== "false");
      } catch (error) {
        console.error("Error getting app first open state:", error);
        setIsAppOpenedFirstTime(true);
      }
    };
    getAppFirstOpenState();
  }, []);

  useEffect(() => {
    const getProfileCompletedState = async () => {
      try {
        const profileCompletedState = await AsyncStorage.getItem("profileCompleted");
        setIsProfileCompleted(profileCompletedState === "true");
      } catch (error) {
        console.error("Error getting profile completed state:", error);
        setIsProfileCompleted(false);
      }
    };
    getProfileCompletedState();
  }, []);

  useEffect(() => {
    if (isAppOpenedFirstTime !== null) {
      const setAppFirstOpenState = async () => {
        try {
          await AsyncStorage.setItem("appFirstOpenState", isAppOpenedFirstTime ? "true" : "false");
        } catch (error) {
          console.error("Error setting app first open state:", error);
        }
      };
      setAppFirstOpenState();
    }
  }, [isAppOpenedFirstTime]);

  const markProfileCompleted = async () => {
    await AsyncStorage.setItem("profileCompleted", "true");
    setIsProfileCompleted(true);
  };
  
  const markAppOpened = async () => {
    await AsyncStorage.setItem("appFirstOpenState", "false");
    setIsAppOpenedFirstTime(false);
  };

  return (
    <AppStatesContext.Provider
      value={{ 
        isAppOpenedFirstTime, 
        setIsAppOpenedFirstTime,
        isProfileCompleted,
        setIsProfileCompleted,
        markProfileCompleted,
        markAppOpened,
        selectedLocation,
        updateSelectedLocation
      }}
    >
      {children}
    </AppStatesContext.Provider>
  );
};

export const useAppStates = () => useContext(AppStatesContext);
