-- Create candidates table
CREATE TABLE candidate_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    title TEXT,
    experience_years INTEGER CHECK (experience_years >= 0),
    skills TEXT[] DEFAULT '{}',
    bio TEXT,
    location TEXT,
    resume_url TEXT,
    resume_filename TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_profile UNIQUE(profile_id)
);

-- Create index on profile_id for faster lookups
CREATE INDEX candidate_profiles_profile_id_idx ON candidate_profiles(profile_id);

-- Enable RLS
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own profile
CREATE POLICY "Users can view own candidate profile" ON candidate_profiles
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = profile_id
    ));

-- Users can update their own profile
CREATE POLICY "Users can update own candidate profile" ON candidate_profiles
    FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = profile_id
    ));

-- Create resumes bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload their own resume"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    LOWER(storage.extension(name)) = '.pdf'
);

CREATE POLICY "Users can update their own resume"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own resume"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own resume"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
CREATE TRIGGER update_candidate_profiles_updated_at
    BEFORE UPDATE ON candidate_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create candidate profile when role changes to 'candidate'
CREATE OR REPLACE FUNCTION handle_new_candidate()
RETURNS trigger AS $$
BEGIN
    -- If role is being set to candidate
    IF NEW.role = 'candidate' THEN
        -- Insert only if doesn't exist
        INSERT INTO candidate_profiles (profile_id, name)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create candidate profile when role changes
CREATE TRIGGER on_profile_role_changed
    AFTER INSERT OR UPDATE OF role ON profiles
    FOR EACH ROW
    WHEN (NEW.role = 'candidate')
    EXECUTE FUNCTION handle_new_candidate(); 