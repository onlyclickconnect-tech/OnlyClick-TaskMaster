import { supabase } from '../config/supabase';
import Constants from 'expo-constants';

// Debug function to check Supabase configuration
export const debugSupabaseConfig = () => {
  console.log('Supabase URL:', Constants.expoConfig.extra.expoPublicSupabaseUrl);
  console.log('Supabase Anon Key:', Constants.expoConfig.extra.expoPublicSupabaseAnonKey ? 'Set (hidden for security)' : 'Not set');
  
  // Check if supabase client is properly initialized
  console.log('Supabase client initialized:', !!supabase);
  
  return {
    supabaseUrl: Constants.expoConfig.extra.expoPublicSupabaseUrl,
    supabaseAnonKeySet: !!Constants.expoConfig.extra.expoPublicSupabaseAnonKey,
    supabaseClientInitialized: !!supabase
  };
};