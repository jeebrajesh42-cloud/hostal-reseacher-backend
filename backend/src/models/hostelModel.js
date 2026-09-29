const { supabase, isLiveSupabase, memoryDb } = require('../config/db');
const { randomUUID } = require('crypto');

const hostelModel = {
  async findAll() {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('hostels')
        .select(`
          *,
          room_types (*),
          hostel_amenities (
            amenities (*)
          ),
          hostel_images (*)
        `)
        .order('rating', { ascending: false });

      if (error) throw error;

      // Normalize format to match UI contract
      return (data || []).map(h => ({
        ...h,
        images: h.hostel_images && h.hostel_images.length > 0 
          ? h.hostel_images.map(img => img.image_url) 
          : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'],
        amenities: h.hostel_amenities ? h.hostel_amenities.map(ha => ha.amenities?.name).filter(Boolean) : []
      }));
    }

    // In-memory mode
    return memoryDb.hostels.map(h => {
      const rooms = memoryDb.room_types.filter(r => r.hostel_id === h.id);
      return {
        ...h,
        room_types: rooms
      };
    });
  },

  async findById(id) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('hostels')
        .select(`
          *,
          room_types (*),
          hostel_amenities (
            amenities (*)
          ),
          hostel_images (*),
          reviews (*)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        ...data,
        images: data.hostel_images && data.hostel_images.length > 0 
          ? data.hostel_images.map(img => img.image_url) 
          : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'],
        amenities: data.hostel_amenities ? data.hostel_amenities.map(ha => ha.amenities?.name).filter(Boolean) : []
      };
    }

    const hostel = memoryDb.hostels.find(h => h.id === id);
    if (!hostel) return null;

    const rooms = memoryDb.room_types.filter(r => r.hostel_id === hostel.id);
    const reviews = memoryDb.reviews.filter(rev => rev.hostel_id === hostel.id);

    return {
      ...hostel,
      room_types: rooms,
      reviews
    };
  },

  async create(data) {
    const newHostel = {
      id: data.id || randomUUID(),
      name: data.name,
      description: data.description,
      hostel_type: data.hostel_type,
      address: data.address,
      area: data.area,
      city: data.city,
      pincode: data.pincode,
      latitude: parseFloat(data.latitude) || 23.2332,
      longitude: parseFloat(data.longitude) || 77.4343,
      monthly_rent: parseFloat(data.monthly_rent),
      security_deposit: parseFloat(data.security_deposit || 0),
      admission_fee: parseFloat(data.admission_fee || 0),
      food_charge: parseFloat(data.food_charge || 0),
      food_included: Boolean(data.food_included),
      electricity_charge: parseFloat(data.electricity_charge || 0),
      internet_charge: parseFloat(data.internet_charge || 0),
      maintenance_charge: parseFloat(data.maintenance_charge || 0),
      rating: parseFloat(data.rating || 4.5),
      review_count: parseInt(data.review_count || 1, 10),
      availability: data.availability !== undefined ? Boolean(data.availability) : true,
      rules: data.rules || 'Standard student rules apply. Curfew 10:30 PM.',
      contact_phone: data.contact_phone || '+91 99999 88888',
      contact_email: data.contact_email || 'contact@hostel.com',
      owner_name: data.owner_name || 'Property Manager',
      nearby_college: data.nearby_college || 'Main University Campus',
      nearby_transport: data.nearby_transport || 'Central Bus & Metro Station',
      nearby_grocery: data.nearby_grocery || 'Supermarket (300m)',
      nearby_hospital: data.nearby_hospital || 'City Hospital (1 km)',
      nearby_restaurant: data.nearby_restaurant || 'Food Court & Cafes (200m)',
      nearby_landmark: data.nearby_landmark || 'City Center',
      is_demo: data.is_demo !== undefined ? Boolean(data.is_demo) : true,
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'
      ],
      amenities: data.amenities || ['High-speed Wi-Fi', '24/7 Power Backup (DG)', 'CCTV & Biometric Security'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isLiveSupabase()) {
      const { data: insertedHostel, error } = await supabase
        .from('hostels')
        .insert([{
          id: newHostel.id,
          name: newHostel.name,
          description: newHostel.description,
          hostel_type: newHostel.hostel_type,
          address: newHostel.address,
          area: newHostel.area,
          city: newHostel.city,
          pincode: newHostel.pincode,
          latitude: newHostel.latitude,
          longitude: newHostel.longitude,
          monthly_rent: newHostel.monthly_rent,
          security_deposit: newHostel.security_deposit,
          admission_fee: newHostel.admission_fee,
          food_charge: newHostel.food_charge,
          food_included: newHostel.food_included,
          electricity_charge: newHostel.electricity_charge,
          internet_charge: newHostel.internet_charge,
          maintenance_charge: newHostel.maintenance_charge,
          rating: newHostel.rating,
          review_count: newHostel.review_count,
          availability: newHostel.availability,
          rules: newHostel.rules,
          contact_phone: newHostel.contact_phone,
          contact_email: newHostel.contact_email,
          owner_name: newHostel.owner_name,
          nearby_college: newHostel.nearby_college,
          nearby_transport: newHostel.nearby_transport,
          nearby_grocery: newHostel.nearby_grocery,
          nearby_hospital: newHostel.nearby_hospital,
          nearby_restaurant: newHostel.nearby_restaurant,
          nearby_landmark: newHostel.nearby_landmark,
          is_demo: newHostel.is_demo
        }])
        .select()
        .single();

      if (error) throw error;
      return insertedHostel;
    }

    memoryDb.hostels.unshift(newHostel);

    // Add default room types
    memoryDb.room_types.push(
      { id: randomUUID(), hostel_id: newHostel.id, room_type: 'single', price: newHostel.monthly_rent * 1.4, capacity: 1, available_rooms: 2 },
      { id: randomUUID(), hostel_id: newHostel.id, room_type: 'double', price: newHostel.monthly_rent, capacity: 2, available_rooms: 4 }
    );

    return newHostel;
  },

  async update(id, updateData) {
    if (isLiveSupabase()) {
      const { data, error } = await supabase
        .from('hostels')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = memoryDb.hostels.findIndex(h => h.id === id);
    if (index === -1) return null;

    memoryDb.hostels[index] = {
      ...memoryDb.hostels[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return memoryDb.hostels[index];
  },

  async delete(id) {
    if (isLiveSupabase()) {
      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }

    const index = memoryDb.hostels.findIndex(h => h.id === id);
    if (index === -1) return false;

    memoryDb.hostels.splice(index, 1);
    memoryDb.room_types = memoryDb.room_types.filter(r => r.hostel_id !== id);
    memoryDb.reviews = memoryDb.reviews.filter(rev => rev.hostel_id !== id);
    memoryDb.favorites = memoryDb.favorites.filter(f => f.hostel_id !== id);
    return true;
  }
};

module.exports = hostelModel;
