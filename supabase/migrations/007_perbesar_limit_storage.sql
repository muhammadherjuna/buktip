-------------------------------------------------------------------------------
-- PERBESAR LIMIT UKURAN FILE STORAGE BUCKET (FOTO IKLAN)
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- 1. Perbarui limit ukuran file bucket foto_iklan menjadi 10MB (10485760 bytes)
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
WHERE id = 'foto_iklan' OR name = 'foto_iklan';

-- 2. Pastikan kebijakan storage mengizinkan upload oleh pengguna terautentikasi
DROP POLICY IF EXISTS "Pengguna dapat mengunggah foto iklan" ON storage.objects;
CREATE POLICY "Pengguna dapat mengunggah foto iklan"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'foto_iklan');

DROP POLICY IF EXISTS "Publik dapat melihat foto iklan" ON storage.objects;
CREATE POLICY "Publik dapat melihat foto iklan"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'foto_iklan');
