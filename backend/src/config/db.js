const { createClient } = require('@supabase/supabase-js');
const env = require('./env');
const bcrypt = require('bcryptjs');
const { realHostels } = require('./realHostels');

let supabase = null;
let isLiveSupabase = false;

if (env.SUPABASE_URL && env.SUPABASE_URL.startsWith('http') && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) {
  try {
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    supabase = createClient(env.SUPABASE_URL, key, {
      auth: { persistSession: false }
    });
    console.log('[Database] Supabase client initialized.');

    // Asynchronously verify whether schema tables exist in Supabase
    (async () => {
      try {
        const { error } = await supabase.from('hostels').select('id').limit(1);
        if (error) {
          console.warn('[Database] Connected to Supabase, but schema tables are not created yet (' + error.message + '). Please run backend/database/schema.sql in Supabase SQL Editor. Seamlessly using verified in-memory store in the meantime.');
          isLiveSupabase = false;
        } else {
          isLiveSupabase = true;
          console.log('[Database] ✅ Supabase live PostgreSQL database connected and verified successfully!');
        }
      } catch (err) {
        console.warn('[Database] Supabase verification check failed, using in-memory store:', err.message);
        isLiveSupabase = false;
      }
    })();
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err.message);
    isLiveSupabase = false;
  }
} else {
  console.log('[Database] Running in In-Memory Database mode. (To use live Supabase PostgreSQL, add credentials to .env)');
}

// -----------------------------------------------------------------------------
// In-Memory Database store with rich seed data for development & testing
// -----------------------------------------------------------------------------
const memoryDb = {
  users: [],
  hostels: [],
  hostel_images: [],
  room_types: [],
  amenities: [],
  hostel_amenities: [],
  expenses: [],
  favorites: [],
  reviews: [],
  budgets: []
};

// Populate seed demo data immediately and synchronously
const initializeSeedData = () => {
  // Pre-hashed passwords: 'password123' and 'admin123'
  const studentPasswordHash = bcrypt.hashSync('password123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  memoryDb.users = [
    {
      id: 'u0000000-0000-0000-0000-000000000001',
      name: 'Aarav Sharma',
      email: 'student@demo.com',
      password_hash: studentPasswordHash,
      role: 'user',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      preferred_city: 'Bhopal',
      monthly_budget: 16000.00,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'u0000000-0000-0000-0000-000000000002',
      name: 'Admin Manager',
      email: 'admin@demo.com',
      password_hash: adminPasswordHash,
      role: 'admin',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      preferred_city: 'Bhopal',
      monthly_budget: 25000.00,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  memoryDb.amenities = [
    { id: 'a0000000-0000-0000-0000-000000000001', name: 'High-speed Wi-Fi', icon: 'wifi' },
    { id: 'a0000000-0000-0000-0000-000000000002', name: 'Air Conditioning (AC)', icon: 'wind' },
    { id: 'a0000000-0000-0000-0000-000000000003', name: '3 Meals + Evening Snacks', icon: 'utensils' },
    { id: 'a0000000-0000-0000-0000-000000000004', name: 'Automated Laundry', icon: 'shirt' },
    { id: 'a0000000-0000-0000-0000-000000000005', name: 'Two-wheeler / Car Parking', icon: 'car' },
    { id: 'a0000000-0000-0000-0000-000000000006', name: '24/7 Power Backup (DG)', icon: 'zap' },
    { id: 'a0000000-0000-0000-0000-000000000007', name: 'CCTV & Biometric Security', icon: 'shield-check' },
    { id: 'a0000000-0000-0000-0000-000000000008', name: 'Silent Study Room & Library', icon: 'book-open' },
    { id: 'a0000000-0000-0000-0000-000000000009', name: 'Fitness Gym', icon: 'dumbbell' },
    { id: 'a0000000-0000-0000-0000-000000000010', name: 'Daily Housekeeping', icon: 'sparkles' },
    { id: 'a0000000-0000-0000-0000-000000000011', name: 'RO Purified Water', icon: 'droplet' },
    { id: 'a0000000-0000-0000-0000-000000000012', name: 'Geyser / Hot Water 24/7', icon: 'flame' }
  ];

  memoryDb.hostels = realHostels;

  memoryDb.room_types = [
    { id: 'r1', hostel_id: 'h0000000-0000-0000-0000-000000000001', room_type: 'single', price: 11500.00, capacity: 1, available_rooms: 2 },
    { id: 'r2', hostel_id: 'h0000000-0000-0000-0000-000000000001', room_type: 'double', price: 7500.00, capacity: 2, available_rooms: 5 },
    { id: 'r3', hostel_id: 'h0000000-0000-0000-0000-000000000001', room_type: 'triple', price: 5800.00, capacity: 3, available_rooms: 3 },

    { id: 'r4', hostel_id: 'h0000000-0000-0000-0000-000000000002', room_type: 'single', price: 10500.00, capacity: 1, available_rooms: 1 },
    { id: 'r5', hostel_id: 'h0000000-0000-0000-0000-000000000002', room_type: 'double', price: 6800.00, capacity: 2, available_rooms: 4 },
    { id: 'r6', hostel_id: 'h0000000-0000-0000-0000-000000000002', room_type: 'triple', price: 5400.00, capacity: 3, available_rooms: 2 },

    { id: 'r7', hostel_id: 'h0000000-0000-0000-0000-000000000003', room_type: 'single', price: 19000.00, capacity: 1, available_rooms: 3 },
    { id: 'r8', hostel_id: 'h0000000-0000-0000-0000-000000000003', room_type: 'double', price: 13500.00, capacity: 2, available_rooms: 6 },

    { id: 'r9', hostel_id: 'h0000000-0000-0000-0000-000000000004', room_type: 'single', price: 11000.00, capacity: 1, available_rooms: 2 },
    { id: 'r10', hostel_id: 'h0000000-0000-0000-0000-000000000004', room_type: 'double', price: 7200.00, capacity: 2, available_rooms: 4 },
    { id: 'r11', hostel_id: 'h0000000-0000-0000-0000-000000000004', room_type: 'four_sharing', price: 4800.00, capacity: 4, available_rooms: 3 },

    { id: 'r12', hostel_id: 'h0000000-0000-0000-0000-000000000005', room_type: 'single', price: 16000.00, capacity: 1, available_rooms: 2 },
    { id: 'r13', hostel_id: 'h0000000-0000-0000-0000-000000000005', room_type: 'double', price: 11000.00, capacity: 2, available_rooms: 5 },

    { id: 'r14', hostel_id: 'h0000000-0000-0000-0000-000000000006', room_type: 'single', price: 14500.00, capacity: 1, available_rooms: 4 },
    { id: 'r15', hostel_id: 'h0000000-0000-0000-0000-000000000006', room_type: 'double', price: 9500.00, capacity: 2, available_rooms: 7 },

    { id: 'r16', hostel_id: 'h0000000-0000-0000-0000-000000000007', room_type: 'double', price: 6200.00, capacity: 2, available_rooms: 4 },
    { id: 'r17', hostel_id: 'h0000000-0000-0000-0000-000000000008', room_type: 'double', price: 6500.00, capacity: 2, available_rooms: 3 },
    { id: 'r18', hostel_id: 'h0000000-0000-0000-0000-000000000009', room_type: 'double', price: 7200.00, capacity: 2, available_rooms: 5 },
    { id: 'r19', hostel_id: 'h0000000-0000-0000-0000-000000000010', room_type: 'single', price: 18000.00, capacity: 1, available_rooms: 2 },
    { id: 'r20', hostel_id: 'h0000000-0000-0000-0000-000000000010', room_type: 'double', price: 14000.00, capacity: 2, available_rooms: 4 },
    { id: 'r21', hostel_id: 'h0000000-0000-0000-0000-000000000011', room_type: 'double', price: 12500.00, capacity: 2, available_rooms: 5 },
    { id: 'r22', hostel_id: 'h0000000-0000-0000-0000-000000000012', room_type: 'double', price: 8000.00, capacity: 2, available_rooms: 3 },
    { id: 'r23', hostel_id: 'h0000000-0000-0000-0000-000000000013', room_type: 'single', price: 16500.00, capacity: 1, available_rooms: 2 },
    { id: 'r24', hostel_id: 'h0000000-0000-0000-0000-000000000013', room_type: 'double', price: 11500.00, capacity: 2, available_rooms: 4 },
    { id: 'r25', hostel_id: 'h0000000-0000-0000-0000-000000000014', room_type: 'single', price: 15000.00, capacity: 1, available_rooms: 3 },
    { id: 'r26', hostel_id: 'h0000000-0000-0000-0000-000000000014', room_type: 'double', price: 10200.00, capacity: 2, available_rooms: 5 },
    { id: 'r27', hostel_id: 'h0000000-0000-0000-0000-000000000015', room_type: 'double', price: 6800.00, capacity: 2, available_rooms: 4 },
    { id: 'r28', hostel_id: 'h0000000-0000-0000-0000-000000000016', room_type: 'double', price: 7500.00, capacity: 2, available_rooms: 3 },
    { id: 'r29', hostel_id: 'h0000000-0000-0000-0000-000000000017', room_type: 'double', price: 11000.00, capacity: 2, available_rooms: 4 },
    { id: 'r30', hostel_id: 'h0000000-0000-0000-0000-000000000018', room_type: 'single', price: 19500.00, capacity: 1, available_rooms: 1 },
    { id: 'r31', hostel_id: 'h0000000-0000-0000-0000-000000000018', room_type: 'double', price: 14500.00, capacity: 2, available_rooms: 3 }
  ];

  // Seed demo expenses for the student user
  const now = new Date();
  const formatYMD = (d) => d.toISOString().split('T')[0];

  memoryDb.expenses = [
    {
      id: 'e1',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: 'h0000000-0000-0000-0000-000000000001',
      category: 'Hostel Rent',
      amount: 7500.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 2)),
      description: 'Monthly Hostel Room Rent (Double Sharing)',
      payment_method: 'UPI',
      is_recurring: true,
      notes: 'Paid via GPay to warden',
      created_at: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 2).toISOString()
    },
    {
      id: 'e2',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: 'h0000000-0000-0000-0000-000000000001',
      category: 'Food',
      amount: 2200.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 3)),
      description: 'Hostel Mess Monthly Meal Plan',
      payment_method: 'UPI',
      is_recurring: true,
      notes: '3 meals daily + evening tea',
      created_at: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 3).toISOString()
    },
    {
      id: 'e3',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: 'h0000000-0000-0000-0000-000000000001',
      category: 'Electricity',
      amount: 450.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 5)),
      description: 'Room submeter electricity share',
      payment_method: 'Cash',
      is_recurring: true,
      notes: 'Includes fan, light, laptop charging',
      created_at: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 5).toISOString()
    },
    {
      id: 'e4',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: null,
      category: 'Transportation',
      amount: 850.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 8)),
      description: 'Monthly City Bus & Metro Pass',
      payment_method: 'Card',
      is_recurring: true,
      notes: 'Daily commute between hostel and college',
      created_at: new Date(now.getFullYear(), now.getMonth(), 8).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 8).toISOString()
    },
    {
      id: 'e5',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: null,
      category: 'Groceries',
      amount: 980.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 12)),
      description: 'Healthy snacks, fruits & milk',
      payment_method: 'UPI',
      is_recurring: false,
      notes: 'Reliance Smart Point purchase',
      created_at: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 12).toISOString()
    },
    {
      id: 'e6',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: null,
      category: 'Education',
      amount: 650.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 16)),
      description: 'Semester books and engineering stationery',
      payment_method: 'UPI',
      is_recurring: false,
      notes: 'Book depot Bhopal',
      created_at: new Date(now.getFullYear(), now.getMonth(), 16).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 16).toISOString()
    },
    {
      id: 'e7',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: null,
      category: 'Laundry',
      amount: 400.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 20)),
      description: 'Bedding dry cleaning & steam press',
      payment_method: 'Cash',
      is_recurring: false,
      notes: 'Hostel laundry service',
      created_at: new Date(now.getFullYear(), now.getMonth(), 20).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 20).toISOString()
    },
    {
      id: 'e8',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: null,
      category: 'Entertainment',
      amount: 490.00,
      expense_date: formatYMD(new Date(now.getFullYear(), now.getMonth(), 22)),
      description: 'Weekend cinema outing with roommates',
      payment_method: 'UPI',
      is_recurring: false,
      notes: 'DB Mall Cinepolis',
      created_at: new Date(now.getFullYear(), now.getMonth(), 22).toISOString(),
      updated_at: new Date(now.getFullYear(), now.getMonth(), 22).toISOString()
    }
  ];

  // Seed favorites for demo user
  memoryDb.favorites = [
    {
      id: 'f1',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: 'h0000000-0000-0000-0000-000000000001',
      created_at: new Date().toISOString()
    },
    {
      id: 'f2',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      hostel_id: 'h0000000-0000-0000-0000-000000000003',
      created_at: new Date().toISOString()
    }
  ];

  // Seed reviews
  memoryDb.reviews = [
    {
      id: 'rev-1',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      user_name: 'Aarav Sharma',
      hostel_id: 'h0000000-0000-0000-0000-000000000001',
      rating: 5,
      review_text: 'Great environment for study. The mess food is very clean compared to other hostels in MP Nagar. Wi-Fi speeds are consistently 100+ Mbps.',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rev-2',
      user_id: 'u0000000-0000-0000-0000-000000000002',
      user_name: 'Rohan Mehra',
      hostel_id: 'h0000000-0000-0000-0000-000000000001',
      rating: 4,
      review_text: 'Peaceful location. Power backup kicks in immediately during outages. Only minor feedback is that parking space fills up quickly.',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rev-3',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      user_name: 'Priyanka Sen',
      hostel_id: 'h0000000-0000-0000-0000-000000000002',
      rating: 5,
      review_text: 'Very secure with courteous wardens. Hygienic washrooms and delicious homely food. Close to bus stops.',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Seed current budget
  memoryDb.budgets = [
    {
      id: 'b1',
      user_id: 'u0000000-0000-0000-0000-000000000001',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: 16000.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

try {
  initializeSeedData();
} catch (err) {
  console.error('[Database] Failed to seed memory DB:', err);
}

module.exports = {
  supabase,
  isLiveSupabase: () => isLiveSupabase,
  memoryDb
};
