import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Camera, Eye, Package, ArrowRight } from 'lucide-react';

export default function SuksesPasangIklan() {
  const location = useLocation();
  const { iklanId, kodeVerifikasi, merek, tipe } = location.state || {};

  // Jika halaman diakses langsung tanpa data, redirect ke beranda
  if (!kodeVerifikasi) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-10 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm text-center space-y-8">
      {/* Icon Centang & Judul */}
      <div className="space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Iklan Berhasil Dipasang!
        </h1>
        {merek && tipe && (
          <p className="text-sm font-medium text-slate-600">
            {merek} {tipe}
          </p>
        )}
      </div>

      {/* Bagian Kode Verifikasi */}
      <div className="bg-slate-50 border-2 border-dashed border-teal-300 rounded-2xl p-6 space-y-2">
        <span className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
          Kode Verifikasi Buktip Anda
        </span>
        <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-widest">
          {kodeVerifikasi}
        </div>
        <p className="text-xs text-slate-500">
          Kode unik ini tercantum pada iklan dan menghubungkan unit dengan foto bukti kepemilikan.
        </p>
      </div>

      {/* Instruksi Penting Verifikasi Foto */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 sm:p-6 text-left space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm sm:text-base">
          <Camera className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Langkah Selanjutnya:</span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
          Silakan ambil HP Anda, buka halaman ini di layar HP, lalu foto HP tersebut sehingga kode di atas terlihat jelas di layar HP. Foto itulah yang menjadi <strong>"Foto Bukti Kepemilikan"</strong> yang sudah Anda unggah.
        </p>
      </div>

      {/* Tombol Aksi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {iklanId && (
          <Link
            to={`/iklan/${iklanId}`}
            className="flex items-center justify-center gap-2 py-3 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Iklan Ini</span>
          </Link>
        )}
        <Link
          to="/iklan-saya"
          className="flex items-center justify-center gap-2 py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition"
        >
          <Package className="w-4 h-4 text-slate-600" />
          <span>Lihat Iklan Saya</span>
        </Link>
      </div>
    </div>
  );
}
