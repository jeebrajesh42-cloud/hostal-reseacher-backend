const { supabase, isLiveSupabase, memoryDb } = require('../config/db');
const { randomUUID } = require('crypto');

const budgetModel = {
  async getBudget(userId, month, year) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    const budget = memoryDb.budgets.find(b => b.user_id === userId && b.month === month && b.year === year);
    return budget || null;
  },

  async setBudget(userId, month, year, amount) {
    const numericAmount = parseFloat(amount);

    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          { user_id: userId, month, year, amount: numericAmount, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,month,year' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const existingIndex = memoryDb.budgets.findIndex(b => b.user_id === userId && b.month === month && b.year === year);
    if (existingIndex >= 0) {
      memoryDb.budgets[existingIndex].amount = numericAmount;
      memoryDb.budgets[existingIndex].updated_at = new Date().toISOString();
      return memoryDb.budgets[existingIndex];
    }

    const newBudget = {
      id: randomUUID(),
      user_id: userId,
      month,
      year,
      amount: numericAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryDb.budgets.push(newBudget);
    return newBudget;
  }
};

module.exports = budgetModel;
