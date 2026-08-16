/**
 * Helper Manajemen Favorit / Wishlist Buktip
 * Menyimpan data iklan favorit di localStorage dan menyinkronkan event antar komponen
 */

const STORAGE_KEY = 'buktip_favorit_iklan';

export function getFavoritIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items.map((it) => (typeof it === 'object' ? it.id : it)) : [];
  } catch (_) {
    return [];
  }
}

export function getFavoritItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (_) {
    return [];
  }
}

export function isFavorit(id) {
  if (!id) return false;
  const ids = getFavoritIds();
  return ids.some((itemId) => String(itemId) === String(id));
}

export function toggleFavorit(iklan) {
  if (!iklan || !iklan.id) return false;

  try {
    const items = getFavoritItems();
    const existingIndex = items.findIndex((it) => String(it.id) === String(iklan.id));
    let isNowFavorit = false;

    if (existingIndex >= 0) {
      // Hapus dari favorit
      items.splice(existingIndex, 1);
      isNowFavorit = false;
    } else {
      // Tambahkan ke favorit (simpan snapshot data penting)
      items.unshift({
        id: iklan.id,
        merek: iklan.merek,
        tipe: iklan.tipe,
        harga: iklan.harga,
        harga_negosiasi: iklan.harga_negosiasi,
        kondisi: iklan.kondisi,
        kapasitas: iklan.kapasitas,
        warna: iklan.warna,
        lokasi_detail: iklan.lokasi_detail,
        foto_utama_url: iklan.foto_utama_url,
        kode_verifikasi: iklan.kode_verifikasi,
        dibuat_pada: iklan.dibuat_pada,
        status: iklan.status || 'aktif',
      });
      isNowFavorit = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('buktip_favorit_updated'));
    return isNowFavorit;
  } catch (err) {
    console.warn('Gagal mengubah status favorit:', err);
    return false;
  }
}
