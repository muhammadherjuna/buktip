-------------------------------------------------------------------------------
-- PERBAIKAN IZIN TABEL LENGKAP (GRANT PRIVILEGES & AUTO PROFILE)
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- 1. Berikan izin lengkap tabel & sequence ke role authenticated dan anon
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Set default privileges agar tabel/sequence baru di masa depan otomatis mendapat izin
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- 2. Pastikan semua user yang sudah terdaftar di auth.users memiliki baris profil di public.profiles
DO $$
DECLARE
  v_daerah_id bigint;
  u RECORD;
BEGIN
  SELECT id INTO v_daerah_id FROM daerah WHERE slug = 'kebumen' LIMIT 1;
  IF v_daerah_id IS NULL THEN
    SELECT id INTO v_daerah_id FROM daerah LIMIT 1;
  END IF;

  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    INSERT INTO profiles (
      id,
      nama_lengkap,
      daerah_id,
      skor_kepercayaan
    ) VALUES (
      u.id,
      COALESCE(u.raw_user_meta_data->>'nama_lengkap', split_part(u.email, '@', 1)),
      v_daerah_id,
      5.00
    )
    ON CONFLICT (id) DO UPDATE SET
      daerah_id = COALESCE(profiles.daerah_id, EXCLUDED.daerah_id);
  END LOOP;
END $$;
