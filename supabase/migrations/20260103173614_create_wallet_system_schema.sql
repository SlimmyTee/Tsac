/*
  # Wallet Management System Schema

  ## Overview
  Creates the complete database schema for a wallet management system with user and admin roles.
  Balances are calculated dynamically from transactions to ensure data integrity.

  ## New Tables
  
  ### `profiles`
  Extends auth.users with additional profile information:
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, user's email)
  - `full_name` (text, user's display name)
  - `role` (text, either 'user' or 'admin')
  - `card_number` (text, virtual card number for users)
  - `created_at` (timestamptz, account creation timestamp)
  - `updated_at` (timestamptz, last update timestamp)

  ### `transactions`
  Stores all wallet transactions:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `amount` (decimal, transaction amount - positive for credits, negative for debits)
  - `type` (text, transaction type: 'credit', 'debit', 'adjustment')
  - `description` (text, transaction description)
  - `admin_id` (uuid, nullable, references admin who created this transaction)
  - `created_at` (timestamptz, transaction timestamp)
  - `metadata` (jsonb, additional transaction data)

  ## Security
  
  ### Row Level Security (RLS)
  - Profiles: Users can read their own profile, admins can read all profiles
  - Transactions: Users can read their own transactions, admins can read and create all transactions
  
  ### Policies
  - Users can SELECT their own profile data
  - Admins can SELECT all profiles
  - Users can SELECT their own transactions
  - Admins can SELECT all transactions
  - Admins can INSERT transactions for any user
  - Admins can UPDATE transactions
  
  ## Functions
  - `generate_card_number()`: Generates a unique 16-digit virtual card number
  - `handle_new_user()`: Trigger function to create profile when user signs up
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  card_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'adjustment')),
  description text NOT NULL,
  admin_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Function to generate unique card numbers
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS text AS $$
DECLARE
  card_num text;
  exists_check int;
BEGIN
  LOOP
    card_num := LPAD(FLOOR(random() * 10000000000000000)::text, 16, '0');
    SELECT COUNT(*) INTO exists_check FROM profiles WHERE card_number = card_num;
    EXIT WHEN exists_check = 0;
  END LOOP;
  RETURN card_num;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, card_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    generate_card_number()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );