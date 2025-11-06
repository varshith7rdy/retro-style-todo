/*
  # Create todos table

  1. New Tables
    - `todos`
      - `id` (uuid, primary key) - Unique identifier for each todo
      - `user_id` (uuid, foreign key) - References auth.users, owner of the todo
      - `title` (text) - The todo item text
      - `completed` (boolean) - Whether the todo is completed, defaults to false
      - `created_at` (timestamptz) - When the todo was created
      - `updated_at` (timestamptz) - When the todo was last updated

  2. Security
    - Enable RLS on `todos` table
    - Add policy for users to view their own todos
    - Add policy for users to insert their own todos
    - Add policy for users to update their own todos
    - Add policy for users to delete their own todos

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);