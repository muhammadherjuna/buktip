import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ArrowLeft, Trash2, Smartphone } from 'lucide-react';
import { getFavoritItems } from '../lib/favorit';
import IklanCard from '../components/iklan/IklanCard';
import toast from 'react-hot-toast';

export default function Favorit() {
  const [favoritList, setFavoritList] = useState([]);

  const loadFavorit = () => {
    setFavoritList(getFavoritItems());
  };

  useEffect(() => {
    loadFavorit();

    const handleUpdate = () => {
      loadFavorit();
    };

    window.addEventListener('buktip_favorit_updated', handleUpdate);
    return () => window.removeEventListener('buktip_favorit_updated', handleUpdate);
  }, []);

  const handleClearAll = () => {
    try {
      localStorage.removeItem('buktip_favorit_iklan');
      window.dispatchEvent(new Event('buktip_favorit_updated'));
      toast.success('Daftar favorit berhasil dibersihkan');
    } catch (_) {}
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      
      {/* Header Halaman Favorit */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-xs">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Iklan Favorit Saya
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar smartphone incaran yang Anda simpan untuk perbandingan & pembelian
          </p>
        </div>

        {favoritList.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              {favoritList.length} Unit Disimpan
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          </div>
        )}
      </div>

      {/* Konten Daftar Favorit */}
      {favoritList.length === 0 ? (
        /* Jika Belum Ada Iklan Favorit */
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-14 text-center max-w-md mx-auto space-y-4 shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mx-auto border border-red-100">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Belum Ada Iklan Favorit
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Anda belum menyimpan iklan apapun. Klik ikon hati ❤️ pada kartu iklan yang Anda sukai untuk menyimpannya di sini.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              <Search className="w-4 h-4" />
              <span>Jelajahi HP Bekas Sekarang</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Grid Daftar Iklan Favorit */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoritList.map((iklan) => (
            <IklanCard key={iklan.id} iklan={iklan} />
          ))}
        </div>
      )}

    </div>
  );
}
