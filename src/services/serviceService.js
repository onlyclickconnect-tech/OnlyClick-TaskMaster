
// All backend calls removed. Using dummy data only.

class ServiceService {
  // Get services based on category (niche)
  async getServicesByCategory(category) {
    // Always use dummy data
    return this.getServicesByCategory_Dev(category);
  }

  // Get all available services
  async getAllServices() {
    // Always use dummy data
    return this.getAllServices_Dev();
  }

  // Development mode - return mock service data
  getServicesByCategory_Dev(category) {
    // use the centralized services data module in dev mode
    const { getServicesByCategory } = require('../data/servicesData');
    const services = getServicesByCategory(category);
    return {
      success: true,
      data: {
        category,
        services,
        totalServices: services.length
      }
    };
  }

  getAllServices_Dev() {
    const allServices = [];
    const categories = ['Electrician', 'Plumber', 'Cleaner', 'Carpenter', 'Painting', 'AC'];
    
    categories.forEach(category => {
      const categoryData = this.getServicesByCategory_Dev(category);
      if (categoryData.success) {
        allServices.push(...categoryData.data.services.map(service => ({
          ...service,
          categoryName: category
        })));
      }
    });

    return {
      success: true,
      data: {
        services: allServices,
        totalServices: allServices.length,
        categories: categories
      }
    };
  }
}

export default new ServiceService();
