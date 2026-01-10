-- Migration: Add role column to users table
-- Execute this in Supabase SQL Editor

-- Add role column to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin' 
CHECK (role IN ('admin', 'moderator', 'viewer'));

-- Update existing users to have admin role
UPDATE users SET role = 'admin' WHERE role IS NULL;
