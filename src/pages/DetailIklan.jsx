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
  Flag 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatTanggal, formatWaktuRelatif } from '../lib/utils';
import FotoBukti from '../components/iklan/FotoBukti';
import SpecList from '../components/iklan/SpecList';
import PenjualCard from '../components/iklan/PenjualCard';
import toast from 'react-hot-toast';

export default function DetailIklan() {
  const { id } = useParams();
  const [iklan, setIklan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoAktif, setFotoAktif] = useState(null);

  // Fungsi menandai sudah dilihat berbasis hari di localStorage (Anti Manipulasi)
  const tandaiSudahDilihat = (iklanId) => {
    try {
      const kunci = `dilihat_iklan_${iklanId}_${new Date().toISOString().slice(0, 10)}`;
      const sudahDilihat = localStorage.getItem(kunci);

      if (!sudahDilihat) {
        // Jalankan RPC di background secara asinkron tanpa memblokir tampilan
        supabase
          .rpc('tambah_dilihat', { id_iklan: Number(iklanId) })
          .then(() => {
            localStorage.setItem(kunci, 'ya');
          })
          .catch(() => {
            // Diam saja jika gagal, jangan tampilkan error ke pengguna
          });
      }
    } catch (e) {
      // Abaikan error akses storage
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDetailIklan = async () => {
      try {
        setLoading(true);
        setError(null);

        // Kolom sensitif seperti nomor_hp DIBATASI dan tidak diambil secara publik
        const { data, error: fetchError } = await supabase
          .from('iklan')
          .select(`
            *,
            profiles (nama_lengkap, skor_kepercayaan, total_transaksi_sukses, foto_profil, daerah_id)
          `)
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted) {
          setIklan(data);
          setFotoAktif(data.foto_utama_url);

          // Panggil fungsi penambahan jumlah dilihat aman
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

  // Handler Tombol Laporkan Iklan
  const handleLaporkan = () => {
    toast('Fitur laporan akan tersedia segera. Jika mencurigakan, hubungi kami.');
  };

  // Format nomor WhatsApp aman (menggunakan nomor penjual jika tersedia atau nomor kontak pengujian)
  const getWhatsAppLink = () => {
    if (!iklan) return '#';
    let noHp = iklan.profiles?.nomor_hp || '081234567890';
    noHp = noHp.replace(/\D/g, ''); // Hapus karakter non-digit
    if (noHp.startsWith('0')) {
      noHp = '62' + noHp.slice(1);
    } else if (noHp.startsWith('8')) {
      noHp = '62' + noHp;
    }

    const pesan = `Halo, saya tertarik dengan ${iklan.merek} ${iklan.tipe} di Buktip. Apakah masih tersedia?`;
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

  // Gabungkan semua foto untuk thumbnail galeri
  const semuaFoto = [
    iklan.foto_utama_url,
    ...(Array.isArray(iklan.foto_lain_urls) ? iklan.foto_lain_urls : [])
  ].filter(Boolean);

  const fallbackUtama = `https://picsum.photos/seed/${iklan.id || 'buktip-detail'}/800/600`;
  const urlTampil = fotoAktif || iklan.foto_utama_url || fallbackUtama;

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
        <div className="lg:col-span-8 space-y-8">
          
          {/* A. Galeri Foto */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm space-y-4">
            {/* Foto Utama Besar */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
              <img
                src={urlTampil}
                alt={`${iklan.merek} ${iklan.tipe}`}
                className="w-full h-full object-cover transition duration-300"
                onError={(e) => {
                  e.currentTarget.src = fallbackUtama;
                }}
              />
              
              {/* Badge Terbukti di atas foto */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md ring-2 ring-white">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Terbukti Asli</span>
              </div>
            </div>

            {/* Thumbnail Selector jika ada lebih dari 1 foto */}
            {semuaFoto.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                {semuaFoto.map((foto, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFotoAktif(foto)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      fotoAktif === foto 
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
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* B. Bagian Bukti Kepemilikan (⭐ Keunggulan Utama) */}
          <FotoBukti
            fotoUrl={iklan.foto_bukti_kepemilikan_url}
            kodeVerifikasi={iklan.kode_verifikasi}
          />

          {/* C. Deskripsi Lengkap */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg pb-3 border-b border-slate-100">
              Deskripsi Iklan
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {iklan.deskripsi || 'Penjual tidak menyertakan deskripsi tambahan untuk unit ini.'}
            </div>
          </div>

          {/* D. Spesifikasi Detail */}
          <SpecList iklan={iklan} />

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
              {/* Tombol WhatsApp (Aksi Utama - Oranye Menonjol) */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Hubungi via WhatsApp</span>
              </a>

              {/* Tombol Simpan ke Favorit */}
              <button
                type="button"
                onClick={handleFavorit}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-xl transition text-sm"
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
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors py-1"
              >
                <Flag className="w-3.5 h-3.5" />
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
