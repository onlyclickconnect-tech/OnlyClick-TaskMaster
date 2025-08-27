
// All backend calls removed. Using dummy data only.

class BookingService {
  // Create new booking
  async createBooking(bookingData) {
    return Promise.resolve({ success: true, data: { ...bookingData, id: 1 } });
  }

  // Get booking by ID
  async getBookingById(bookingId) {
    return Promise.resolve({ success: true, data: { id: bookingId, service: 'Cleaning', date: '2025-08-10', status: 'completed' } });
  }

  // Update booking
  async updateBooking(bookingId, updateData) {
    return Promise.resolve({ success: true, data: { ...updateData, id: bookingId } });
  }

  // Cancel booking
  async cancelBooking(bookingId, reason) {
    return Promise.resolve({ success: true });
  }

  // Rate booking
  async rateBooking(bookingId, rating, review) {
    return Promise.resolve({ success: true });
  }

  // Get service pricing
  async getServicePricing(category, subcategory, serviceType, pincode) {
    return Promise.resolve({ success: true, data: { price: 100 } });
  }
}

export default new BookingService();
