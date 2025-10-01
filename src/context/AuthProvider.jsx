import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authService from "../services/authService";
import supabaseAuthService from "../services/supabaseAuthService";
import userService from "../services/userService";
import { removeUserDetails, setUserDetails } from "../utils/storage";
import { useAppStates } from "./AppStates";
import { supabase } from "../data/supabaseClient";
import api from "../app/api/api";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const { markAppOpened } = useAppStates();
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState();
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check for existing Supabase session
      const sessionResponse = await supabaseAuthService.getSession();
     

      if (sessionResponse.success && sessionResponse.session) {

        setUser(sessionResponse.user);
        setUserData(sessionResponse.userData);
        setIsLoggedIn(true);
        setAuthToken(sessionResponse.session.access_token);
        setNeedsProfileSetup(sessionResponse.needsProfileSetup || false);
        await setUserDetails(sessionResponse.user);

        // Mark app as opened (not first time)
        await markAppOpened();


        // Note: Routing logic moved to index.tsx to prevent conflicts
        // The index.tsx will check userData and route appropriately
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      await logout(); // Clear any invalid tokens
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deep links
  const handleDeepLink = async (url) => {
    try {
      if (!url) return;


      // Check if this is an auth deep link - more permissive check
      if (url.includes("access_token") || url.includes("refresh_token")) {
        setIsLoading(true);

        // Process the deep link to extract tokens and set session
        const response = await supabaseAuthService.processDeepLink(url);

        if (response.success) {
          setUser(response.user);
          setIsLoggedIn(true);
          setUserData(response.userData);
          setAuthToken(response.session.access_token);
          setNeedsProfileSetup(response.needsProfileSetup || false);
          await setUserDetails(response.user);

          // Mark app as opened (not first time)
          await markAppOpened();

       

          // Note: Routing logic moved to index.tsx to prevent conflicts
          // The index.tsx will check userData and route appropriately
        } else {
          console.error("Deep link authentication failed:", response.message);
          setError(response.message || "Failed to authenticate");
        }

        setIsLoading(false);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Deep link handling error:", error);
      setError(error.message);
      setIsLoading(false);
      // setIsLoggedIn(false);
    }
  };

  // Check if user profile exists and redirect if needed
  const checkUserProfile = async (userId) => {
    try {
      const profileResponse = await supabaseAuthService.checkUserProfile(
        userId
      );

      if (profileResponse.success) {
        if (!profileResponse.exists) {
          // Profile doesn't exist, redirect to profile setup
          router.replace("/auth/profile-setup");
        }
      }
    } catch (error) {
      console.error("Profile check error:", error);
    }
  };

  // Login with email and password
  const loginWithPassword = async (email, password) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await supabaseAuthService.signInWithPassword(
        email,
        password
      );

      if (response.success) {
        setUser(response.user);
        setAuthToken(response.session.access_token);
        setIsLoggedIn(true);
        setUserData(response.userData);
        setNeedsProfileSetup(response.needsProfileSetup);

        // Store user details in AsyncStorage
        await setUserDetails(response.user);

        return { success: true };
      }

      throw new Error(response.message || "Password login failed");
    } catch (error) {
      console.error("Password login error:", error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login with phone and password
  const login = async (phoneNumber, password) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await authService.login(phoneNumber, password);

      if (response.success) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setAuthToken(response.token);
        await setUserDetails(response.data.user);
        return { success: true, user: response.data.user };
      }

      throw new Error(response.message || "Login failed");
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login with OTP
  const loginWithOTP = async (email, otp) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await authService.verifyOTP(email, otp, "login");

      if (response.success) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setAuthToken(response.token);
        await setUserDetails(response.data.user);
        return { success: true, user: response.data.user };
      }

      throw new Error(response.message || "OTP verification failed");
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Request OTP for login
  const requestLinkOTP = async (email) => {
    try {
      setError("");
      setIsLoading(true);

      // Use Supabase magic link
      const response = await supabaseAuthService.sendMagicLink(email);

      setIsLoading(false);
      return { success: response.success, message: response.message };
    } catch (error) {
      setError(error);
      setIsLoading(false);
      return { success: false, error: error };
    }
  };

  // Register with email and password
  const registerWithPassword = async (email, password) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await supabaseAuthService.signUpWithPassword(
        email,
        password
      );

      if (response.success) {
        setUser(response.user);
        if (response.session) {
          setAuthToken(response.session.access_token);
          setIsLoggedIn(true);
        }
        setUserData(null); // New user has no profile data yet
        setNeedsProfileSetup(response.needsProfileSetup);

        // Store user details in AsyncStorage
        await setUserDetails(response.user);

        return { success: true };
      }

      throw new Error(response.message || "Registration failed");
    } catch (error) {
      console.error("Password registration error:", error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await authService.register(userData);

      if (response.success) {
        // Don't auto-login after registration, require OTP verification
        return {
          success: true,
          message: response.message,
          requiresVerification: response.data?.requiresVerification,
        };
      }

      throw new Error(response.message || "Registration failed");
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP for registration
  const verifyRegistrationOTP = async (phoneNumber, otp) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await authService.verifyOTP(
        phoneNumber,
        otp,
        "registration"
      );

      if (response.success) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setAuthToken(response.token);
        await setUserDetails(response.data.user);
        return { success: true, user: response.data.user };
      }

      throw new Error(response.message || "OTP verification failed");
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError("");
      // If profileData contains a local image URI, upload it first
      const payload = { ...(profileData || {}) };
      try {
        const img = payload.profileImage;
        const looksLocal =
          img &&
          (img.startsWith("file:") ||
            img.startsWith("content:") ||
            img.startsWith("asset:") ||
            img.includes("/storage/"));
        if (looksLocal) {
          const uploadRes = await userService.uploadProfileImage(img);
          if (uploadRes && uploadRes.success) {
            // some APIs return imageUrl or data.imageUrl
            payload.profileImage =
              uploadRes.imageUrl ||
              uploadRes.data?.imageUrl ||
              payload.profileImage;
          } else {
            // continue but surface a warning
            console.warn(
              "Profile image upload failed or returned unexpected shape",
              uploadRes
            );
          }
        }
      } catch (uploadErr) {
        console.warn("Image upload failed", uploadErr);
        // continue to attempt profile update with original URI
      }

      const response = await userService.updateProfile(payload);

      if (response.success) {
        // Normalize the returned user object which may be under different keys
        const returnedUser =
          response.data?.user || response.data || response.user || null;
        if (returnedUser) {
          setUser(returnedUser);
          await setUserDetails(returnedUser);
          return { success: true, user: returnedUser };
        }

        // Fallback: if response.data looks like the user object itself
        if (response.data && typeof response.data === "object") {
          setUser(response.data);
          await setUserDetails(response.data);
          return { success: true, user: response.data };
        }

        // If we can't find the returned user object, still consider success but don't overwrite
        return { success: true, user: payload };
      }

      throw new Error(response.message || "Profile update failed");
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Logout
  const logout = async () => {
    try {
     


      // Sign out from Supabase
      await supabaseAuthService.signOut();
      setUser(null);
      setIsLoggedIn(false);
      setAuthToken("");
      await removeUserDetails();
      router.replace("/auth/sign-in");
      // Also call legacy logout if needed
      // await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Forgot password
  const forgotPassword = async (phoneNumber) => {
    try {
      setError("");
      const response = await authService.forgotPassword(phoneNumber);
      return { success: response.success, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (phoneNumber, otp, newPassword) => {
    try {
      setError("");
      const response = await authService.resetPassword(
        phoneNumber,
        otp,
        newPassword
      );
      return { success: response.success, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Set up deep link handler for when app is already open
    const subscription = Linking.addEventListener("url", (event) => {
      const url = event.url;

      // Force immediate processing of the deep link
      if (url) {
        // Use setTimeout to ensure this runs after the current execution context
        setTimeout(() => {
          handleDeepLink(url);
        }, 0);
      }
    });

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      authToken,
      isLoggedIn,
      isLoading,
      error,
      login,
      loginWithPassword,
      registerWithPassword,
      loginWithOTP,
      requestLinkOTP,
      register,
      verifyRegistrationOTP,
      updateProfile,
      updateUser,
      logout,
      forgotPassword,
      resetPassword,
      setError,
      userData,
      setUserData,
      needsProfileSetup,
      setNeedsProfileSetup,
    }),
    [user, authToken, isLoggedIn, isLoading, error, userData, needsProfileSetup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
