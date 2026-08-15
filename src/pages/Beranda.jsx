import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, MapPin, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import IklanGrid from '../components/iklan/IklanGrid';

export default function Beranda() {
  const [iklanList, setIklanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIklan = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('iklan')
        .select('*, profiles(nama_lengkap)')
        .eq('status', 'tersedia')
        .order('dibuat_pada', { ascending: false })
        .limit(12);

      if (fetchError) {
        throw fetchError;
      }

      setIklanList(data || []);
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

  return (
    <div className="space-y-10">
      {/* 1. Bagian Banner Utama */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden text-center">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-600/60 backdrop-blur-sm border border-teal-400/30 text-teal-100 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Platform Terverifikasi Buktip</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Jual Beli HP Bekas Tanpa Foto Curian
          </h1>

          <p className="text-teal-100/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Setiap iklan di Buktip wajib menyertakan foto bukti kepemilikan dengan kode unik
          </p>
        </div>

        {/* Ornamen latar belakang */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. Bagian 3 Keunggulan Utama */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Keunggulan 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Foto Terbukti Asli
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Bukan curian, penjual foto bersama kode unik
          </p>
        </div>

        {/* Keunggulan 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Terpusat Per Daerah
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Tidak berantakan, fokus daerahmu
          </p>
        </div>

        {/* Keunggulan 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Cari & Filter Mudah
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Temukan HP impian dengan cepat
          </p>
        </div>
      </section>

      {/* 3. Bagian Daftar Iklan Terbaru */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Iklan Smartphone Terbaru
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilihan HP bekas terbaik yang siap dipinang
            </p>
          </div>
        </div>

        {/* Penanganan Status Error */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-800">
                Gagal Memuat Iklan
              </h3>
              <p className="text-xs text-red-600 max-w-md mx-auto">
                {error}. Pastikan tabel database di Supabase sudah dibuat dan tabel `iklan` dapat diakses.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchIklan}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : (
          <IklanGrid iklanList={iklanList} isLoading={loading} />
        )}
      </section>
    </div>
  );
}
