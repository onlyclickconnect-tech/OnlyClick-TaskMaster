import { requestAuthLink } from '../app/api/requestAuthLink.js';
import { supabase } from '../data/supabaseClient';

class SupabaseAuthService {
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

      console.log("Link sent successfully:", response.data.message);

      return {
        success: true,
        message: response.data.message || `Magic link sent to ${email}`,
        data: response.data
      };

    } catch (error) {
      console.error('Error sending magic link:', error?.message);
      return {
        success: false,
        message: error?.message,
        error
      };
    }
  }

  // Process deep link and extract tokens
  async processDeepLink(url) {
    try {
      console.log('Processing deep link:', url);

      // Extract the access_token and refresh_token from the URL
      const extractTokenInfo = (url) => {
        if (url.includes("access_token") || url.includes("refresh_token")) {
          console.log("Processing magic link:", url);

          try {
            // Extract tokens from URL
            const accessTokenMatch = url.match(/access_token=([^&]+)/);
            const refreshTokenMatch = url.match(/refresh_token=([^&]+)/);

            if (accessTokenMatch && refreshTokenMatch) {
              const access_token = decodeURIComponent(accessTokenMatch[1]);
              const refresh_token = decodeURIComponent(refreshTokenMatch[1]);

              console.log("Access token from supaAuthService: ", access_token)
              console.log("Refresh token from supaAuthService: ", refresh_token)

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
      console.log('Setting Supabase session with tokens');
      const { data, error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      if (error) throw error;

      // Try to get user data from taskmaster table
      const { data: userData, error: userDataError } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .select('*')
        .eq('tm_id', data?.session?.user?.id)
        .single()

      // Handle case where user doesn't exist in taskmaster table
      if (userDataError) {
        if (userDataError.code === 'PGRST116') {
          // No rows returned - user doesn't exist in taskmaster table
          console.log('User not found in taskmaster table, needs profile setup');
          return {
            success: true,
            session: data.session,
            user: data.user,
            userData: null,
            needsProfileSetup: true
          };
        } else {
          // Other database error
          console.log('Supabase user check error (processDeepLink): ', userDataError.message);
          throw userDataError;
        }
      }

      console.log("userData from processDeepLink:", JSON.stringify(userData, null, 2));

      console.log('Session set successfully, user authenticated');
      return {
        success: true,
        session: data.session,
        user: data.user,
        userData: userData,
        needsProfileSetup: false
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
      console.log('Fetching Supabase session...');
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Supabase session error:', error.message);
        throw error;
      }

      // Try to get user data from taskmaster table
      const { data: userData, error: userDataError } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .select('*')
        .eq('tm_id', data?.session?.user?.id)
        .single()

      // Handle case where user doesn't exist in taskmaster table
      if (userDataError) {
        if (userDataError.code === 'PGRST116') {
          // No rows returned - user doesn't exist in taskmaster table
          console.log('User not found in taskmaster table, needs profile setup');
          return {
            success: true,
            session: data?.session,
            user: data?.session?.user,
            userData: null,
            needsProfileSetup: true
          };
        } else {
          // Other database error
          console.log('Supabase user check error (getSession): ', userDataError.message);
          throw userDataError;
        }
      }

      console.log("userData from getSession:", JSON.stringify(userData, null, 2));
      console.log("User Data from tm - name:", userData?.name, "ph_no:", userData?.ph_no);

      // Log session details for debugging
      console.log('Session data:', {
        hasSession: !!data.session,
        hasUser: !!data.session?.user,
        expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'N/A'
      });

      return {
        success: true,
        session: data?.session,
        user: data?.session?.user,
        userData: userData,
        needsProfileSetup: false
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

      console.log("user profile find: ", data);

      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        throw error;
      }

      // Check if profile exists and has a name (since column is named 'name' not 'tm_name')
      const hasProfile = data && data.name;
      console.log('Profile exists:', !!hasProfile);

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
  async saveUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .upsert({
          tm_id: userId,
          name: profileData.name,
          ph_no: profileData.ph_no,
          // Add other fields as needed
        })
        .select()
        .single();

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