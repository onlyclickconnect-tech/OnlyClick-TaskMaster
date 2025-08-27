// Location service using Expo Location with dummy fallbacks

import * as Location from 'expo-location';

class LocationService {
  // Get current location using Expo Location
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Return dummy location if permission denied
        return this.getDummyLocation();
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        success: true,
        data: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy
        }
      };
    } catch (error) {
      // Fallback to dummy location
      return this.getDummyLocation();
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(latitude, longitude) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return this.getDummyAddress();
      }

      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        const formattedAddress = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
        return {
          success: true,
          data: {
            address: formattedAddress,
            city: addr.city,
            region: addr.region,
            country: addr.country
          }
        };
      }
      
      return this.getDummyAddress();
    } catch (error) {
      return this.getDummyAddress();
    }
  }

  // Get current location with address
  async getCurrentLocationWithAddress() {
    try {
      const locationResult = await this.getCurrentLocation();
      if (locationResult.success) {
        const addressResult = await this.reverseGeocode(
          locationResult.data.latitude,
          locationResult.data.longitude
        );
        
        return {
          success: true,
          data: {
            ...locationResult.data,
            ...addressResult.data
          }
        };
      }
      
      return this.getDummyLocationWithAddress();
    } catch (error) {
      return this.getDummyLocationWithAddress();
    }
  }

  // Dummy location for fallback
  getDummyLocation() {
    return {
      success: true,
      data: {
        latitude: 28.6139,  // New Delhi coordinates
        longitude: 77.2090,
        accuracy: 100
      }
    };
  }

  // Dummy address for fallback
  getDummyAddress() {
    return {
      success: true,
      data: {
        address: 'Connaught Place, New Delhi, Delhi',
        city: 'New Delhi',
        region: 'Delhi',
        country: 'India'
      }
    };
  }

  // Dummy location with address
  getDummyLocationWithAddress() {
    return {
      success: true,
      data: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 100,
        address: 'Connaught Place, New Delhi, Delhi',
        city: 'New Delhi',
        region: 'Delhi',
        country: 'India'
      }
    };
  }

  // Get nearby locations (dummy data)
  async getNearbyLocations(latitude, longitude, radius = 5) {
    return Promise.resolve({
      success: true,
      data: [
        { id: 1, name: 'Location 1', lat: latitude + 0.01, lng: longitude + 0.01 },
        { id: 2, name: 'Location 2', lat: latitude - 0.01, lng: longitude - 0.01 },
        { id: 3, name: 'Location 3', lat: latitude + 0.02, lng: longitude - 0.02 },
      ]
    });
  }
}

export default new LocationService();
