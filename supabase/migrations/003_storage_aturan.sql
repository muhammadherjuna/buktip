-------------------------------------------------------------------------------
-- PENGATURAN PENYIMPANAN FOTO BUKTIP
-- Buat bucket penyimpanan foto iklan & foto bukti kepemilikan
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- 1. Buat bucket untuk foto iklan (publik bisa baca, hanya pemilik yang bisa unggah)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'foto_iklan',
  'foto_iklan',
  true,
  5242880, -- Maksimal 5MB per foto
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Aturan RLS untuk bucket foto_iklan
DROP POLICY IF EXISTS "Publik boleh baca foto iklan" ON storage.objects;
CREATE POLICY "Publik boleh baca foto iklan"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'foto_iklan');

DROP POLICY IF EXISTS "Penjual boleh unggah foto iklan sendiri" ON storage.objects;
CREATE POLICY "Penjual boleh unggah foto iklan sendiri"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'foto_iklan' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "Penjual boleh hapus foto iklan sendiri" ON storage.objects;
CREATE POLICY "Penjual boleh hapus foto iklan sendiri"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'foto_iklan' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- 3. Fungsi BANTUAN: Generate Kode Verifikasi Unik Otomatis
-- Format: KB-XXXX (KB = Kode Buktip, XXXX = nomor urut berawalan nol)
CREATE OR REPLACE FUNCTION generate_kode_verifikasi()
RETURNS TEXT AS $$
DECLARE
  urut INT;
  kode TEXT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(kode_verifikasi FROM 4 FOR 4)::INT), 0) + 1
  INTO urut FROM iklan;
  
  kode := 'KB-' || LPAD(urut::TEXT, 4, '0');
  RETURN kode;
END;
$$ LANGUAGE plpgsql STABLE;

-- Berikan izin eksekusi ke anon dan authenticated
GRANT EXECUTE ON FUNCTION generate_kode_verifikasi() TO anon, authenticated;
