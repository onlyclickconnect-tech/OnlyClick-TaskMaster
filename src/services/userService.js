
// All backend calls removed. Using dummy data only.

class UserService {
  // Get user profile
  async getProfile() {
    // Dummy user profile data
    return Promise.resolve({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          avatar: null,
          stats: { jobs: 5, earnings: 1000 },
        }
      }
    });
  }

  // Update user profile
  async updateProfile(profileData) {
  // Return a user-like object under data.user to match AuthProvider expectations
  return Promise.resolve({ success: true, data: { user: { ...profileData, id: 1 } } });
  }

  // Upload profile image
  async uploadProfileImage(imageUri) {
  return Promise.resolve({ success: true, imageUrl: 'https://dummyimage.com/100x100/000/fff', data: { imageUrl: 'https://dummyimage.com/100x100/000/fff' } });
  }

  // Get user bookings
  async getUserBookings(params = {}) {
    return Promise.resolve({
      success: true,
      data: {
        bookings: [
          { id: 1, service: 'Cleaning', date: '2025-08-10', status: 'completed' },
          { id: 2, service: 'Plumbing', date: '2025-08-09', status: 'pending' },
        ],
        totalCount: 2,
        currentPage: 1,
        totalPages: 1
      }
    });
  }

  // Get user statistics
  async getUserStats() {
    return Promise.resolve({ success: true, data: { jobs: 5, earnings: 1000 } });
  }

  // Add device token for push notifications
  async addDeviceToken(deviceToken) {
    return Promise.resolve({ success: true });
  }

  // Remove device token
  async removeDeviceToken(deviceToken) {
    return Promise.resolve({ success: true });
  }

  // Deactivate account
  async deactivateAccount(reason) {
    return Promise.resolve({ success: true });
  }
}

export default new UserService();
