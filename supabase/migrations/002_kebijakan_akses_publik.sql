-------------------------------------------------------------------------------
-- Kebijakan Akses (RLS) & Hak Akses Baca Publik untuk Buktip
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- 1. Berikan izin baca dasar schema public ke role anon dan authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 2. Aktifkan Row Level Security (RLS) pada tabel-tabel utama
ALTER TABLE daerah ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE iklan ENABLE ROW LEVEL SECURITY;

-- 3. Buat kebijakan RLS agar data publik dapat dibaca oleh siapa saja (anon & authenticated)

-- Tabel Daerah: Siapa saja boleh membaca daerah yang aktif
DROP POLICY IF EXISTS "Daerah dapat dilihat publik" ON daerah;
CREATE POLICY "Daerah dapat dilihat publik" 
ON daerah FOR SELECT 
TO anon, authenticated 
USING (is_active = true);

-- Tabel Profiles: Siapa saja boleh melihat profil publik penjual
DROP POLICY IF EXISTS "Profil dapat dilihat publik" ON profiles;
CREATE POLICY "Profil dapat dilihat publik" 
ON profiles FOR SELECT 
TO anon, authenticated 
USING (true);

-- Tabel Iklan: Siapa saja boleh melihat iklan yang statusnya 'tersedia' atau 'terjual'
DROP POLICY IF EXISTS "Iklan dapat dilihat publik" ON iklan;
CREATE POLICY "Iklan dapat dilihat publik" 
ON iklan FOR SELECT 
TO anon, authenticated 
USING (status IN ('tersedia', 'terjual'));
