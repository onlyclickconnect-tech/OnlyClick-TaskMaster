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
        console.log("App first open state from storage:", appFirstOpenState);
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
        console.log("Profile completed state from storage:", profileCompletedState);
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
          console.log("App first open state set to:", isAppOpenedFirstTime ? "true" : "false");
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
    console.log("App marked as not first time open");
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
