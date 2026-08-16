import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Eye, 
  Calendar, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertTriangle,
  ChevronRight as BreadcrumbArrow,
  CheckCircle2,
  Share2,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatTanggal } from '../lib/utils';
import { isFavorit, toggleFavorit } from '../lib/favorit';
import { useAuth } from '../contexts/AuthContext';
import FotoBukti from '../components/iklan/FotoBukti';
import SpecList from '../components/iklan/SpecList';
import PenjualCard from '../components/iklan/PenjualCard';
import IklanCard from '../components/iklan/IklanCard';
import toast from 'react-hot-toast';

export default function DetailIklan() {
  const { id } = useParams();
  const { user } = useAuth();
  const [iklan, setIklan] = useState(null);
  const [iklanTerkait, setIklanTerkait] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoAktifIndex, setFotoAktifIndex] = useState(0);
  const [favorit, setFavorit] = useState(false);

  // Fungsi menandai sudah dilihat berbasis hari di localStorage (Anti Manipulasi & Realtime Update)
  const tandaiSudahDilihat = async (iklanId) => {
    try {
      const kunci = `dilihat_iklan_${iklanId}_${new Date().toISOString().slice(0, 10)}`;
      const sudahDilihat = localStorage.getItem(kunci);

      if (!sudahDilihat) {
        const { data: counterBaru, error } = await supabase.rpc('tambah_dilihat', { id_iklan: Number(iklanId) });

        if (!error) {
          localStorage.setItem(kunci, 'ya');
          setIklan((prev) => {
            if (!prev) return prev;
            const count = counterBaru !== undefined && counterBaru !== null ? Number(counterBaru) : (Number(prev.jumlah_dilihat) || 0) + 1;
            return { ...prev, jumlah_dilihat: count };
          });
        }
      }
    } catch (e) {
      console.warn('Peringatan saat update jumlah dilihat:', e);
    }
  };

  // Fetch Detail Iklan & Iklan Terkait (FITUR 8)
  useEffect(() => {
    let isMounted = true;

    const fetchDetailIklan = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('iklan')
          .select(`
            *,
            profiles (nama_lengkap, nomor_hp, skor_kepercayaan, total_transaksi_sukses, foto_profil, daerah_id)
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (isMounted) {
          setIklan(data);
          setFotoAktifIndex(0);
          setFavorit(isFavorit(data.id));
          tandaiSudahDilihat(id);

          // Ambil 4 Iklan Terkait berdasarkan Merek
          fetchIklanTerkait(data.merek, data.id);
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat memuat detail iklan:', err);
        if (isMounted) {
          setError(err.message || 'Gagal memuat informasi iklan.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchIklanTerkait = async (merek, currentId) => {
      try {
        let query = supabase
          .from('iklan')
          .select('*, profiles(nama_lengkap)')
          .neq('id', currentId)
          .or('status.eq.aktif,status.eq.tersedia,status.is.null')
          .order('dibuat_pada', { ascending: false })
          .limit(4);

        if (merek) {
          query = query.eq('merek', merek);
        }

        const { data: terkaitData } = await query;
        if (terkaitData && terkaitData.length > 0) {
          setIklanTerkait(terkaitData);
        } else {
          // Fallback ke iklan aktif terbaru apa saja jika merek sama tidak ada
          const { data: fallbackData } = await supabase
            .from('iklan')
            .select('*, profiles(nama_lengkap)')
            .neq('id', currentId)
            .or('status.eq.aktif,status.eq.tersedia,status.is.null')
            .order('dibuat_pada', { ascending: false })
            .limit(4);

          setIklanTerkait(fallbackData || []);
        }
      } catch (e) {
        console.warn('Gagal memuat iklan terkait:', e);
      }
    };

    if (id) {
      fetchDetailIklan();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handler Tombol Favorit (FITUR 3)
  const handleToggleFavorit = () => {
    if (!iklan) return;
    const isNowFav = toggleFavorit(iklan);
    setFavorit(isNowFav);

    if (isNowFav) {
      toast.success('Disimpan ke Favorit');
      if (!user) {
        toast('Silakan login untuk menyimpan favorit secara permanen', { icon: 'ℹ️' });
      }
    } else {
      toast('Dihapus dari Favorit');
    }
  };

  // Handler Tombol Laporkan Iklan ke Admin WhatsApp
  const handleLaporkan = () => {
    if (!iklan) return;
    const reportMsg = `Laporan Iklan: [Kode: ${iklan.kode_verifikasi || 'KB-XXXX'}] [ID: ${iklan.id}] - ${iklan.merek} ${iklan.tipe}`;
    const adminWa = `https://wa.me/6281234567890?text=${encodeURIComponent(reportMsg)}`;
    window.open(adminWa, '_blank');
  };

  // Format nomor WhatsApp aman (FITUR 7: disabled jika terjual)
  const getWhatsAppLink = () => {
    if (!iklan || iklan.status === 'terjual') return '#';
    let noHp = iklan.profiles?.nomor_hp || '081234567890';
    noHp = noHp.replace(/\D/g, '');
    if (noHp.startsWith('0')) {
      noHp = '62' + noHp.slice(1);
    } else if (noHp.startsWith('8')) {
      noHp = '62' + noHp;
    }

    const pesan = `Halo, saya tertarik dengan HP ${iklan.merek} ${iklan.tipe} (Kode: ${iklan.kode_verifikasi || ''}) di Buktip. Apakah masih tersedia?`;
    return `https://wa.me/${noHp}?text=${encodeURIComponent(pesan)}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-medium">Memuat detail iklan...</p>
      </div>
    );
  }

  if (error || !iklan) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Iklan Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-500">
          {error || 'Iklan yang Anda cari mungkin telah dihapus atau sudah tidak tersedia.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const isTerjual = iklan.status === 'terjual';

  // Gabungkan semua foto untuk galeri
  const semuaFoto = [
    iklan.foto_utama_url,
    ...(Array.isArray(iklan.foto_lain_urls) ? iklan.foto_lain_urls : [])
  ].filter(Boolean);

  const fallbackUtama = `https://picsum.photos/seed/${iklan.id || 'buktip-detail'}/800/600`;
  const urlTampil = semuaFoto[fotoAktifIndex] || iklan.foto_utama_url || fallbackUtama;

  const handlePrevFoto = () => {
    if (fotoAktifIndex > 0) setFotoAktifIndex((prev) => prev - 1);
  };

  const handleNextFoto = () => {
    if (fotoAktifIndex < semuaFoto.length - 1) setFotoAktifIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 pb-20 sm:pb-12">
      
      {/* ================= FITUR 5: BREADCRUMB NAVIGASI ================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
        <Link to="/" className="hover:text-teal-600 transition flex items-center gap-1 font-medium">
          Beranda
        </Link>
        <BreadcrumbArrow className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/" className="hover:text-teal-600 transition font-medium">
          {iklan.merek || 'Smartphone'}
        </Link>
        <BreadcrumbArrow className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
          {iklan.merek} {iklan.tipe} {iklan.kapasitas ? `(${iklan.kapasitas})` : ''}
        </span>
      </nav>

      {/* Grid 2 Kolom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= KOLOM KIRI (KONTEN UTAMA) ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. GALERI FOTO */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-sm space-y-4">
            {/* Foto Utama Besar */}
            <div className="relative w-full max-h-[460px] h-[320px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 group">
              <img
                src={urlTampil}
                alt={`${iklan.merek} ${iklan.tipe}`}
                className={`w-full h-full object-contain transition duration-300 select-none ${
                  isTerjual ? 'grayscale-30 opacity-85' : ''
                }`}
                onError={(e) => {
                  e.currentTarget.src = fallbackUtama;
                }}
              />
              
              {/* Badge Terbukti di atas foto */}
              {iklan.foto_bukti_kepemilikan_url ? (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md ring-2 ring-white/90">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Terbukti Asli</span>
                </div>
              ) : (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-700/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-xs">
                  <AlertCircle className="w-4 h-4 text-slate-300" />
                  <span>Belum Diverifikasi</span>
                </div>
              )}

              {/* Lencana Terjual jika status terjual (FITUR 7) */}
              {isTerjual && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10">
                  <div className="bg-amber-400 text-slate-950 font-black text-sm sm:text-base px-5 py-2 rounded-full shadow-2xl tracking-wider uppercase flex items-center gap-2 border border-amber-200">
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>Sudah Terjual</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1.5">
                    Unit ini telah berhasil ditransaksikan
                  </p>
                </div>
              )}

              {/* Indikator Urutan Foto */}
              {semuaFoto.length > 1 && (
                <div className="absolute top-3 right-3 bg-slate-900/75 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md border border-white/10">
                  {fotoAktifIndex + 1} / {semuaFoto.length}
                </div>
              )}

              {/* Tombol Panah Kiri */}
              {semuaFoto.length > 1 && fotoAktifIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevFoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg backdrop-blur-xs transition cursor-pointer border border-white/20"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Tombol Panah Kanan */}
              {semuaFoto.length > 1 && fotoAktifIndex < semuaFoto.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextFoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg backdrop-blur-xs transition cursor-pointer border border-white/20"
                  aria-label="Foto Berikutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Thumbnail Selector */}
            {semuaFoto.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                {semuaFoto.map((foto, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFotoAktifIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 bg-slate-100 cursor-pointer ${
                      fotoAktifIndex === idx 
                        ? 'border-teal-600 ring-2 ring-teal-200' 
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={foto}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/thumb-${idx}/150/100`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. KOTAK KODE VERIFIKASI & LENCANA TERBUKTI ASLI */}
          {iklan.foto_bukti_kepemilikan_url ? (
            <div className="bg-teal-50/90 border border-teal-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-teal-900">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold tracking-wide uppercase text-teal-950 font-serif">
                    Terbukti Asli
                  </h3>
                  <p className="text-xs text-teal-800 font-medium">
                    Penjual telah melampirkan foto bukti kepemilikan fisik dengan kode:
                  </p>
                </div>
              </div>

              <div className="py-2 flex items-center gap-3">
                <span className="inline-block bg-white text-teal-900 font-mono text-2xl sm:text-3xl font-black px-5 py-2 rounded-2xl border-2 border-teal-300 shadow-sm tracking-wider">
                  {iklan.kode_verifikasi || 'KB-XXXX'}
                </span>
                <span className="text-xs font-semibold text-teal-700 bg-teal-100/80 px-3 py-1 rounded-full">
                  Cocokkan di Foto
                </span>
              </div>

              <p className="text-xs text-teal-800 leading-relaxed font-medium">
                Cocokkan kode ini dengan kode yang tertulis di kertas pada foto bukti kepemilikan fisik di bawah.
              </p>
            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
              <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Belum Diverifikasi
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Iklan ini belum melampirkan foto bukti kepemilikan fisik dengan kode unik.
                </p>
              </div>
            </div>
          )}

          {/* 3. LOKASI TITIK TEMU */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
              <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
              <h3>Lokasi Titik Temu COD</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-800 font-semibold pt-1">
              {iklan.lokasi_detail || 'Kebumen, Jawa Tengah'}
            </p>
            <p className="text-xs text-slate-400">
              Disepakati untuk pertemuan dan pengecekan fisik unit secara langsung sebelum pembayaran.
            </p>
          </div>

          {/* 4. SPESIFIKASI DETAIL */}
          <SpecList iklan={iklan} />

          {/* 5. DESKRIPSI LENGKAP */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg pb-3 border-b border-slate-100">
              Deskripsi Lengkap
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {iklan.deskripsi || 'Penjual tidak menyertakan deskripsi tambahan untuk unit ini.'}
            </div>
          </div>

          {/* 6. BAGIAN FOTO BUKTI KEPEMILIKAN */}
          {iklan.foto_bukti_kepemilikan_url && (
            <FotoBukti
              fotoUrl={iklan.foto_bukti_kepemilikan_url}
              kodeVerifikasi={iklan.kode_verifikasi}
            />
          )}

        </div>

        {/* ================= KOLOM KANAN (HARGA & AKSI) ================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Card Harga & Tombol Aksi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            
            {/* Banner Status Terjual (FITUR 7) */}
            {isTerjual && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <strong className="text-amber-900 font-bold block">Status: Sudah Terjual</strong>
                  <span className="text-amber-700">Unit ini sudah tidak dapat dihubungi.</span>
                </div>
              </div>
            )}

            {/* Merek, Tipe & Harga */}
            <div className="space-y-2">
              <h1 className="font-serif font-black text-xl sm:text-2xl text-slate-900 leading-tight">
                {iklan.merek} {iklan.tipe}
              </h1>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-teal-600 tracking-tight">
                  {formatRupiah(iklan.harga)}
                </span>
                {iklan.harga_negosiasi && (
                  <span className="text-xs text-slate-400 font-medium">
                    (Bisa Nego)
                  </span>
                )}
              </div>
            </div>

            {/* Tombol Aksi Utama & Sekunder */}
            <div className="space-y-3 pt-2">
              {/* Tombol WhatsApp (FITUR 7: Dinonaktifkan jika terjual) */}
              {isTerjual ? (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-slate-200 text-slate-500 font-bold rounded-2xl text-sm sm:text-base cursor-not-allowed border border-slate-300"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Iklan Sudah Selesai (Terjual)</span>
                </button>
              ) : (
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md hover:shadow-xl transition-all text-sm sm:text-base cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Hubungi Penjual via WhatsApp</span>
                </a>
              )}

              {/* Tombol Simpan ke Favorit (FITUR 3) */}
              <button
                type="button"
                onClick={handleToggleFavorit}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition text-sm cursor-pointer border ${
                  favorit
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorit ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                <span>{favorit ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}</span>
              </button>
            </div>

            {/* Info Tambahan Statistik Iklan */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Dilihat {iklan.jumlah_dilihat || 1} kali</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatTanggal(iklan.dibuat_pada)}</span>
              </div>
            </div>

            {/* Tombol Laporkan Iklan Ini */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleLaporkan}
                className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors py-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Laporkan Iklan Ini</span>
              </button>
            </div>

          </div>

          {/* Card Informasi Penjual */}
          <PenjualCard
            penjual={iklan.profiles}
            lokasiDetail={iklan.lokasi_detail}
          />

        </div>

      </div>

      {/* ================= FITUR 8: SECTION IKLAN TERKAIT ================= */}
      {iklanTerkait.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
              Iklan Lainnya yang Mungkin Anda Suka
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Rekomendasi smartphone terverifikasi sejenis di Buktip
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {iklanTerkait.map((item) => (
              <IklanCard key={item.id} iklan={item} />
            ))}
          </div>
        </section>
      )}

      {/* ================= FITUR 6: TOMBOL STICKY DI BAWAH LAYAR ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 sm:p-4 z-40 shadow-2xl flex items-center justify-between gap-4 max-w-4xl mx-auto rounded-t-3xl sm:bottom-4 sm:rounded-3xl sm:border sm:inset-x-4">
        <div className="space-y-0.5 min-w-0">
          <span className="text-[11px] text-slate-500 block truncate">
            {iklan.merek} {iklan.tipe}
          </span>
          <span className="text-lg sm:text-xl font-black text-teal-600 tracking-tight block">
            {formatRupiah(iklan.harga)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleFavorit}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              favorit ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Favorit"
          >
            <Heart className={`w-5 h-5 ${favorit ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {isTerjual ? (
            <button
              type="button"
              disabled
              className="px-5 sm:px-8 py-3 bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm rounded-2xl cursor-not-allowed border border-slate-300"
            >
              Sudah Terjual
            </button>
          ) : (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 sm:px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span>Hubungi via WhatsApp</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
