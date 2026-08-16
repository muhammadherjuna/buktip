-------------------------------------------------------------------------------
-- PERBAIKAN FUNGSI RPC TAMBAH DILIHAT (REALTIME COUNTER)
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Tempel kode ini → Run
-------------------------------------------------------------------------------

-- 1. Hapus fungsi lama yang bertipe RETURNS void agar tipe data kembalian (RETURNS int) dapat diganti
DROP FUNCTION IF EXISTS tambah_dilihat(bigint);

-- 2. Buat fungsi RPC tambah_dilihat baru yang mengembalikan angka counter terbaru
CREATE OR REPLACE FUNCTION tambah_dilihat(id_iklan bigint)
RETURNS int AS $$
DECLARE
  v_baru int;
BEGIN
  UPDATE iklan 
  SET jumlah_dilihat = COALESCE(jumlah_dilihat, 0) + 1 
  WHERE id = id_iklan
  RETURNING jumlah_dilihat INTO v_baru;

  RETURN COALESCE(v_baru, 1);
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- 3. Berikan hak akses eksekusi ke peran anon dan authenticated
GRANT EXECUTE ON FUNCTION tambah_dilihat(bigint) TO anon, authenticated;
