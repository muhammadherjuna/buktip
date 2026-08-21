import { useEffect, useState, useMemo } from 'react';
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
  Lock,
  Handshake,
  User,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Smartphone,
  Info,
  ZoomIn,
  X,
  Check,
  Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatTanggal } from '../lib/utils';
import { isFavorit, toggleFavorit } from '../lib/favorit';
import { useAuth } from '../contexts/AuthContext';
import IklanCard from '../components/iklan/IklanCard';
import ShareCardModal from '../components/common/ShareCardModal';
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
  const [deskripsiExpanded, setDeskripsiExpanded] = useState(false);
  const [modalBuktiOpen, setModalBuktiOpen] = useState(false);
  const [modalShareOpen, setModalShareOpen] = useState(false);

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

  // Fetch Data Iklan & Iklan Terkait
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

          // Update judul tab browser
          document.title = `${data.merek} ${data.tipe} | Buktip`;

          // Ambil 4 Iklan Terkait berdasarkan Merek atau Penjual
          fetchIklanTerkait(data.merek, data.id, data.penjual_id);
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

    const fetchIklanTerkait = async (merek, currentId, penjualId) => {
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
      window.scrollTo(0, 0);
      fetchDetailIklan();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handler Tombol Favorit
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

  // Handler Tombol Laporkan Iklan
  const handleLaporkan = () => {
    if (!iklan) return;
    const reportMsg = `Laporan Iklan: [Kode: ${iklan.kode_verifikasi || 'KB-XXXX'}] [ID: ${iklan.id}] - ${iklan.merek} ${iklan.tipe}`;
    const adminWa = `https://wa.me/6281234567890?text=${encodeURIComponent(reportMsg)}`;
    window.open(adminWa, '_blank');
  };

  // Format tautan WhatsApp aman
  const getWhatsAppLink = () => {
    if (!iklan || iklan.status === 'terjual') return '#';
    let noHp = iklan.profiles?.nomor_hp || '081234567890';
    noHp = noHp.replace(/\D/g, '');
    if (noHp.startsWith('0')) {
      noHp = '62' + noHp.slice(1);
    } else if (noHp.startsWith('8')) {
      noHp = '62' + noHp;
    }

    const pesan = `Halo, saya tertarik dengan HP ${iklan.merek} ${iklan.tipe} (Kode: ${iklan.kode_verifikasi || ''}) yang Anda pasang di Buktip. Apakah masih tersedia?`;
    return `https://wa.me/${noHp}?text=${encodeURIComponent(pesan)}`;
  };

  // IMEI tersamarkan untuk keamanan
  const getMaskedImei = (imei) => {
    if (!imei) return 'Tidak dicantumkan';
    const clean = String(imei).trim();
    if (clean.length <= 6) return clean;
    return clean.slice(0, clean.length - 4) + '••••';
  };

  // Gabungkan semua foto untuk galeri (utama + foto tambahan)
  const semuaFoto = useMemo(() => {
    if (!iklan) return [];
    return [
      iklan.foto_utama_url,
      ...(Array.isArray(iklan.foto_lain_urls) ? iklan.foto_lain_urls : [])
    ].filter(Boolean);
  }, [iklan]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-medium">Memuat detail iklan terverifikasi...</p>
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
          to="/semua-iklan"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lihat Katalog HP Lainnya</span>
        </Link>
      </div>
    );
  }

  const isTerjual = iklan.status === 'terjual';
  const fallbackUtama = `https://picsum.photos/seed/${iklan.id || 'buktip-detail'}/800/600`;
  const urlTampil = semuaFoto[fotoAktifIndex] || iklan.foto_utama_url || fallbackUtama;

  const handlePrevFoto = () => {
    if (fotoAktifIndex > 0) setFotoAktifIndex((prev) => prev - 1);
  };

  const handleNextFoto = () => {
    if (fotoAktifIndex < semuaFoto.length - 1) setFotoAktifIndex((prev) => prev + 1);
  };

  // Deskripsi text cutoff (> 300 char)
  const deskripsiTeks = iklan.deskripsi || 'Penjual tidak menyertakan deskripsi tambahan.';
  const isDeskripsiPanjang = deskripsiTeks.length > 300;
  const deskripsiTampil = !isDeskripsiPanjang || deskripsiExpanded ? deskripsiTeks : `${deskripsiTeks.slice(0, 300)}...`;

  return (
    <div className="space-y-8 pb-24 sm:pb-16 max-w-7xl mx-auto py-2">
      
      {/* ================= BREADCRUMB NAVIGASI ================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
        <Link to="/" className="hover:text-teal-600 transition font-medium">
          Beranda
        </Link>
        <BreadcrumbArrow className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to={`/semua-iklan?merek=${encodeURIComponent(iklan.merek || '')}`} className="hover:text-teal-600 transition font-medium">
          {iklan.merek || 'Smartphone'}
        </Link>
        <BreadcrumbArrow className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
          {iklan.merek} {iklan.tipe} {iklan.kapasitas ? `(${iklan.kapasitas})` : ''}
        </span>
      </nav>

      {/* ================= LAYOUT UTAMA: 2 KOLOM (55% : 45%) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* ================= KOLOM KIRI (~55%): GALERI FOTO & DESKRIPSI ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. GALERI FOTO (Thumbnail Vertikal di Kiri Desktop / Horizontal di Mobile) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
              
              {/* Thumbnail Vertikal (Maksimal 5) */}
              {semuaFoto.length > 1 && (
                <div className="flex md:flex-col gap-2.5 overflow-hidden w-full md:w-20 shrink-0">
                  {semuaFoto.slice(0, 5).map((foto, idx) => {
                    const isLastSlot = idx === 4 && semuaFoto.length > 5;
                    const sisaFoto = semuaFoto.length - 4;
                    const isActive = fotoAktifIndex === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFotoAktifIndex(idx)}
                        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-slate-100 cursor-pointer ${
                          isActive 
                            ? 'border-teal-600 ring-2 ring-teal-200' 
                            : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
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
                        {isLastSlot && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-bold">
                            +{sisaFoto}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Foto Besar Utama */}
              <div className="relative flex-1 w-full max-h-[460px] h-[320px] sm:h-[420px] md:h-[460px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 group">
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
                
                {/* Badge Terbukti Asli di Pojok Kiri Atas */}
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

                {/* Overlay Jika Sudah Terjual */}
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

            </div>
          </div>

          {/* 2. DESKRIPSI BARANG (DENGAN EXPAND / COLLAPSE 300 CHAR) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-100">
              Deskripsi Barang
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {deskripsiTampil}
            </div>
            {isDeskripsiPanjang && (
              <button
                type="button"
                onClick={() => setDeskripsiExpanded(!deskripsiExpanded)}
                className="text-xs font-bold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>{deskripsiExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}</span>
                {deskripsiExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* 3. TABEL SPESIFIKASI LENGKAP */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-100">
              Spesifikasi Lengkap
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Merek</span>
                <span className="font-bold text-slate-900">{iklan.merek || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Tipe HP</span>
                <span className="font-bold text-slate-900">{iklan.tipe || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Kapasitas</span>
                <span className="font-bold text-slate-900">{iklan.kapasitas || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Warna</span>
                <span className="font-bold text-slate-900">{iklan.warna || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Kondisi Fisik</span>
                <span className="font-bold text-emerald-700">{iklan.kondisi || 'Baik'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Kesehatan Baterai</span>
                <span className="font-bold text-slate-900">{iklan.kesehatan_baterai ? `${iklan.kesehatan_baterai}%` : 'Normal'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Nomor IMEI</span>
                <span className="font-mono font-semibold text-slate-700">{getMaskedImei(iklan.imei)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Kelengkapan</span>
                <span className="font-medium text-slate-900">{iklan.kelengkapan || 'Unit Saja'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 sm:col-span-2">
                <span className="text-slate-500">Negosiasi Harga</span>
                <span className="font-bold text-teal-700">{iklan.harga_negosiasi ? 'Bisa Nego Santai' : 'Harga Pas'}</span>
              </div>
            </div>
          </div>

          {/* 4. FOTO BUKTI KEPEMILIKAN FISIK */}
          {iklan.foto_bukti_kepemilikan_url && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-teal-900">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                    Foto Bukti Kepemilikan Fisik
                  </h3>
                  <p className="text-xs text-slate-500">
                    Foto fisik unit HP berdampingan dengan kertas kode resmi Buktip
                  </p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200 bg-slate-950 aspect-[4/3] max-h-96 flex items-center justify-center">
                <img
                  src={iklan.foto_bukti_kepemilikan_url}
                  alt={`Bukti Kepemilikan ${iklan.kode_verifikasi}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs text-white text-xs font-mono font-bold px-3 py-1 rounded-lg border border-white/20">
                  Kode: {iklan.kode_verifikasi || 'KB-XXXX'}
                </div>
              </div>

              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs text-teal-800 block">Kode di Layar:</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-teal-950">{iklan.kode_verifikasi || 'KB-XXXX'}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-teal-800 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-xs inline-flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-teal-600" />
                    <span>Cocokkan dengan Tulisan di Foto</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalBuktiOpen(true)}
                    className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-xl shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span>Inspeksi Bukti</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ================= KOLOM KANAN (~45%): INFORMASI & AKSI ================= */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
            
            {/* Baris 1: Judul HP & Tombol Favorit */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  {iklan.merek}
                </span>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
                  {iklan.merek} {iklan.tipe}
                </h1>
                {iklan.kapasitas && (
                  <p className="text-xs text-slate-500 font-medium">
                    Kapasitas {iklan.kapasitas} {iklan.warna ? `• Warna ${iklan.warna}` : ''}
                  </p>
                )}
              </div>

              {/* Tombol Favorit ❤️ */}
              <button
                type="button"
                onClick={handleToggleFavorit}
                aria-label="Simpan Favorit"
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition shrink-0 cursor-pointer border ${
                  favorit
                    ? 'bg-red-50 text-red-500 border-red-200 scale-105 shadow-sm'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${favorit ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {/* Baris 2: 4 Lencana Kepercayaan Buktip (2×2 Grid) */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-semibold text-slate-800">Terbukti Asli</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Handshake className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Antar Orang</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-slate-800">Lokal Kebumen</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">WA Terjaga</span>
              </div>
            </div>

            {/* Baris 3: Harga Sangat Besar & Nego */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-teal-600 tracking-tight">
                  {formatRupiah(iklan.harga)}
                </span>
                {iklan.harga_negosiasi && (
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Nego
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {iklan.harga_negosiasi ? 'Harga bisa dibicarakan santai langsung dengan penjual' : 'Harga pas (tanpa negosiasi)'}
              </p>
            </div>

            {/* Baris 4: Tombol CTA Utama (WhatsApp & Bagikan Gambar) */}
            <div className="space-y-2.5">
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
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm sm:text-base cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Hubungi Penjual via WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setModalShareOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-teal-50/70 text-slate-700 hover:text-teal-700 font-bold rounded-2xl border border-slate-200 hover:border-teal-300 transition text-xs sm:text-sm cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-teal-600" />
                <span>Bagikan Gambar Promosi (WA / IG Story)</span>
              </button>
            </div>

            {/* Baris 5: Kartu Profil Penjual 👤 */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-base border border-teal-200 shrink-0">
                  {iklan.profiles?.nama_lengkap ? iklan.profiles.nama_lengkap.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {iklan.profiles?.nama_lengkap || 'Penjual Terverifikasi'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      4.9 / 5.0
                    </span>
                    <span>•</span>
                    <span>Penjual Aktif</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Iklan Terdaftar</span>
                <Link
                  to="/semua-iklan"
                  className="font-bold text-teal-700 hover:text-teal-900 underline"
                >
                  Lihat Iklan Lainnya →
                </Link>
              </div>
            </div>

            {/* Baris 6: Lokasi Transaksi 📍 */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Lokasi Pertemuan COD</span>
              </div>
              <p className="font-semibold text-slate-800 pl-5">
                {iklan.lokasi_detail || 'Kebumen Kota, Jawa Tengah'}
              </p>
              <p className="text-[11px] text-slate-500 pl-5 leading-tight">
                Detail titik temu akan disepakati bersama via WhatsApp setelah menghubungi penjual.
              </p>
            </div>

            {/* Baris 7: Kartu Kode Verifikasi 🛡️ */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900">Kode Verifikasi Buktip</span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-200/60 px-2 py-0.5 rounded">Resmi</span>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-teal-950 tracking-wider">
                {iklan.kode_verifikasi || 'KB-XXXX'}
              </div>
              <p className="text-[11px] text-teal-800 leading-tight">
                Cocokkan kode ini dengan kode yang tertulis di foto bukti kepemilikan fisik.
              </p>
            </div>

            {/* Info Statistik & Laporkan */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Dilihat {iklan.jumlah_dilihat || 1}x</span>
              </div>
              <button
                type="button"
                onClick={handleLaporkan}
                className="text-red-500 hover:text-red-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Laporkan Iklan</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ================= SECTION BAWAH 1: IKLAN TERKAIT ================= */}
      {iklanTerkait.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
              Iklan Lain yang Mungkin Anda Suka
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilihan smartphone terverifikasi sejenis dari penjual di Buktip
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {iklanTerkait.map((item) => (
              <IklanCard key={item.id} iklan={item} />
            ))}
          </div>
        </section>
      )}

      {/* ================= SECTION BAWAH 2: 3 ALASAN KENAPA TRANSAKSI DI BUKTIP LEBIH AMAN ================= */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
            3 Alasan Kenapa Transaksi di Buktip Lebih Aman
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Perlindungan maksimal untuk pembeli tanpa biaya tambahan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">1. Foto Terbukti</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap iklan wajib menyertakan foto bukti kepemilikan dengan kode unik sistem. Bukan foto curian dari internet.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">2. Cek Langsung Saat Bertemu</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kami menyarankan bertemu di tempat aman. Anda bisa memeriksa semua fungsi HP sebelum membayar. Uang baru diserahkan setelah puas.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">3. Harga Adil Antar Orang</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tanpa perantara toko yang mengambil keuntungan besar. Harga murni kesepakatan langsung antara Anda dan penjual.
            </p>
          </div>

        </div>
      </section>

      {/* ================= MODAL INSPEKSI KEASLIAN BUKTI FISIK ================= */}
      {modalBuktiOpen && iklan.foto_bukti_kepemilikan_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Inspeksi Bukti Kepemilikan Fisik
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifikasi kode unik anti-curian resmi Buktip
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalBuktiOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Foto Bukti Resolusi Penuh */}
            <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
              <img
                src={iklan.foto_bukti_kepemilikan_url}
                alt={`Bukti Fisik ${iklan.kode_verifikasi}`}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-mono text-xs px-3 py-1 rounded-lg border border-white/20">
                Kode Sistem: {iklan.kode_verifikasi}
              </div>
            </div>

            {/* Checklist Verifikasi Keamanan */}
            <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-600" />
                <span>Panduan Verifikasi Pembeli</span>
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Pastikan tulisan tangan kode <strong className="font-mono text-teal-950 font-bold">{iklan.kode_verifikasi}</strong> di atas kertas kertas cocok persis.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Kertas bertuliskan kode harus berada dalam 1 frame foto bersama fisik unit HP.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Saat COD, periksa kembali fisik HP dan cocokkan dengan foto sebelum menyelesaikan pembayaran.</span>
                </div>
              </div>
            </div>

            {/* Tombol Tutup */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalBuktiOpen(false)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Saya Mengerti & Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL SOCIAL SHARE CARD GENERATOR ================= */}
      <ShareCardModal
        isOpen={modalShareOpen}
        onClose={() => setModalShareOpen(false)}
        iklan={iklan}
      />

    </div>
  );
}
