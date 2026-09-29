const { supabase, isLiveSupabase, memoryDb } = require('../config/db');
const { randomUUID } = require('crypto');

const favoriteModel = {
  async findByUserId(userId) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          hostels (
            id,
            name,
            monthly_rent,
            rating,
            review_count,
            city,
            area,
            hostel_type,
            latitude,
            longitude,
            food_included,
            hostel_images (image_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(f => ({
        id: f.id,
        created_at: f.created_at,
        hostel: {
          ...f.hostels,
          images: f.hostels?.hostel_images?.map(i => i.image_url) || []
        }
      }));
    }

    const favs = memoryDb.favorites.filter(f => f.user_id === userId);
    return favs.map(f => {
      const hostel = memoryDb.hostels.find(h => h.id === f.hostel_id);
      return {
        id: f.id,
        created_at: f.created_at,
        hostel: hostel || null
      };
    }).filter(f => f.hostel !== null);
  },

  async add(userId, hostelId) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, hostel_id: hostelId }])
        .select()
        .single();
      if (error && error.code !== '23505') throw error; // 23505 is unique violation
      return data || { user_id: userId, hostel_id: hostelId };
    }

    const existing = memoryDb.favorites.find(f => f.user_id === userId && f.hostel_id === hostelId);
    if (existing) return existing;

    const newFav = {
      id: randomUUID(),
      user_id: userId,
      hostel_id: hostelId,
      created_at: new Date().toISOString()
    };
    memoryDb.favorites.push(newFav);
    return newFav;
  },

  async remove(userId, hostelId) {
    if (isLiveSupabase()) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('hostel_id', hostelId);
      if (error) throw error;
      return true;
    }

    const initialLen = memoryDb.favorites.length;
    memoryDb.favorites = memoryDb.favorites.filter(f => !(f.user_id === userId && f.hostel_id === hostelId));
    return memoryDb.favorites.length < initialLen;
  },

  async isFavorite(userId, hostelId) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('hostel_id', hostelId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    }

    return memoryDb.favorites.some(f => f.user_id === userId && f.hostel_id === hostelId);
  }
};

module.exports = favoriteModel;
