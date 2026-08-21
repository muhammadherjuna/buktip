import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Clock, Heart, CheckCircle2, BatteryMedium } from 'lucide-react';
import { formatRupiah, formatWaktuRelatif } from '../../lib/utils';
import { isFavorit, toggleFavorit } from '../../lib/favorit';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function IklanCard({ iklan }) {
  const { user } = useAuth();
  const [favorit, setFavorit] = useState(false);

  useEffect(() => {
    if (iklan?.id) {
      setFavorit(isFavorit(iklan.id));
    }

    const handleUpdate = () => {
      if (iklan?.id) {
        setFavorit(isFavorit(iklan.id));
      }
    };

    window.addEventListener('buktip_favorit_updated', handleUpdate);
    return () => window.removeEventListener('buktip_favorit_updated', handleUpdate);
  }, [iklan?.id]);

  if (!iklan) return null;

  const handleToggleFavorit = (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  // Penentuan warna badge kondisi HP
  const getKondisiBadgeStyle = (kondisi) => {
    switch (kondisi) {
      case 'Sangat Baik':
        return 'bg-emerald-50/90 text-emerald-700 border-emerald-200';
      case 'Baik':
        return 'bg-teal-50/90 text-teal-700 border-teal-200';
      case 'Sedang':
        return 'bg-amber-50/90 text-amber-700 border-amber-200';
      case 'Butuh Servis':
        return 'bg-red-50/90 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isTerjual = iklan.status === 'terjual';
  const fallbackFoto = `https://picsum.photos/seed/${iklan.id || iklan.kode_verifikasi || 'buktip-hp'}/400/300`;
  const fotoUrl = iklan.foto_utama_url || fallbackFoto;

  return (
    <Link
      to={`/iklan/${iklan.id}`}
      className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Gambar Thumbnail & Badges */}
      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
        <img
          src={fotoUrl}
          alt={`${iklan.merek} ${iklan.tipe}`}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
            isTerjual ? 'grayscale-40 opacity-80' : ''
          }`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackFoto;
          }}
        />

        {/* Lencana TERBUKTI ASLI dengan aksen glow */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-teal-400/40">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
          <span className="tracking-wide">Terbukti Asli</span>
        </div>

        {/* Tombol Favorit (❤️ Heart) */}
        <button
          type="button"
          onClick={handleToggleFavorit}
          aria-label={favorit ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-md cursor-pointer z-10 ${
            favorit
              ? 'bg-white text-red-500 scale-110 shadow-red-500/20'
              : 'bg-slate-950/40 hover:bg-slate-900/80 text-white hover:scale-110'
          }`}
        >
          <Heart
            className={`w-4.5 h-4.5 transition-transform ${
              favorit ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        {/* Overlay Khusus Jika SUDAH TERJUAL */}
        {isTerjual && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-5">
            <div className="bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-2xl tracking-wider uppercase flex items-center gap-1.5 border border-amber-200">
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Sudah Terjual</span>
            </div>
            <p className="text-[11px] text-slate-200 font-medium mt-1">
              Unit ini telah laku terjual
            </p>
          </div>
        )}
      </div>

      {/* Konten Informasi Iklan */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Baris Kondisi, Baterai & Kode KB */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getKondisiBadgeStyle(iklan.kondisi)}`}>
              {iklan.kondisi || 'Baik'}
            </span>
            {iklan.kesehatan_baterai && (
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <BatteryMedium className="w-3 h-3 text-emerald-600" />
                {iklan.kesehatan_baterai}%
              </span>
            )}
          </div>
          {iklan.kode_verifikasi && (
            <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded shrink-0">
              {iklan.kode_verifikasi}
            </span>
          )}
        </div>

        {/* Judul Merek & Tipe */}
        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-teal-600 transition-colors">
          {iklan.merek} {iklan.tipe}
        </h3>

        {/* Kapasitas & Warna */}
        {(iklan.kapasitas || iklan.warna) && (
          <p className="text-xs text-slate-500 mt-0.5 font-normal truncate">
            {[iklan.kapasitas, iklan.warna].filter(Boolean).join(' • ')}
          </p>
        )}

        {/* Harga */}
        <div className="mt-3 mb-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-teal-600 tracking-tight">
            {formatRupiah(iklan.harga)}
          </span>
          {iklan.harga_negosiasi && (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
              Nego
            </span>
          )}
        </div>

        {/* Footer Kartu: Lokasi & Waktu */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 min-w-0 pr-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {iklan.lokasi_detail || 'Kebumen'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatWaktuRelatif(iklan.dibuat_pada)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
