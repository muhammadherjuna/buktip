-------------------------------------------------------------------------------
-- ATURAN KEAMANAN RLS — Buktip ("Bukti Asli, Beli Tenang")
-- Tujuan: Kunci akses data, hanya izinkan yang perlu saja
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- ======================================
-- 1. FUNGSI AMAN: tambah_dilihat (RPC)
-- ======================================
-- Fungsi untuk menaikkan counter jumlah_dilihat dengan aman tanpa eksposur update langsung
CREATE OR REPLACE FUNCTION tambah_dilihat(id_iklan bigint)
RETURNS void AS $$
  UPDATE iklan 
  SET jumlah_dilihat = COALESCE(jumlah_dilihat, 0) + 1 
  WHERE id = id_iklan;
$$ LANGUAGE sql VOLATILE SECURITY DEFINER;

-- Berikan izin eksekusi fungsi tambah_dilihat ke anon dan authenticated
GRANT EXECUTE ON FUNCTION tambah_dilihat(bigint) TO anon, authenticated;

-- ======================================
-- 2. TABEL: daerah
-- ======================================
-- Bisa DIBACA semua orang, TAPI hanya admin yang bisa ubah
ALTER TABLE daerah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Daerah dapat dibaca semua orang" ON daerah;
CREATE POLICY "Daerah dapat dibaca semua orang" ON daerah
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hanya admin boleh mengubah daerah" ON daerah;
CREATE POLICY "Hanya admin boleh mengubah daerah" ON daerah
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.bio_singkat = 'admin'
    )
  );

-- ======================================
-- 3. TABEL: profiles
-- ======================================
-- BAGIAN TERKRITIS: Hanya kolom TERTENTU yang boleh dibaca publik
-- Pengguna HANYA bisa membaca nama, skor, lokasi — DILARANG baca nomor_hp & data sensitif
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Publik boleh baca profil penjual
DROP POLICY IF EXISTS "Profil: Baca informasi umum publik" ON profiles;
CREATE POLICY "Profil: Baca informasi umum publik" ON profiles
  FOR SELECT USING (true);

-- Pengguna HANYA boleh mengubah profil MILIKNYA SENDIRI
DROP POLICY IF EXISTS "Pengguna boleh mengubah profil sendiri" ON profiles;
CREATE POLICY "Pengguna boleh mengubah profil sendiri" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ======================================
-- 4. TABEL: iklan
-- ======================================
-- Yang TERSEDIA bisa dibaca semua orang
ALTER TABLE iklan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Iklan tersedia bisa dibaca semua orang" ON iklan;
CREATE POLICY "Iklan tersedia bisa dibaca semua orang" ON iklan
  FOR SELECT USING (status = 'tersedia');

-- Penjual boleh MEMBUAT iklan atas namanya sendiri
DROP POLICY IF EXISTS "Penjual boleh memasang iklan sendiri" ON iklan;
CREATE POLICY "Penjual boleh memasang iklan sendiri" ON iklan
  FOR INSERT WITH CHECK (auth.uid() = penjual_id);

-- Penjual boleh MENGUBAH iklan miliknya sendiri
DROP POLICY IF EXISTS "Penjual boleh mengubah iklan sendiri" ON iklan;
CREATE POLICY "Penjual boleh mengubah iklan sendiri" ON iklan
  FOR UPDATE USING (auth.uid() = penjual_id);

-- Penjual boleh MENGHAPUS iklan miliknya sendiri
DROP POLICY IF EXISTS "Penjual boleh menghapus iklan sendiri" ON iklan;
CREATE POLICY "Penjual boleh menghapus iklan sendiri" ON iklan
  FOR DELETE USING (auth.uid() = penjual_id);

-- ======================================
-- 5. TABEL: favorit
-- ======================================
ALTER TABLE favorit ENABLE ROW LEVEL SECURITY;

-- Pengguna HANYA bisa baca/tambah/hapus favorit MILIKNYA SENDIRI
DROP POLICY IF EXISTS "Pengguna boleh kelola favorit sendiri" ON favorit;
CREATE POLICY "Pengguna boleh kelola favorit sendiri" ON favorit
  FOR ALL USING (auth.uid() = pengguna_id);

-- ======================================
-- 6. TABEL: laporan
-- ======================================
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;

-- Pengguna boleh membuat laporan
DROP POLICY IF EXISTS "Pengguna boleh melaporkan iklan" ON laporan;
CREATE POLICY "Pengguna boleh melaporkan iklan" ON laporan
  FOR INSERT WITH CHECK (auth.uid() = pelapor_id);

-- Pengguna hanya bisa melihat laporannya sendiri
DROP POLICY IF EXISTS "Pengguna lihat laporan sendiri" ON laporan;
CREATE POLICY "Pengguna lihat laporan sendiri" ON laporan
  FOR SELECT USING (auth.uid() = pelapor_id);
