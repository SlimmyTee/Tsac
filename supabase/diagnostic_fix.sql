-- Diagnostic & Fix Script for Supabase Trigger
-- Run this in your Supabase SQL Editor

DO $$ 
DECLARE
  missing_cols text[];
  col_name text;
BEGIN
  -- 1. Check for missing columns and log them
  FOR col_name IN 
    SELECT unnest(ARRAY['phone', 'gender', 'law_enforcement_affiliated', 'date_of_birth', 'duration', 'service_type', 'personal_items', 'address', 'first_name', 'last_name'])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = col_name
    ) THEN
      missing_cols := array_append(missing_cols, col_name);
    END IF;
  END LOOP;

  IF missing_cols IS NOT NULL THEN
    RAISE NOTICE 'Missing columns detected: %', missing_cols;
    -- Try to add them now
    FOR i IN 1 .. array_length(missing_cols, 1) LOOP
      IF missing_cols[i] = 'duration' THEN
        EXECUTE 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS duration integer';
      ELSE
        EXECUTE 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ' || missing_cols[i] || ' text';
      END IF;
    END LOOP;
  ELSE
    RAISE NOTICE 'All required columns exist.';
  END IF;
END $$;

-- 2. Hardened Trigger Function (With even more safety)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  f_name text;
  l_name text;
  full_nm text;
  dur_val integer;
BEGIN
  -- Extract metadata safely
  f_name := NEW.raw_user_meta_data->>'first_name';
  l_name := NEW.raw_user_meta_data->>'last_name';
  
  -- Name construction
  IF f_name IS NOT NULL AND l_name IS NOT NULL THEN
    full_nm := f_name || ' ' || l_name;
  ELSIF f_name IS NOT NULL THEN
    full_nm := f_name;
  ELSIF l_name IS NOT NULL THEN
    full_nm := l_name;
  ELSE
    full_nm := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User');
  END IF;

  -- Metadata safely
  BEGIN
    dur_val := (NEW.raw_user_meta_data->>'duration')::integer;
  EXCEPTION WHEN others THEN
    dur_val := 0;
  END;

  -- Standard INSERT with all columns
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
  -- IF EVERYTHING FAILS, try a bare-minimum insert so signup doesn't block again
  RAISE WARNING 'Trigger handle_new_user failed for ID %: %', NEW.id, SQLERRM;
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.email, 'User'), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
