-- BULLETPROOF RESTORE SCRIPT
-- Run this in your Supabase SQL Editor.

BEGIN;

-- 1. Drop existing trigger and functions to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.generate_card_number();

-- 2. Create the Card Number Generator
CREATE OR REPLACE FUNCTION public.generate_card_number()
RETURNS text AS $$
DECLARE
  card_num text;
  exists_check int;
BEGIN
  LOOP
    -- Generate a 16-digit random number string
    card_num := LPAD(FLOOR(random() * 10000000000000000)::text, 16, '0');
    -- Check uniqueness
    SELECT COUNT(*) INTO exists_check FROM public.profiles WHERE card_number = card_num;
    EXIT WHEN exists_check = 0;
  END LOOP;
  RETURN card_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Create the Handle New User Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  f_name text;
  l_name text;
  full_nm text;
  dur_val integer;
BEGIN
  -- Extract metadata
  f_name := NEW.raw_user_meta_data->>'first_name';
  l_name := NEW.raw_user_meta_data->>'last_name';
  full_nm := COALESCE(f_name || ' ' || l_name, NEW.raw_user_meta_data->>'full_name', NEW.email, 'User');

  -- Safe cast for duration
  BEGIN
    dur_val := (NEW.raw_user_meta_data->>'duration')::integer;
  EXCEPTION WHEN others THEN
    dur_val := 0;
  END;

  -- Insert profile
  INSERT INTO public.profiles (
    id, email, full_name, first_name, last_name, role, card_number,
    phone, gender, law_enforcement_affiliated, date_of_birth, duration,
    service_type, personal_items, address
  )
  VALUES (
    NEW.id, NEW.email, full_nm, f_name, l_name,
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
EXCEPTION WHEN OTHERS THEN
  -- Last resort fallback to prevent 500 error
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.email, 'User'), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Re-create the Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
