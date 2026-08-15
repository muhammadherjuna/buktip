/**
 * Mengubah angka menjadi format mata uang Rupiah.
 * Contoh: 1500000 -> "Rp 1.500.000"
 * 
 * @param {number|string} angka - Nilai angka yang ingin diformat
 * @returns {string} String format Rupiah
 */
export function formatRupiah(angka) {
  if (angka === null || angka === undefined || isNaN(Number(angka))) {
    return 'Rp 0';
  }
  const nilai = Math.round(Number(angka));
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nilai).replace('IDR', 'Rp').trim();
}

/**
 * Mengubah string tanggal menjadi format tanggal lokal Indonesia.
 * Contoh: "2026-08-15" -> "15 Agustus 2026"
 * 
 * @param {string|Date} dateString - String tanggal ISO atau objek Date
 * @returns {string} Tanggal dalam format Bahasa Indonesia
 */
export function formatTanggal(dateString) {
  if (!dateString) return '-';
  const tanggal = new Date(dateString);
  if (isNaN(tanggal.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(tanggal);
}

/**
 * Mengubah string tanggal menjadi format waktu relatif (misal: "2 jam lalu", "3 hari lalu").
 * 
 * @param {string|Date} dateString - String tanggal ISO atau objek Date
 * @returns {string} Waktu relatif dalam bahasa Indonesia
 */
export function formatWaktuRelatif(dateString) {
  if (!dateString) return '-';
  const tanggal = new Date(dateString);
  if (isNaN(tanggal.getTime())) return '-';

  const sekarang = new Date();
  const selisihDetik = Math.floor((sekarang - tanggal) / 1000);

  if (selisihDetik < 60) return 'Baru saja';
  const selisihMenit = Math.floor(selisihDetik / 60);
  if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
  const selisihJam = Math.floor(selisihMenit / 60);
  if (selisihJam < 24) return `${selisihJam} jam lalu`;
  const selisihHari = Math.floor(selisihJam / 24);
  if (selisihHari < 30) return `${selisihHari} hari lalu`;
  const selisihBulan = Math.floor(selisihHari / 30);
  if (selisihBulan < 12) return `${selisihBulan} bulan lalu`;
  return formatTanggal(dateString);
}

