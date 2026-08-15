-------------------------------------------------------------------------------
-- Migrasi awal skema database Buktip
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-- 
-- PENTING: RLS otomatis aktif karena pengaturan proyek saat pembuatan
-- Aturan akses akan dibuat di tahap berikutnya
-------------------------------------------------------------------------------

-- TABEL 1: daerah
CREATE TABLE daerah (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nama text NOT NULL,
  slug text NOT NULL UNIQUE,
  provinsi text NOT NULL,
  deskripsi text,
  is_active boolean DEFAULT true,
  dibuat_pada timestamptz DEFAULT now()
);

-- TABEL 2: profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap text NOT NULL,
  nomor_hp text,
  daerah_id bigint REFERENCES daerah(id),
  alamat_lengkap text,
  foto_profil text,
  bio_singkat text,
  nomor_hp_terverifikasi boolean DEFAULT false,
  total_iklan int DEFAULT 0,
  total_transaksi_sukses int DEFAULT 0,
  skor_kepercayaan numeric(3,2) DEFAULT 5.00,
  dibuat_pada timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);

-- TABEL 3: iklan
CREATE TABLE iklan (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  penjual_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daerah_id bigint NOT NULL REFERENCES daerah(id),
  merek text NOT NULL,
  tipe text NOT NULL,
  kapasitas text,
  warna text,
  kondisi text NOT NULL CHECK (kondisi IN ('Sangat Baik', 'Baik', 'Sedang', 'Butuh Servis')),
  harga bigint NOT NULL,
  harga_negosiasi boolean DEFAULT true,
  lokasi_detail text NOT NULL,
  kelengkapan text,
  deskripsi text,
  imei text,
  kesehatan_baterai int,
  foto_utama_url text NOT NULL,
  foto_lain_urls text[] DEFAULT '{}',
  foto_bukti_kepemilikan_url text NOT NULL,
  kode_verifikasi text NOT NULL,
  status text NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'terjual', 'dinonaktifkan', 'dilaporkan')),
  jumlah_dilihat int DEFAULT 0,
  dibuat_pada timestamptz DEFAULT now(),
  diperbarui_pada timestamptz DEFAULT now()
);

-- TABEL 4: laporan
CREATE TABLE laporan (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  iklan_id bigint NOT NULL REFERENCES iklan(id) ON DELETE CASCADE,
  pelapor_id uuid NOT NULL REFERENCES profiles(id),
  alasan text NOT NULL CHECK (alasan IN ('Foto curian', 'Penipuan', 'Barang tidak sesuai', 'Lainnya')),
  detail_alasan text,
  status text DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'sedang_ditinjau', 'diterima', 'ditolak')),
  tindakan text,
  dibuat_pada timestamptz DEFAULT now()
);

-- TABEL 5: favorit
CREATE TABLE favorit (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pengguna_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  iklan_id bigint NOT NULL REFERENCES iklan(id) ON DELETE CASCADE,
  dibuat_pada timestamptz DEFAULT now(),
  UNIQUE(pengguna_id, iklan_id)
);

-- INDEKS: Mempercepat pencarian dan pengurutan
CREATE INDEX idx_iklan_daerah ON iklan(daerah_id);
CREATE INDEX idx_iklan_penjual ON iklan(penjual_id);
CREATE INDEX idx_iklan_merek ON iklan(merek);
CREATE INDEX idx_iklan_harga ON iklan(harga);
CREATE INDEX idx_iklan_status ON iklan(status);
CREATE INDEX idx_profiles_daerah ON profiles(daerah_id);
