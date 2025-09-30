import { supabase } from '../data/supabaseClient';

class EarningsService {
  // Get earnings data for the current user
  async getEarnings(userId) {
    try {
      const { data, error } = await supabase
        .schema('onlyclick')
        .from('taskmaster')
        .select('wallet, total_earned, withdrawn')
        .eq('tm_id', userId)
        .single();

      if (error) {
        console.error('Supabase error fetching earnings:', error);
        throw error;
      }

      // Return the earnings data from taskmaster table
      return data || {};
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  }

  // Get earnings summary (wallet + total earned)
  async getEarningsSummary(userId) {
    try {
      const earnings = await this.getEarnings(userId);

      return {
        wallet: earnings.wallet || 0,
        totalEarned: earnings.total_earned || 0,
        withdrawn: earnings.withdrawn || 0,
        availableBalance: (earnings.wallet || 0) + (earnings.total_earned || 0) - (earnings.withdrawn || 0)
      };
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      // Return default values if Supabase fails
      return {
        wallet: 0,
        totalEarned: 0,
        withdrawn: 0,
        availableBalance: 0
      };
    }
  }

  // Get transactions for the current user
  async getTransactions(userId) {
    try {
      const { data, error } = await supabase
        .schema('onlyclick')
        .from('transactions_tm')
        .select('*')
        .eq('tm_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching transactions:', error);
        throw error;
      }

      // Return the transactions data
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

}

export default new EarningsService();