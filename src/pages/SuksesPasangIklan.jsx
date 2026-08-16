import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Eye, Package, PlusCircle } from 'lucide-react';
import { formatRupiah } from '../lib/utils';

export default function SuksesPasangIklan() {
  const location = useLocation();
  const { iklanId, kodeVerifikasi, merek, tipe, harga } = location.state || {};

  // Jika halaman diakses langsung tanpa data, redirect ke beranda
  if (!kodeVerifikasi) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-xl w-full mx-auto my-8 sm:my-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm text-center space-y-6">
      
      {/* Icon Centang & Judul */}
      <div className="space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Iklan Berhasil Dipasang!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Terima kasih, iklan Anda sudah tayang dan bisa dilihat oleh calon pembeli.
        </p>
      </div>

      {/* Ringkasan Iklan */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Ringkasan Iklan
        </div>
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-xs text-slate-500">Kode Verifikasi</span>
          <span className="text-sm font-mono font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {kodeVerifikasi}
          </span>
        </div>

        {merek && tipe && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500">Smartphone</span>
            <span className="text-sm font-bold text-slate-800">
              {merek} {tipe}
            </span>
          </div>
        )}

        {harga && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Harga Jual</span>
            <span className="text-sm font-extrabold text-orange-600">
              {formatRupiah(harga)}
            </span>
          </div>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="space-y-2.5 pt-2">
        {iklanId && (
          <Link
            to={`/iklan/${iklanId}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Iklan Saya</span>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            to="/iklan-saya"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            <Package className="w-4 h-4 text-slate-600" />
            <span>Daftar Iklan Saya</span>
          </Link>
          
          <Link
            to="/pasang-iklan"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer border border-orange-200"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>Pasang Iklan Lain</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
