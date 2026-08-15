import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Clock } from 'lucide-react';
import { formatRupiah, formatWaktuRelatif } from '../../lib/utils';

export default function IklanCard({ iklan }) {
  if (!iklan) return null;

  // Penentuan warna badge kondisi HP (dibuat lebih halus/sekunder)
  const getKondisiBadgeStyle = (kondisi) => {
    switch (kondisi) {
      case 'Sangat Baik':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Baik':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sedang':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Butuh Servis':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Fallback URL foto jika tidak tersedia
  const fallbackFoto = `https://picsum.photos/seed/${iklan.id || iklan.kode_verifikasi || 'buktip-hp'}/400/300`;
  const fotoUrl = iklan.foto_utama_url || fallbackFoto;

  return (
    <Link
      to={`/iklan/${iklan.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Gambar Thumbnail & Badges */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={fotoUrl}
          alt={`${iklan.merek} ${iklan.tipe}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackFoto;
          }}
        />

        {/* Badge TERBUKTI (Keunggulan Utama - Lebih Menonjol dengan Hijau Solid & Ring) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md ring-2 ring-white">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>Terbukti</span>
        </div>

        {/* Badge Kondisi (Sekunder) */}
        <div className={`absolute top-3 right-3 text-[11px] font-medium px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md bg-white/95 ${getKondisiBadgeStyle(iklan.kondisi)}`}>
          {iklan.kondisi}
        </div>
      </div>

      {/* Konten Informasi Iklan */}
      <div className="p-4 flex flex-col flex-1">
        {/* Judul Merek & Tipe */}
        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-teal-600 transition-colors">
          {iklan.merek} {iklan.tipe}
        </h3>

        {/* Kapasitas & Warna jika ada */}
        {(iklan.kapasitas || iklan.warna) && (
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            {[iklan.kapasitas, iklan.warna].filter(Boolean).join(' • ')}
          </p>
        )}

        {/* Harga (Paling Mencolok & Menonjol) */}
        <div className="mt-3.5 mb-1 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-orange-500 tracking-tight">
            {formatRupiah(iklan.harga)}
          </span>
          {iklan.harga_negosiasi && (
            <span className="text-xs text-slate-400 font-medium">
              (Nego)
            </span>
          )}
        </div>

        {/* Footer Kartu: Lokasi & Waktu */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {/* Lokasi */}
          <div className="flex items-center gap-1 min-w-0 pr-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {iklan.lokasi_detail || 'Lokasi belum ditentukan'}
            </span>
          </div>

          {/* Waktu relatif */}
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatWaktuRelatif(iklan.dibuat_pada)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
