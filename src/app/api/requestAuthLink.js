import api from "./api";

export const requestAuthLink = async (email) => {
  try {
    const { data, error } = await api.post('api/v1/tmauth', { email });

    if (error) {
      throw error
    }
    // Check for successful response
    if (data.success && data.data) {
      return {
        data: data.data, // This contains { message: "Magic link sent" }
        success: true
      };
    }

    console.log(data);
    // If response doesn't have expected structure
    throw new Error(data.data.message || 'Failed to send magic link');

  } catch (error) {
    console.log("requestAuthLink error:", error.message);
    return {
      error: error || 'Network error',
      success: false
    };
  }
};
