-------------------------------------------------------------------------------
-- Data Contoh Pengujian untuk Buktip ("Bukti Asli, Beli Tenang")
-- Cara pakai: Jalankan migrasi 001_skema_awal.sql terlebih dahulu, lalu tempel kode ini di SQL Editor Supabase.
--
-- PERINGATAN: Data ini hanya untuk pengujian, hapus saat produksi!
-------------------------------------------------------------------------------

-- 1. Tambah Data Daerah Contoh: Kebumen, Jawa Tengah
INSERT INTO daerah (nama, slug, provinsi, deskripsi, is_active)
VALUES (
  'Kebumen', 
  'kebumen', 
  'Jawa Tengah', 
  'Kabupaten Kebumen, Jawa Tengah - Area percontohan Buktip', 
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Buat Dummy User di auth.users & profiles jika belum ada akun
-- Menggunakan blok anonim PL/pgSQL agar aman dijalankan berulang kali
DO $$
DECLARE
  v_daerah_id bigint;
  v_user_id uuid := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  -- Ambil ID daerah Kebumen
  SELECT id INTO v_daerah_id FROM daerah WHERE slug = 'kebumen' LIMIT 1;

  -- Buat user dummy di auth.users (hanya untuk keperluan data pengujian lokal/staging)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'penjual.contoh@buktip.id',
      '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"nama_lengkap":"Budi Santoso"}',
      now(),
      now()
    );
  END IF;

  -- Buat profil penjual contoh
  INSERT INTO profiles (
    id,
    nama_lengkap,
    nomor_hp,
    daerah_id,
    alamat_lengkap,
    foto_profil,
    bio_singkat,
    nomor_hp_terverifikasi,
    total_iklan,
    total_transaksi_sukses,
    skor_kepercayaan
  ) VALUES (
    v_user_id,
    'Budi Santoso',
    '081234567890',
    v_daerah_id,
    'Jl. Pahlawan No. 45, Kebumen',
    'https://picsum.photos/seed/user-budi/200/200',
    'Penjual HP bekas terpercaya di Kebumen sejak 2023.',
    true,
    10,
    8,
    4.90
  )
  ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    daerah_id = EXCLUDED.daerah_id;

  -- 3. Hapus data iklan lama dengan kode verifikasi KB-001 s/d KB-010 jika ada, agar bersih
  DELETE FROM iklan WHERE kode_verifikasi IN ('KB-001', 'KB-002', 'KB-003', 'KB-004', 'KB-005', 'KB-006', 'KB-007', 'KB-008', 'KB-009', 'KB-010');

  -- 4. Tambah 10 Data Iklan Contoh
  INSERT INTO iklan (
    penjual_id,
    daerah_id,
    merek,
    tipe,
    kapasitas,
    warna,
    kondisi,
    harga,
    harga_negosiasi,
    lokasi_detail,
    kelengkapan,
    deskripsi,
    imei,
    kesehatan_baterai,
    foto_utama_url,
    foto_lain_urls,
    foto_bukti_kepemilikan_url,
    kode_verifikasi,
    status
  ) VALUES
  (
    v_user_id,
    v_daerah_id,
    'Apple',
    'iPhone 13 Pro',
    '128 GB',
    'Sierra Blue',
    'Sangat Baik',
    10500000,
    true,
    'Kebumen Kota (Dekat Alun-alun)',
    'Fullset original (box + kabel Type-C)',
    'Kondisi mulus 98%, iCloud aman bebas reset, Face ID normal, TrueTone aktif.',
    '352093847291823',
    88,
    'https://picsum.photos/seed/iphone13pro/600/450',
    ARRAY['https://picsum.photos/seed/ip13-1/600/450', 'https://picsum.photos/seed/ip13-2/600/450'],
    'https://picsum.photos/seed/bukti-kb001/600/450',
    'KB-001',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Samsung',
    'Galaxy S22 5G',
    '256 GB',
    'Phantom Black',
    'Sangat Baik',
    7200000,
    true,
    'Gombong, Kebumen',
    'Fullset, garansi SEIN resmi',
    'Layar Dynamic AMOLED 2X jernih, kamera 50MP super tajam, bodi no dent.',
    '358291039482910',
    92,
    'https://picsum.photos/seed/galaxys22/600/450',
    ARRAY['https://picsum.photos/seed/s22-1/600/450'],
    'https://picsum.photos/seed/bukti-kb002/600/450',
    'KB-002',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Xiaomi',
    'Redmi Note 12 Pro 5G',
    '256 GB',
    'Sky Blue',
    'Baik',
    3100000,
    false,
    'Karanganyar, Kebumen',
    'Unit + Charger 67W + Dus',
    'Pemakaian wajar 6 bulan, performa chipset Dimensity 1080 kencang buat gaming.',
    '869201928374619',
    90,
    'https://picsum.photos/seed/redminote12/600/450',
    ARRAY['https://picsum.photos/seed/rn12-1/600/450'],
    'https://picsum.photos/seed/bukti-kb003/600/450',
    'KB-003',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Apple',
    'iPhone 11',
    '64 GB',
    'Black',
    'Sedang',
    4200000,
    true,
    'Pejagoan, Kebumen',
    'Batangan + Charger OEM',
    'Fungsi normal semua, ada lecet pemakaian di sudut bezel, kamera dan speaker aman.',
    '359102938471920',
    78,
    'https://picsum.photos/seed/iphone11black/600/450',
    ARRAY['https://picsum.photos/seed/ip11-1/600/450'],
    'https://picsum.photos/seed/bukti-kb004/600/450',
    'KB-004',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Oppo',
    'Reno8 T 5G',
    '128 GB',
    'Midnight Black',
    'Baik',
    2850000,
    true,
    'Kutowinangun, Kebumen',
    'Fullset original',
    'Desain layar lengkung 120Hz mewah, kamera potret 108MP, baterai awet seharian.',
    '863920192837419',
    89,
    'https://picsum.photos/seed/opporeno8/600/450',
    ARRAY['https://picsum.photos/seed/reno8-1/600/450'],
    'https://picsum.photos/seed/bukti-kb005/600/450',
    'KB-005',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Vivo',
    'V27 5G',
    '256 GB',
    'Noble Black',
    'Sangat Baik',
    3750000,
    true,
    'Prembun, Kebumen',
    'Fullset lengkap dengan nota beli',
    'Aura Light Portrait normal, bodi mulus tanpa gores, siap pakai langsung.',
    '861928374619283',
    94,
    'https://picsum.photos/seed/vivov27/600/450',
    ARRAY['https://picsum.photos/seed/v27-1/600/450'],
    'https://picsum.photos/seed/bukti-kb006/600/450',
    'KB-006',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Google',
    'Pixel 6',
    '128 GB',
    'Kinda Coral',
    'Baik',
    4100000,
    false,
    'Kebumen Kota',
    'Unit + Softcase + Kabel',
    'Kamera khas Pixel juara, sinyal aman all operator, performa Google Tensor lancar.',
    '351928374619283',
    85,
    'https://picsum.photos/seed/pixel6coral/600/450',
    ARRAY['https://picsum.photos/seed/pixel6-1/600/450'],
    'https://picsum.photos/seed/bukti-kb007/600/450',
    'KB-007',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Samsung',
    'Galaxy A54 5G',
    '128 GB',
    'Awesome Violet',
    'Sangat Baik',
    3900000,
    true,
    'Klirong, Kebumen',
    'Fullset box + garansi resmi aktif',
    'Layar Super AMOLED cerah 120Hz, kamera OIS stabil, pemakaian pribadi terawat.',
    '358192837461920',
    95,
    'https://picsum.photos/seed/galaxya54/600/450',
    ARRAY['https://picsum.photos/seed/a54-1/600/450'],
    'https://picsum.photos/seed/bukti-kb008/600/450',
    'KB-008',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Xiaomi',
    'POCO F4 GT',
    '256 GB',
    'Stealth Black',
    'Sedang',
    3400000,
    true,
    'Alian, Kebumen',
    'Unit + Charger 120W',
    'Tombol trigger gaming pop-up normal, Snapdragon 8 Gen 1, ada gores tipis di backdoor.',
    '869102938471928',
    82,
    'https://picsum.photos/seed/pocof4gt/600/450',
    ARRAY['https://picsum.photos/seed/f4gt-1/600/450'],
    'https://picsum.photos/seed/bukti-kb009/600/450',
    'KB-009',
    'tersedia'
  ),
  (
    v_user_id,
    v_daerah_id,
    'Realme',
    'Realme 8 Pro',
    '128 GB',
    'Infinite Blue',
    'Butuh Servis',
    1350000,
    true,
    'Petanahan, Kebumen',
    'Unit only (Batangan)',
    'Mesin dan fungsi normal, layar ada retak rambut di pojok kanan bawah tapi sentuh masih lancar.',
    '863819283746192',
    75,
    'https://picsum.photos/seed/realme8pro/600/450',
    ARRAY['https://picsum.photos/seed/r8pro-1/600/450'],
    'https://picsum.photos/seed/bukti-kb010/600/450',
    'KB-010',
    'tersedia'
  );
END $$;
