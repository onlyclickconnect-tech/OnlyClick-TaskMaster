import api from '../app/api/api.js';
import { requestAuthLink } from '../app/api/requestAuthLink.js';
import { updateTM } from '../app/api/updateTM.js';
import { supabase } from '../data/supabaseClient';

class SupabaseAuthService {
  // Sign in with email and password
  async signInWithPassword(ph_no, password) {
    try {
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${ph_no}@taskmaster.com`,
        password,
      });

      if (error) throw error;

      if (!data.session || !data.user) {
        throw new Error('No session or user returned from authentication');
      }


      // Get user data from taskmaster table
      const { data: userData, error: userDataError } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .select('*')
        .eq('tm_id', data.user.id)
        .single();

      if (userDataError && userDataError.code !== 'PGRST116') {
      }

      // Determine if user needs profile setup
      let needsProfileSetup = false;
      if (!userData || !userData.name || !userData.ph_no) {
        needsProfileSetup = true;
      }


      return {
        success: true,
        session: data.session,
        user: data.user,
        userData: userData,
        needsProfileSetup: needsProfileSetup
      };

    } catch (error) {
      console.error('Error signing in with password:', error.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }

  // Register with email and password
  async signUpWithPassword(email, password) {
    try {
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user returned from registration');
      }


      return {
        success: true,
        session: data.session,
        user: data.user,
        needsProfileSetup: true // New users always need profile setup
      };

    } catch (error) {
      console.error('Error signing up with password:', error.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }

  // Send magic link to email
  async sendMagicLink(email) {
    try {
      // const { data, error } = await supabase.auth.signInWithOtp({
      //   email,
      //   options: {
      //     emailRedirectTo: "onlyclicktaskmaster://auth/callback"
      //   },
      // });

      const response = await requestAuthLink(email);

      if (response.error || !response.success) {
        throw new Error(response.error || 'Failed to send magic link');
      }


      return {
        success: true,
        message: response.data.message || `Magic link sent to ${email}`,
        data: response.data
      };

    } catch (error) {
      console.error('Error sending magic link:', error?.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }

  // Process deep link and extract tokens
  async processDeepLink(url) {
    try {

      // Extract the access_token and refresh_token from the URL
      const extractTokenInfo = (url) => {
        if (url.includes("access_token") || url.includes("refresh_token")) {

          try {
            // Extract tokens from URL
            const accessTokenMatch = url.match(/access_token=([^&]+)/);
            const refreshTokenMatch = url.match(/refresh_token=([^&]+)/);

            if (accessTokenMatch && refreshTokenMatch) {
              const access_token = decodeURIComponent(accessTokenMatch[1]);
              const refresh_token = decodeURIComponent(refreshTokenMatch[1]);


              return { access_token, refresh_token };
            }
          } catch (error) {
            console.error('Error extracting tokens from URL:', error.message);
            return null;
          }
        }
        return null;
      };

      const tokens = extractTokenInfo(url);

      if (!tokens || !tokens.access_token) {
        throw new Error('No valid tokens found in URL');
      }

      // Set the session with the extracted tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      if (error) throw error;


      
      // Try to get user data from taskmaster table
      const { error: callbackError, isNewUser } = await api.post('/api/v1/tmcallback', { access_token: tokens.access_token })

      if (callbackError) throw callbackError



      const { data: userData, error: userDataError } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .select('*')
        .eq('tm_id', data?.session?.user?.id)
        .single()


      if (userDataError) {
        throw userDataError;
      }



      return {
        success: true,
        session: data.session,
        user: data.user,
        userData: userData,
        needsProfileSetup: isNewUser
      };
    } catch (error) {
      console.error('Error processing deep link:', error.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Supabase session error:', error.message);
        throw error;
      }
      if (!data.session) {
        return {
          success: false,
          message: error?.message,
          error
        };
      }
      // Try to get user data from taskmaster table
      const { data: userData, error: userDataError } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .select('*')
        .eq('tm_id', data?.session?.user?.id)
        .single()

      if (userDataError) throw userDataError;

      let needsProfileSetup;

      if (!userData.name || !userData.ph_no) {
        needsProfileSetup = true
      }
      else {
        needsProfileSetup = false
      }




      return {
        success: true,
        session: data?.session,
        user: data?.session?.user,
        userData: userData,
        needsProfileSetup: needsProfileSetup
      };
    } catch (error) {
      console.error('Error getting session:', error?.message);
      return {
        success: false,
        message: error?.message,
        error
      };
    }
  }

  // Check if user profile exists
  async checkUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .select('name')
        .eq('tm_id', userId)
        .single();


      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        throw error;
      }

      // Check if profile exists and has a name (since column is named 'name' not 'tm_name')
      const hasProfile = data && data.name;

      return {
        success: true,
        exists: !!hasProfile,
        profile: data
      };

    } catch (error) {
      console.error('Error checking user profile:', error.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }

  // Create or update user profile
  async saveUserProfile(profileData) {
    try {
      const { data, error } = await updateTM(profileData)

      if (error) throw error;


      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Error saving user profile:', error.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error.message);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }
}

export default new SupabaseAuthService();