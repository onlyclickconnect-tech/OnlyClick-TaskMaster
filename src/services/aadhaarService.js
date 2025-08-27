
// All backend calls removed. Using dummy data only.

class AadhaarService {
  // Verify Aadhaar number
  async verifyAadhaar(aadhaarNumber) {
    return Promise.resolve({ success: true, verified: true });
  }

  // Get verification status
  async getVerificationStatus(verificationId) {
    return Promise.resolve({ success: true, status: 'verified' });
  }
}

export default new AadhaarService();
