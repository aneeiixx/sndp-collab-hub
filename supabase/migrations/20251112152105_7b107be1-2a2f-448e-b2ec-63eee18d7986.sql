-- Remove password columns from students and admins tables for security
-- Passwords will be handled by Supabase Auth instead
ALTER TABLE public.students DROP COLUMN password;
ALTER TABLE public.admins DROP COLUMN password;

-- Add a user_type field to help distinguish between student and admin auth users
-- This will be stored in auth.users metadata during signup
-- No structural changes needed to tables since we're using the id field to link to auth.users