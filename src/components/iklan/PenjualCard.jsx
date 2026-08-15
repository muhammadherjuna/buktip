import { User, Star, CheckCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PenjualCard({ penjual, lokasiDetail }) {
  const nama = penjual?.nama_lengkap || 'Penjual Buktip';
  const skor = Number(penjual?.skor_kepercayaan || 5.0).toFixed(1);
  const transaksi = penjual?.total_transaksi_sukses || 0;

  const handleLihatLainnya = () => {
    toast('Fitur ini sedang dikembangkan');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase">
        Informasi Penjual
      </h3>

      <div className="flex items-center gap-3.5">
        {penjual?.foto_profil ? (
          <img
            src={penjual.foto_profil}
            alt={nama}
            className="w-12 h-12 rounded-full object-cover border-2 border-teal-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
            {nama.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 text-base truncate">
              {nama}
            </h4>
            {penjual?.nomor_hp_terverifikasi !== false && (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            {/* Skor Bintang */}
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{skor}</span>
            </div>
            <span>•</span>
            {/* Total Transaksi Sukses */}
            <span>{transaksi} transaksi sukses</span>
          </div>
        </div>
      </div>

      {lokasiDetail && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{lokasiDetail}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleLihatLainnya}
        className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
      >
        <span>Lihat Iklan Lainnya</span>
        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-normal">
          Segera hadir
        </span>
      </button>
    </div>
  );
}
