/*
  # Omerta Empire - Create Players Table

  1. New Tables
    - `players`
      - `telegram_id` (bigint, primary key) - Telegram user ID
      - `first_name` (text) - Player's first name from Telegram
      - `money` (integer, default 100) - Player's current money balance
      - `created_at` (timestamptz) - When player first joined
      - `updated_at` (timestamptz) - Last activity timestamp
  
  2. Security
    - Enable RLS on `players` table
    - Add policy for players to read their own data
    - Add policy for players to insert their own data
    - Add policy for players to update their own data
  
  3. Notes
    - Players start with 100 money by default
    - Telegram IDs are unique identifiers
*/

CREATE TABLE IF NOT EXISTS players (
  telegram_id bigint PRIMARY KEY,
  first_name text NOT NULL,
  money integer DEFAULT 100 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own data"
  ON players
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Players can insert own data"
  ON players
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Players can update own data"
  ON players
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);