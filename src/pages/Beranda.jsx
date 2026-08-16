import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle, 
  Filter, 
  Smartphone,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import IklanGrid from '../components/iklan/IklanGrid';

export default function Beranda() {
  const [iklanList, setIklanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Pencarian & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [lokasiQuery, setLokasiQuery] = useState('');

  const fetchIklan = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil hanya iklan dengan status 'aktif' (atau 'tersedia' untuk kompatibilitas data lama)
      const { data, error: fetchError } = await supabase
        .from('iklan')
        .select('*, profiles(nama_lengkap)')
        .or('status.eq.aktif,status.eq.tersedia,status.is.null')
        .order('dibuat_pada', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Filter iklan lama > 90 hari
      const sekarang = new Date();
      const iklanAktif = (data || []).filter((item) => {
        const tgl = new Date(item.dibuat_pada || Date.now());
        const selisihHari = Math.floor((sekarang - tgl) / (1000 * 60 * 60 * 24));
        return selisihHari <= 90 && item.status !== 'terjual' && item.status !== 'diarsipkan';
      });

      setIklanList(iklanAktif);
      setFilteredList(iklanAktif);
    } catch (err) {
      console.error('Terjadi kesalahan saat memuat daftar iklan:', err);
      setError(err.message || 'Gagal memuat data iklan dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIklan();
  }, []);

  // Handler Pencarian & Filtering
  useEffect(() => {
    let hasil = [...iklanList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      hasil = hasil.filter(
        (item) =>
          (item.merek && item.merek.toLowerCase().includes(q)) ||
          (item.tipe && item.tipe.toLowerCase().includes(q)) ||
          (item.kode_verifikasi && item.kode_verifikasi.toLowerCase().includes(q))
      );
    }

    if (lokasiQuery.trim()) {
      const l = lokasiQuery.toLowerCase().trim();
      hasil = hasil.filter(
        (item) =>
          item.lokasi_detail && item.lokasi_detail.toLowerCase().includes(l)
      );
    }

    setFilteredList(hasil);
  }, [searchQuery, lokasiQuery, iklanList]);

  const handleResetFilter = () => {
    setSearchQuery('');
    setLokasiQuery('');
  };

  return (
    <div className="space-y-8">
      {/* 1. Bagian Banner Utama */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-600/60 backdrop-blur-sm border border-teal-400/30 text-teal-100 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Platform Jual Beli Terverifikasi Kode Buktip</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            📱 Cari HP Bekas Terverifikasi
          </h1>

          <p className="text-teal-100/90 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Semua iklan menyertakan foto fisik HP bersama kode unik terverifikasi
          </p>
        </div>

        {/* Ornamen latar belakang */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. Bagian Kotak Pencarian & Filter Lokasi */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Kotak Pencarian Utama (7 kolom) */}
          <div className="md:col-span-7 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama HP (contoh: iPhone 13, Samsung S22)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Baris Lokasi (5 kolom) */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="Filter lokasi (contoh: Kebumen)..."
              value={lokasiQuery}
              onChange={(e) => setLokasiQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
            {lokasiQuery && (
              <button
                type="button"
                onClick={() => setLokasiQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Indikator Filter Aktif */}
        {(searchQuery || lokasiQuery) && (
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span>
              Menampilkan hasil untuk:{' '}
              <strong className="text-teal-700">
                {[searchQuery && `"${searchQuery}"`, lokasiQuery && `Lokasi "${lokasiQuery}"`].filter(Boolean).join(' • ')}
              </strong>
            </span>
            <button
              type="button"
              onClick={handleResetFilter}
              className="text-teal-600 hover:text-teal-800 font-semibold underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* 3. Bagian Daftar Iklan Terbaru */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Daftar Smartphone Bekas Aktif
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Urutan dari iklan terbaru yang siap transaksi COD
            </p>
          </div>
        </div>

        {/* Penanganan Status Error */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-800">
                Gagal Memuat Iklan
              </h3>
              <p className="text-xs text-red-600 max-w-md mx-auto">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchIklan}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : !loading && filteredList.length === 0 ? (
          /* JIKA TIDAK ADA IKLAN DITEMUKAN */
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
              <Smartphone className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Belum Ada Iklan
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {searchQuery || lokasiQuery 
                  ? 'Tidak ada iklan yang sesuai dengan kata kunci pencarian Anda.' 
                  : 'Jadilah yang pertama menjual di Buktip!'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/pasang-iklan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Pasang Iklan Pertama</span>
              </Link>
            </div>
          </div>
        ) : (
          <IklanGrid iklanList={filteredList} isLoading={loading} />
        )}
      </section>
    </div>
  );
}
