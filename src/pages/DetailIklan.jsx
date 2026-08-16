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
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatTanggal } from '../lib/utils';
import FotoBukti from '../components/iklan/FotoBukti';
import SpecList from '../components/iklan/SpecList';
import PenjualCard from '../components/iklan/PenjualCard';
import toast from 'react-hot-toast';

export default function DetailIklan() {
  const { id } = useParams();
  const [iklan, setIklan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoAktifIndex, setFotoAktifIndex] = useState(0);

  // Fungsi menandai sudah dilihat berbasis hari di localStorage (Anti Manipulasi & Realtime Update)
  const tandaiSudahDilihat = async (iklanId) => {
    try {
      const kunci = `dilihat_iklan_${iklanId}_${new Date().toISOString().slice(0, 10)}`;
      const sudahDilihat = localStorage.getItem(kunci);

      if (!sudahDilihat) {
        const { data: counterBaru, error } = await supabase.rpc('tambah_dilihat', { id_iklan: Number(iklanId) });

        if (!error) {
          localStorage.setItem(kunci, 'ya');
          // Update state UI secara realtime seketika
          setIklan((prev) => {
            if (!prev) return prev;
            const count = counterBaru !== undefined && counterBaru !== null ? Number(counterBaru) : (Number(prev.jumlah_dilihat) || 0) + 1;
            return { ...prev, jumlah_dilihat: count };
          });
        } else {
          console.warn('Gagal memanggil RPC tambah_dilihat:', error.message);
        }
      }
    } catch (e) {
      console.warn('Peringatan saat update jumlah dilihat:', e);
    }
  };

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

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted) {
          setIklan(data);
          setFotoAktifIndex(0);
          tandaiSudahDilihat(id);
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

    if (id) {
      fetchDetailIklan();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handler Tombol Favorit
  const handleFavorit = () => {
    toast('Fitur favorit segera hadir!');
  };

  // Handler Tombol Laporkan Iklan ke Admin WhatsApp
  const handleLaporkan = () => {
    if (!iklan) return;
    const reportMsg = `Laporan Iklan: [Kode: ${iklan.kode_verifikasi || 'KB-XXXX'}] [ID: ${iklan.id}] - ${iklan.merek} ${iklan.tipe}`;
    const adminWa = `https://wa.me/6281234567890?text=${encodeURIComponent(reportMsg)}`;
    window.open(adminWa, '_blank');
  };

  // Format nomor WhatsApp aman (hanya tautan aman, tanpa menampilkan angka mentah)
  const getWhatsAppLink = () => {
    if (!iklan) return '#';
    let noHp = iklan.profiles?.nomor_hp || '081234567890';
    noHp = noHp.replace(/\D/g, ''); // Hapus karakter non-digit
    if (noHp.startsWith('0')) {
      noHp = '62' + noHp.slice(1);
    } else if (noHp.startsWith('8')) {
      noHp = '62' + noHp;
    }

    const pesan = `Halo, saya tertarik dengan HP ${iklan.merek} ${iklan.tipe} (Kode: ${iklan.kode_verifikasi || ''}) di Buktip. Apakah masih tersedia?`;
    return `https://wa.me/${noHp}?text=${encodeURIComponent(pesan)}`;
  };

  // State Memuat Data
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-medium">Memuat detail iklan...</p>
      </div>
    );
  }

  // State Error / Tidak Ditemukan
  if (error || !iklan) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  // Gabungkan semua foto untuk galeri (foto utama + foto lain)
  const semuaFoto = [
    iklan.foto_utama_url,
    ...(Array.isArray(iklan.foto_lain_urls) ? iklan.foto_lain_urls : [])
  ].filter(Boolean);

  const fallbackUtama = `https://picsum.photos/seed/${iklan.id || 'buktip-detail'}/800/600`;
  const urlTampil = semuaFoto[fotoAktifIndex] || iklan.foto_utama_url || fallbackUtama;

  const handlePrevFoto = () => {
    if (fotoAktifIndex > 0) {
      setFotoAktifIndex((prev) => prev - 1);
    }
  };

  const handleNextFoto = () => {
    if (fotoAktifIndex < semuaFoto.length - 1) {
      setFotoAktifIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tombol Navigasi Kembali */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Iklan</span>
        </Link>
      </div>

      {/* Grid 2 Kolom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= KOLOM KIRI (KONTEN UTAMA) ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. GALERI FOTO */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm space-y-4">
            {/* Foto Utama Besar */}
            <div className="relative w-full max-h-[460px] h-[320px] sm:h-[420px] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 group">
              <img
                src={urlTampil}
                alt={`${iklan.merek} ${iklan.tipe}`}
                className="w-full h-full object-contain transition duration-300 select-none"
                onError={(e) => {
                  e.currentTarget.src = fallbackUtama;
                }}
              />
              
              {/* Badge Terbukti di atas foto */}
              {iklan.foto_bukti_kepemilikan_url ? (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md ring-2 ring-white/90">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Terbukti Asli</span>
                </div>
              ) : (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-700/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-xs">
                  <AlertCircle className="w-4 h-4 text-slate-300" />
                  <span>Belum Diverifikasi</span>
                </div>
              )}

              {/* Indikator Urutan Foto di Pojok Kanan Atas */}
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

            {/* Thumbnail Selector jika ada lebih dari 1 foto */}
            {semuaFoto.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                {semuaFoto.map((foto, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFotoAktifIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 bg-slate-100 cursor-pointer ${
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

          {/* 2. KOTAK KODE VERIFIKASI & LENCANA TERBUKTI ASLI (⭐ DIATAS INFORMASI UTAMA) */}
          {iklan.foto_bukti_kepemilikan_url ? (
            <div className="bg-teal-50/90 border border-teal-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-teal-900">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold tracking-wide uppercase text-teal-950">
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
                Cocokkan kode ini dengan kode yang tertulis di foto bukti kepemilikan fisik di bawah.
              </p>
            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
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
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
              <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
              <h3>Lokasi Titik Temu</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-800 font-semibold pt-1">
              {iklan.lokasi_detail || 'Kebumen, Jawa Tengah'}
            </p>
            <p className="text-xs text-slate-400">
              Disepakati untuk pertemuan dan pengecekan fisik unit secara langsung
            </p>
          </div>

          {/* 4. SPESIFIKASI DETAIL (Termasuk IMEI disembunyikan sebagian) */}
          <SpecList iklan={iklan} />

          {/* 5. DESKRIPSI LENGKAP */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
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
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            
            {/* Merek, Tipe & Harga */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {iklan.merek} {iklan.tipe}
              </h1>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-orange-500 tracking-tight">
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
              {/* Tombol WhatsApp (Tautan Aman, Tanpa Menampilkan Nomor Mentah) */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Hubungi Penjual via WhatsApp</span>
              </a>

              {/* Tombol Simpan ke Favorit */}
              <button
                type="button"
                onClick={handleFavorit}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-xl transition text-sm cursor-pointer"
              >
                <Heart className="w-4 h-4 text-slate-500" />
                <span>Simpan ke Favorit</span>
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
    </div>
  );
}
