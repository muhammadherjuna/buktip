-------------------------------------------------------------------------------
-- PERBAIKAN KEBIJAKAN RLS TABEL PROFILES (INSERT & UPDATE)
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- 1. Pastikan RLS aktif di tabel profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Hapus kebijakan lama jika ada
DROP POLICY IF EXISTS "Profil: Baca informasi umum publik" ON profiles;
DROP POLICY IF EXISTS "Profil dapat dilihat publik" ON profiles;
DROP POLICY IF EXISTS "Pengguna boleh mengubah profil sendiri" ON profiles;
DROP POLICY IF EXISTS "Pengguna boleh membuat profil sendiri" ON profiles;
DROP POLICY IF EXISTS "Pengguna dapat mengelola profil sendiri" ON profiles;

-- 3. Kebijakan SELECT (Semua orang / publik dapat membaca profil untuk detail iklan & reputasi)
CREATE POLICY "Profil: Baca informasi umum publik" ON profiles
  FOR SELECT
  USING (true);

-- 4. Kebijakan INSERT (Pengguna yang login dapat memasukkan profil dengan ID miliknya)
CREATE POLICY "Pengguna boleh membuat profil sendiri" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Kebijakan UPDATE (Pengguna yang login dapat memperbarui profil miliknya)
CREATE POLICY "Pengguna boleh mengubah profil sendiri" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Berikan hak akses penuh ke role authenticated
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
