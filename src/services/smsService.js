// All backend calls removed. Using dummy data only.

class SmsService {
  // Alias for verifyOtp to support both naming conventions
  async verifyOTP(phoneNumber, otp) {
    return Promise.resolve({ success: true });
  }
  // Alias for sendOtp to support both naming conventions
  async sendOTP(phoneNumber, otp, purpose) {
    // Ignore otp and purpose for dummy, just call sendOtp
    return this.sendOtp(phoneNumber);
  }
  // Always returns true for any phone number
  isValidPhoneNumber(phoneNumber) {
    return true;
  }

  // Returns the phone number as-is (no formatting)
  formatPhoneNumber(phoneNumber) {
    return phoneNumber;
  }

  // Returns a fixed OTP for testing
  generateOTP(length = 4) {
    return '1234'.padEnd(length, '0');
  }

  // Send OTP
  async sendOtp(phoneNumber) {
    return Promise.resolve({ success: true, otp: '123456' });
  }

  // Verify OTP
  async verifyOtp(phoneNumber, otp) {
    return Promise.resolve({ success: true });
  }
}

export default new SmsService();
