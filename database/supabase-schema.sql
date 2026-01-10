-- VALZOE TOUR - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT,
    price TEXT NOT NULL,
    price_currency TEXT DEFAULT 'ARS',
    min_guests INTEGER DEFAULT 1,
    description TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features table
CREATE TABLE IF NOT EXISTS features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wineries table
CREATE TABLE IF NOT EXISTS wineries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image TEXT,
    location TEXT,
    instagram TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu steps table
CREATE TABLE IF NOT EXISTS menu_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tour details table
CREATE TABLE IF NOT EXISTS tour_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE UNIQUE,
    menu_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    image_path TEXT NOT NULL,
    alt TEXT,
    display_order INTEGER DEFAULT 0,
    public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_features_tour_id ON features(tour_id);
CREATE INDEX IF NOT EXISTS idx_wineries_tour_id ON wineries(tour_id);
CREATE INDEX IF NOT EXISTS idx_menu_steps_tour_id ON menu_steps(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_details_tour_id ON tour_details(tour_id);
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);

-- Row Level Security (RLS) Policies
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE wineries ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read access for tours and related data
CREATE POLICY "Public can view tours" ON tours FOR SELECT USING (true);
CREATE POLICY "Public can view features" ON features FOR SELECT USING (true);
CREATE POLICY "Public can view wineries" ON wineries FOR SELECT USING (true);
CREATE POLICY "Public can view menu_steps" ON menu_steps FOR SELECT USING (true);
CREATE POLICY "Public can view tour_details" ON tour_details FOR SELECT USING (true);
CREATE POLICY "Public can view gallery" ON gallery FOR SELECT USING (true);

-- Admin can do everything (you'll need to implement proper auth)
-- For now, allow all operations (you can restrict this later)
CREATE POLICY "Allow all for tours" ON tours FOR ALL USING (true);
CREATE POLICY "Allow all for features" ON features FOR ALL USING (true);
CREATE POLICY "Allow all for wineries" ON wineries FOR ALL USING (true);
CREATE POLICY "Allow all for menu_steps" ON menu_steps FOR ALL USING (true);
CREATE POLICY "Allow all for tour_details" ON tour_details FOR ALL USING (true);
CREATE POLICY "Allow all for gallery" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
