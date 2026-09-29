-- ==============================================================================
-- HOSTEL RESEARCH & EXPENSE TRACKER - ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- USERS POLICIES
-- ------------------------------------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- HOSTELS & PUBLIC DATA POLICIES (Read-only for public, admin write)
-- ------------------------------------------------------------------------------
-- Anyone can view hostels
CREATE POLICY "Public read hostels"
    ON hostels FOR SELECT
    TO PUBLIC
    USING (true);

-- Anyone can view hostel images
CREATE POLICY "Public read hostel_images"
    ON hostel_images FOR SELECT
    TO PUBLIC
    USING (true);

-- Anyone can view room types
CREATE POLICY "Public read room_types"
    ON room_types FOR SELECT
    TO PUBLIC
    USING (true);

-- Anyone can view amenities
CREATE POLICY "Public read amenities"
    ON amenities FOR SELECT
    TO PUBLIC
    USING (true);

-- Anyone can view hostel amenities mapping
CREATE POLICY "Public read hostel_amenities"
    ON hostel_amenities FOR SELECT
    TO PUBLIC
    USING (true);

-- Admin can insert/update/delete hostels
CREATE POLICY "Admins can manage hostels"
    ON hostels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- ------------------------------------------------------------------------------
-- EXPENSES POLICIES (Strict user isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own expenses"
    ON expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
    ON expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
    ON expenses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
    ON expenses FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- FAVORITES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- REVIEWS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read reviews"
    ON reviews FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Users can insert own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- BUDGETS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert or update own budgets"
    ON budgets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
