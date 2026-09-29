const { supabase, isLiveSupabase, memoryDb } = require('../config/db');
const { randomUUID } = require('crypto');

const expenseModel = {
  async findByUserId(userId, filters = {}) {
    if (isLiveSupabase()) {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          hostels (id, name, city)
        `)
        .eq('user_id', userId)
        .order('expense_date', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.startDate) {
        query = query.gte('expense_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('expense_date', filters.endDate);
      }
      if (filters.hostelId) {
        query = query.eq('hostel_id', filters.hostelId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    let results = memoryDb.expenses.filter(e => e.user_id === userId);

    if (filters.category) {
      results = results.filter(e => e.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.startDate) {
      results = results.filter(e => e.expense_date >= filters.startDate);
    }
    if (filters.endDate) {
      results = results.filter(e => e.expense_date <= filters.endDate);
    }
    if (filters.hostelId) {
      results = results.filter(e => e.hostel_id === filters.hostelId);
    }

    // Attach hostel summary
    results = results.map(e => {
      const hostel = e.hostel_id ? memoryDb.hostels.find(h => h.id === e.hostel_id) : null;
      return {
        ...e,
        hostels: hostel ? { id: hostel.id, name: hostel.name, city: hostel.city } : null
      };
    });

    return results.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  },

  async findById(id, userId) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('expenses')
        .select(`*, hostels (id, name, city)`)
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    const exp = memoryDb.expenses.find(e => e.id === id && e.user_id === userId);
    if (!exp) return null;
    const hostel = exp.hostel_id ? memoryDb.hostels.find(h => h.id === exp.hostel_id) : null;
    return {
      ...exp,
      hostels: hostel ? { id: hostel.id, name: hostel.name, city: hostel.city } : null
    };
  },

  async create(expenseData) {
    const newExpense = {
      id: expenseData.id || randomUUID(),
      user_id: expenseData.user_id,
      hostel_id: expenseData.hostel_id || null,
      category: expenseData.category,
      amount: parseFloat(expenseData.amount),
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      description: expenseData.description,
      payment_method: expenseData.payment_method || 'UPI',
      is_recurring: Boolean(expenseData.is_recurring),
      notes: expenseData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    memoryDb.expenses.push(newExpense);
    const hostel = newExpense.hostel_id ? memoryDb.hostels.find(h => h.id === newExpense.hostel_id) : null;
    return {
      ...newExpense,
      hostels: hostel ? { id: hostel.id, name: hostel.name, city: hostel.city } : null
    };
  },

  async update(id, userId, updateData) {
    const fieldsToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    if (fieldsToUpdate.amount) {
      fieldsToUpdate.amount = parseFloat(fieldsToUpdate.amount);
    }
    delete fieldsToUpdate.id;
    delete fieldsToUpdate.user_id;

    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('expenses')
        .update(fieldsToUpdate)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = memoryDb.expenses.findIndex(e => e.id === id && e.user_id === userId);
    if (index === -1) return null;

    memoryDb.expenses[index] = {
      ...memoryDb.expenses[index],
      ...fieldsToUpdate
    };

    const updated = memoryDb.expenses[index];
    const hostel = updated.hostel_id ? memoryDb.hostels.find(h => h.id === updated.hostel_id) : null;
    return {
      ...updated,
      hostels: hostel ? { id: hostel.id, name: hostel.name, city: hostel.city } : null
    };
  },

  async delete(id, userId) {
    if (isLiveSupabase()) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return true;
    }

    const index = memoryDb.expenses.findIndex(e => e.id === id && e.user_id === userId);
    if (index === -1) return false;

    memoryDb.expenses.splice(index, 1);
    return true;
  }
};

module.exports = expenseModel;
