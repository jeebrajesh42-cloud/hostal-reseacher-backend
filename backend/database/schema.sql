-- ==============================================================================
-- HOSTEL RESEARCH & EXPENSE TRACKER - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (in reverse dependency order)
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS hostel_amenities CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS room_types CASCADE;
DROP TABLE IF EXISTS hostel_images CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_image TEXT,
    preferred_city VARCHAR(100) DEFAULT 'Bhopal',
    monthly_budget NUMERIC(10, 2) DEFAULT 15000.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ------------------------------------------------------------------------------
-- 2. HOSTELS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    hostel_type VARCHAR(20) NOT NULL CHECK (hostel_type IN ('boys', 'girls', 'co-ed')),
    address TEXT NOT NULL,
    area VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    security_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    admission_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    food_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    food_included BOOLEAN DEFAULT false,
    electricity_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    internet_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    maintenance_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER NOT NULL DEFAULT 0,
    availability BOOLEAN DEFAULT true,
    rules TEXT,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(150),
    owner_name VARCHAR(150),
    nearby_college VARCHAR(255),
    nearby_transport VARCHAR(255),
    nearby_grocery VARCHAR(255),
    nearby_hospital VARCHAR(255),
    nearby_restaurant VARCHAR(255),
    nearby_landmark VARCHAR(255),
    source_name VARCHAR(150),
    source_url TEXT,
    google_maps_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hostels_city ON hostels(city);
CREATE INDEX idx_hostels_area ON hostels(area);
CREATE INDEX idx_hostels_type ON hostels(hostel_type);
CREATE INDEX idx_hostels_rent ON hostels(monthly_rent);
CREATE INDEX idx_hostels_coords ON hostels(latitude, longitude);

-- ------------------------------------------------------------------------------
-- 3. HOSTEL IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE hostel_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hostel_images_hostel_id ON hostel_images(hostel_id);

-- ------------------------------------------------------------------------------
-- 4. ROOM TYPES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('single', 'double', 'triple', 'four_sharing')),
    price NUMERIC(10, 2) NOT NULL,
    capacity INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_room_types_hostel_id ON room_types(hostel_id);

-- ------------------------------------------------------------------------------
-- 5. AMENITIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT 'check'
);

-- ------------------------------------------------------------------------------
-- 6. HOSTEL AMENITIES TABLE (M:N)
-- ------------------------------------------------------------------------------
CREATE TABLE hostel_amenities (
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (hostel_id, amenity_id)
);

-- ------------------------------------------------------------------------------
-- 7. EXPENSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hostel_id UUID REFERENCES hostels(id) ON DELETE SET NULL,
    category VARCHAR(80) NOT NULL CHECK (category IN (
        'Hostel Rent',
        'Security Deposit',
        'Food',
        'Electricity',
        'Water',
        'Internet',
        'Laundry',
        'Transportation',
        'Groceries',
        'Education',
        'Entertainment',
        'Medical',
        'Shopping',
        'Other'
    )),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Cash', 'Card', 'Net Banking', 'Other')),
    is_recurring BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- ------------------------------------------------------------------------------
-- 8. FAVORITES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, hostel_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- ------------------------------------------------------------------------------
-- 9. REVIEWS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_hostel_id ON reviews(hostel_id);

-- ------------------------------------------------------------------------------
-- 10. BUDGETS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

CREATE INDEX idx_budgets_user_date ON budgets(user_id, year, month);
