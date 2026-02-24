-- Supabase Schema Initialization for CariSkill

-- 1. Create the `profiles` table to store extra user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Turn on Row Level Security (RLS) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING ( auth.uid() = id );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING ( auth.uid() = id );

-- 2. Create the `roadmaps` table to store generated CrewAI JSON
CREATE TABLE roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for roadmaps
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roadmaps
CREATE POLICY "Users can view own roadmaps" 
  ON roadmaps FOR SELECT 
  USING ( auth.uid() = user_id );

-- Allow users to insert their own roadmaps
CREATE POLICY "Users can insert own roadmaps" 
  ON roadmaps FOR INSERT 
  WITH CHECK ( auth.uid() = user_id );

-- Allow users to update their own roadmaps
CREATE POLICY "Users can update own roadmaps" 
  ON roadmaps FOR UPDATE 
  USING ( auth.uid() = user_id );

-- Allow users to delete their own roadmaps
CREATE POLICY "Users can delete own roadmaps" 
  ON roadmaps FOR DELETE 
  USING ( auth.uid() = user_id );

-- 3. Trigger to magically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
