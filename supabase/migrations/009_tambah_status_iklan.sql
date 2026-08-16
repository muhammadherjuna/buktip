-------------------------------------------------------------------------------
-- PERBAIKAN STATUS IKLAN (AKTIF, TERJUAL, DIARSIPKAN)
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- 1. Tambahkan kolom status jika belum ada (default 'aktif')
ALTER TABLE iklan ADD COLUMN IF NOT EXISTS status text DEFAULT 'aktif';

-- 2. Migrasikan status 'tersedia' lama menjadi 'aktif'
UPDATE iklan SET status = 'aktif' WHERE status IS NULL OR status = 'tersedia';

-- 3. Buat indeks untuk mempercepat pencarian iklan aktif
CREATE INDEX IF NOT EXISTS idx_iklan_status ON iklan(status);
CREATE INDEX IF NOT EXISTS idx_iklan_penjual_status ON iklan(penjual_id, status);
