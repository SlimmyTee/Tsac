-- Migration: Revert to Confirmed Working Admin Permissions
-- Description: Reverts to a permissive but functional admin check as requested by the user.

--------------------------------------------------------------------------------
-- 1. Permissive Admin Check Function (Confirmed Working)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_admin_status(u_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Reverting to the version that worked for the user.
  -- This bypasses the role-string and metadata mismatches.
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

--------------------------------------------------------------------------------
-- 2. Ensure Necessary Schema Exists
--------------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_number_visible boolean DEFAULT false;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES profiles(id);
ALTER TABLE transactions ALTER COLUMN admin_id SET DEFAULT auth.uid();

CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('pay', 'withdraw')),
  amount decimal(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  details text,
  created_at timestamptz DEFAULT now()
);

--------------------------------------------------------------------------------
-- 3. Apply Function-Based Policies
--------------------------------------------------------------------------------

-- Transactions Admin Access
DROP POLICY IF EXISTS "Transactions Admin Access" ON transactions;
CREATE POLICY "Transactions Admin Access" 
ON transactions FOR ALL 
TO authenticated 
USING (public.check_admin_status(auth.uid())) 
WITH CHECK (public.check_admin_status(auth.uid()));

-- Profiles Admin Access
DROP POLICY IF EXISTS "Profiles Admin Access" ON profiles;
CREATE POLICY "Profiles Admin Access" 
ON profiles FOR ALL 
TO authenticated 
USING (public.check_admin_status(auth.uid())) 
WITH CHECK (public.check_admin_status(auth.uid()));

-- Requests Admin Access
DROP POLICY IF EXISTS "Requests Admin Access" ON requests;
CREATE POLICY "Requests Admin Access" 
ON requests FOR ALL 
TO authenticated 
USING (public.check_admin_status(auth.uid())) 
WITH CHECK (public.check_admin_status(auth.uid()));

--------------------------------------------------------------------------------
-- 4. Essential Self-Service Policies
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles User Access" ON profiles;
CREATE POLICY "Profiles User Access" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Transactions User View" ON transactions;
CREATE POLICY "Transactions User View" ON transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
