// All backend calls removed. Using dummy data only.
import { DEV_CONFIG, simulateDelay } from '../config/development';
// import apiService from './apiService';
import smsService from './smsService';

class AuthService {
  // Register user
  async register(userData) {
    return Promise.resolve({ success: true, data: { token: 'dummy-token', user: { id: 2, ...userData } } });
  }

  // Login with password
  async login(phoneNumber, password) {
    return Promise.resolve({ success: true, data: { token: 'dummy-token', user: { id: 1, name: 'John Doe', email: phoneNumber } } });
  }

  // Request OTP for login
  async requestOTPLogin(phoneNumber) {
    // Always use dummy data - simulate successful OTP send
    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);
    const otp = smsService.generateOTP(4);
    const smsResult = await smsService.sendOTP(formattedPhone, otp, 'login');
    
    return {
      success: true,
      message: `OTP sent to ${formattedPhone} (Dummy Mode)`,
      data: {
        phoneNumber: formattedPhone,
        otpSent: true,
        expiresIn: 600, // 10 minutes
        provider: 'dummy',
        devOTP: otp
      }
    };
  }

  // Verify OTP
  async verifyOTP(phoneNumber, otp, purpose = 'login') {
    // Always use dummy data - simulate successful verification
    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);
    const verificationResult = await smsService.verifyOTP(formattedPhone, otp);
    
    // Generate a mock user and token
    const mockUser = DEV_CONFIG.MOCK_USER;
    const mockToken = 'dummy_token_' + Date.now();
    
    return {
      success: true,
      message: 'OTP verified successfully',
      token: mockToken,
      data: {
        user: mockUser
      }
    };
  }

  // Get current user
  async getCurrentUser() {
    // Always return dummy user
    await simulateDelay(300);
    return {
      success: true,
      data: {
        user: DEV_CONFIG.MOCK_USER
      }
    };
  }

  // Logout
  async logout() {
    return Promise.resolve({ success: true });
  }

  // Forgot password
  async forgotPassword(phoneNumber) {
    return Promise.resolve({ success: true, message: 'Reset OTP sent (dummy)' });
  }

  // Reset password
  async resetPassword(phoneNumber, otp, newPassword) {
    return Promise.resolve({ success: true, message: 'Password reset successful (dummy)' });
  }

  // Check if user is authenticated
  async isAuthenticated() {
    // For development purposes, we should check if there's a valid session
    // instead of always returning true
    console.log('Checking authentication status...');
    
    // Check if we have a stored token or session
    try {
      // In a real app, we would check for a valid token
      // For now, return false to force login
      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}

export default new AuthService();
