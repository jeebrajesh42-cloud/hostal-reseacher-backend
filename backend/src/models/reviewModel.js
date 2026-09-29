const { supabase, isLiveSupabase, memoryDb } = require('../config/db');
const { randomUUID } = require('crypto');

const reviewModel = {
  async findByHostelId(hostelId) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          users (id, name, profile_image)
        `)
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(r => ({
        id: r.id,
        rating: r.rating,
        review_text: r.review_text,
        created_at: r.created_at,
        user_name: r.users?.name || 'Anonymous Student',
        profile_image: r.users?.profile_image
      }));
    }

    const reviews = memoryDb.reviews.filter(r => r.hostel_id === hostelId);
    return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async create(reviewData) {
    const newReview = {
      id: reviewData.id || randomUUID(),
      user_id: reviewData.user_id,
      user_name: reviewData.user_name || 'Student Resident',
      hostel_id: reviewData.hostel_id,
      rating: parseInt(reviewData.rating, 10),
      review_text: reviewData.review_text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          id: newReview.id,
          user_id: newReview.user_id,
          hostel_id: newReview.hostel_id,
          rating: newReview.rating,
          review_text: newReview.review_text
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    memoryDb.reviews.unshift(newReview);

    // Update hostel rating & review count
    const hostel = memoryDb.hostels.find(h => h.id === reviewData.hostel_id);
    if (hostel) {
      const hostelReviews = memoryDb.reviews.filter(r => r.hostel_id === hostel.id);
      const avg = hostelReviews.reduce((sum, r) => sum + r.rating, 0) / hostelReviews.length;
      hostel.rating = parseFloat(avg.toFixed(1));
      hostel.review_count = hostelReviews.length;
    }

    return newReview;
  }
};

module.exports = reviewModel;
