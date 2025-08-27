
// All backend calls removed. Using dummy data only.

class TaskmasterService {
  // Create taskmaster profile
  async createTaskmasterProfile(profileData) {
    return Promise.resolve({ success: true, data: { ...profileData, id: 1 } });
  }

  // Get all taskmasters with filters
  async getTaskmasters(params = {}) {
    return Promise.resolve({
      success: true,
      data: [
        { id: 1, name: 'Alice', service: 'Cleaning', rating: 4.8 },
        { id: 2, name: 'Bob', service: 'Plumbing', rating: 4.5 },
      ]
    });
  }

  // Get taskmaster by ID
  async getTaskmasterById(taskmasterId) {
    return Promise.resolve({
      success: true,
      data: { id: taskmasterId, name: 'Alice', service: 'Cleaning', rating: 4.8 }
    });
  }

  // Update taskmaster profile
  async updateTaskmaster(taskmasterId, updateData) {
    return Promise.resolve({ success: true, data: { ...updateData, id: taskmasterId } });
  }

  // Get nearby taskmasters
  async getNearbyTaskmasters(latitude, longitude, params = {}) {
    return Promise.resolve({
      success: true,
      data: [
        { id: 1, name: 'Alice', lat: latitude, lng: longitude, service: 'Cleaning' },
        { id: 2, name: 'Bob', lat: latitude + 0.01, lng: longitude + 0.01, service: 'Plumbing' },
      ]
    });
  }

  // Get taskmaster jobs
  async getTaskmasterJobs(taskmasterId, params = {}) {
    return Promise.resolve({
      success: true,
      data: [
        { id: 1, job: 'Fix sink', status: 'completed' },
        { id: 2, job: 'Clean house', status: 'pending' },
      ]
    });
  }

  // Get taskmaster statistics
  async getTaskmasterStats(taskmasterId) {
    return Promise.resolve({ success: true, data: { jobs: 10, earnings: 2000 } });
  }

  // Search taskmasters by service
  async searchByService(category, location, params = {}) {
    return Promise.resolve({
      success: true,
      data: [
        { id: 1, name: 'Alice', service: category, city: location },
        { id: 2, name: 'Bob', service: category, city: location },
      ]
    });
  }
}

export default new TaskmasterService();
