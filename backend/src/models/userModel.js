const { supabase, isLiveSupabase, memoryDb } = require('../config/db');
const { randomUUID } = require('crypto');

const userModel = {
  async findByEmail(email) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    const user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async findById(id) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, profile_image, preferred_city, monthly_budget, created_at, updated_at')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    const user = memoryDb.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async create(userData) {
    const newUser = {
      id: userData.id || randomUUID(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password_hash: userData.password_hash,
      role: userData.role || 'user',
      profile_image: userData.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=2563EB&color=fff`,
      preferred_city: userData.preferred_city || 'Bhopal',
      monthly_budget: userData.monthly_budget || 15000.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select('id, name, email, role, profile_image, preferred_city, monthly_budget, created_at, updated_at')
        .single();
      if (error) throw error;
      return data;
    }

    memoryDb.users.push(newUser);
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  },

  async update(id, updateData) {
    const fieldsToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    delete fieldsToUpdate.password_hash; // Handle password updates separately if needed
    delete fieldsToUpdate.id;

    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('users')
        .update(fieldsToUpdate)
        .eq('id', id)
        .select('id, name, email, role, profile_image, preferred_city, monthly_budget, created_at, updated_at')
        .single();
      if (error) throw error;
      return data;
    }

    const userIndex = memoryDb.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    memoryDb.users[userIndex] = {
      ...memoryDb.users[userIndex],
      ...fieldsToUpdate
    };

    const { password_hash, ...safeUser } = memoryDb.users[userIndex];
    return safeUser;
  }
};

module.exports = userModel;
