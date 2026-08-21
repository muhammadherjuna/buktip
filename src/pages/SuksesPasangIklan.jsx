import { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Eye, Package, PlusCircle, Share2 } from 'lucide-react';
import { formatRupiah } from '../lib/utils';
import { supabase } from '../lib/supabase';
import ShareCardModal from '../components/common/ShareCardModal';

export default function SuksesPasangIklan() {
  const location = useLocation();
  const { iklanId, kodeVerifikasi, merek, tipe, harga } = location.state || {};
  const [modalShareOpen, setModalShareOpen] = useState(false);
  const [fullIklanData, setFullIklanData] = useState(null);

  useEffect(() => {
    if (iklanId) {
      supabase
        .from('iklan')
        .select('*')
        .eq('id', iklanId)
        .single()
        .then(({ data }) => {
          if (data) setFullIklanData(data);
        });
    }
  }, [iklanId]);

  // Jika halaman diakses langsung tanpa data, redirect ke beranda
  if (!kodeVerifikasi) {
    return <Navigate to="/" replace />;
  }

  const iklanUntukShare = fullIklanData || {
    id: iklanId,
    kode_verifikasi: kodeVerifikasi,
    merek,
    tipe,
    harga
  };

  return (
    <div className="max-w-xl w-full mx-auto my-8 sm:my-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm text-center space-y-6">
      
      {/* Icon Centang & Judul */}
      <div className="space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
          Iklan Berhasil Dipasang!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Iklan smartphone Anda sudah aktif terverifikasi dan siap ditransaksikan dengan pembeli.
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
            <span className="text-sm font-extrabold text-teal-600">
              {formatRupiah(harga)}
            </span>
          </div>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="space-y-3 pt-2">
        {/* Tombol Bagikan Gambar Status WA Promosi */}
        <button
          type="button"
          onClick={() => setModalShareOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Buat Gambar Promosi Status WhatsApp & IG Story</span>
        </button>

        {iklanId && (
          <Link
            to={`/iklan/${iklanId}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Halaman Iklan</span>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            to="/iklan-saya"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-2xl transition cursor-pointer"
          >
            <Package className="w-4 h-4 text-slate-600" />
            <span>Kelola Iklan Saya</span>
          </Link>
          
          <Link
            to="/pasang-iklan"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs sm:text-sm rounded-2xl transition cursor-pointer border border-teal-200"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>Pasang Iklan Lain</span>
          </Link>
        </div>
      </div>

      {/* Modal Social Share Card Generator */}
      <ShareCardModal
        isOpen={modalShareOpen}
        onClose={() => setModalShareOpen(false)}
        iklan={iklanUntukShare}
      />

    </div>
  );
}
