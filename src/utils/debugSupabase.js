import { supabase } from '../config/supabase';
import Constants from 'expo-constants';

// Debug function to check Supabase configuration
export const debugSupabaseConfig = () => {
  
  // Check if supabase client is properly initialized
  
  return {
    supabaseUrl: Constants.expoConfig.extra.expoPublicSupabaseUrl,
    supabaseAnonKeySet: !!Constants.expoConfig.extra.expoPublicSupabaseAnonKey,
    supabaseClientInitialized: !!supabase
  };
};