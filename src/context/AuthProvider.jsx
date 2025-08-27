import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import userService from "../services/userService";
import { removeUserDetails, setUserDetails } from "../utils/storage";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data.user);
          setIsLoggedIn(true);
          await setUserDetails(userResponse.data.user);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await logout(); // Clear any invalid tokens
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
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login with OTP
  const loginWithOTP = async (phoneNumber, otp) => {
    try {
      setError("");
      setIsLoading(true);
      
      const response = await authService.verifyOTP(phoneNumber, otp, 'login');
      
      if (response.success) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setAuthToken(response.token);
        await setUserDetails(response.data.user);
        return { success: true, user: response.data.user };
      }
      
      throw new Error(response.message || 'OTP verification failed');
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Request OTP for login
  const requestOTP = async (phoneNumber) => {
    try {
      setError("");
      const response = await authService.requestOTPLogin(phoneNumber);
      return { success: response.success, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
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
          requiresVerification: response.data?.requiresVerification 
        };
      }
      
      throw new Error(response.message || 'Registration failed');
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
      
      const response = await authService.verifyOTP(phoneNumber, otp, 'registration');
      
      if (response.success) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setAuthToken(response.token);
        await setUserDetails(response.data.user);
        return { success: true, user: response.data.user };
      }
      
      throw new Error(response.message || 'OTP verification failed');
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
        const looksLocal = img && (img.startsWith('file:') || img.startsWith('content:') || img.startsWith('asset:') || img.includes('/storage/'));
        if (looksLocal) {
          const uploadRes = await userService.uploadProfileImage(img);
          if (uploadRes && uploadRes.success) {
            // some APIs return imageUrl or data.imageUrl
            payload.profileImage = uploadRes.imageUrl || uploadRes.data?.imageUrl || payload.profileImage;
          } else {
            // continue but surface a warning
            console.warn('Profile image upload failed or returned unexpected shape', uploadRes);
          }
        }
      } catch (uploadErr) {
        console.warn('Image upload failed', uploadErr);
        // continue to attempt profile update with original URI
      }

      const response = await userService.updateProfile(payload);

      if (response.success) {
        // Normalize the returned user object which may be under different keys
        const returnedUser = response.data?.user || response.data || response.user || null;
        if (returnedUser) {
          setUser(returnedUser);
          await setUserDetails(returnedUser);
          return { success: true, user: returnedUser };
        }

        // Fallback: if response.data looks like the user object itself
        if (response.data && typeof response.data === 'object') {
          setUser(response.data);
          await setUserDetails(response.data);
          return { success: true, user: response.data };
        }

        // If we can't find the returned user object, still consider success but don't overwrite
        return { success: true, user: payload };
      }

      throw new Error(response.message || 'Profile update failed');
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setAuthToken("");
      await removeUserDetails();
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
      const response = await authService.resetPassword(phoneNumber, otp, newPassword);
      return { success: response.success, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value = useMemo(() => ({
    user,
    authToken,
    isLoggedIn,
    isLoading,
    error,
    login,
    loginWithOTP,
    requestOTP,
    register,
    verifyRegistrationOTP,
    updateProfile,
    logout,
    forgotPassword,
    resetPassword,
    setError,
  }), [user, authToken, isLoggedIn, isLoading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
