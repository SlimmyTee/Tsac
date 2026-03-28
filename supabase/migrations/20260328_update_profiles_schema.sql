-- Migration: Update Profiles Schema and Handle New User Trigger (Hardened)
-- Description: Adds missing columns to profiles table and updates trigger to handle signup metadata with improved error handling.

--------------------------------------------------------------------------------
-- 1. Add missing columns to profiles table
--------------------------------------------------------------------------------
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS law_enforcement_affiliated text,
  ADD COLUMN IF NOT EXISTS date_of_birth text,
  ADD COLUMN IF NOT EXISTS duration integer,
  ADD COLUMN IF NOT EXISTS service_type text,
  ADD COLUMN IF NOT EXISTS personal_items text,
  ADD COLUMN IF NOT EXISTS address text;

--------------------------------------------------------------------------------
-- 2. Update handle_new_user function to map all metadata
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  f_name text;
  l_name text;
  full_nm text;
  dur_val integer;
BEGIN
  -- Extract names with null-safety
  f_name := NEW.raw_user_meta_data->>'first_name';
  l_name := NEW.raw_user_meta_data->>'last_name';
  
  -- Construct full name or fallback to email
  IF f_name IS NOT NULL AND l_name IS NOT NULL THEN
    full_nm := f_name || ' ' || l_name;
  ELSIF f_name IS NOT NULL THEN
    full_nm := f_name;
  ELSIF l_name IS NOT NULL THEN
    full_nm := l_name;
  ELSE
    full_nm := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  END IF;

  -- Safe cast for duration to prevent 500 errors on invalid values
  BEGIN
    dur_val := (NEW.raw_user_meta_data->>'duration')::integer;
  EXCEPTION WHEN others THEN
    dur_val := 0;
  END;

  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    first_name, 
    last_name, 
    role, 
    card_number,
    phone,
    gender,
    law_enforcement_affiliated,
    date_of_birth,
    duration,
    service_type,
    personal_items,
    address
  )
  VALUES (
    NEW.id,
    NEW.email,
    full_nm,
    f_name,
    l_name,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    public.generate_card_number(),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'law_enforcement_affiliated',
    NEW.raw_user_meta_data->>'date_of_birth',
    dur_val,
    NEW.raw_user_meta_data->>'service_type',
    NEW.raw_user_meta_data->>'personal_items',
    NEW.raw_user_meta_data->>'address'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
