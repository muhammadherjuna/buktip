import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Kolom Brand & Deskripsi */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">Buktip</span>
            </div>
            <p className="text-sm font-medium text-teal-600">
              Bukti Asli, Beli Tenang
            </p>
            <p className="text-sm text-slate-500 max-w-sm">
              Platform jual beli smartphone bekas terpusat dan terpercaya dengan transparansi kondisi dan perlindungan transaksi aman.
            </p>
          </div>

          {/* Kolom Informasi & Bantuan */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">
              Bantuan & Panduan
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="text-slate-600 hover:text-slate-900 transition-colors">
                  Cara Kerja
                </span>
              </li>
              <li>
                <span className="text-slate-600 hover:text-slate-900 transition-colors">
                  Panduan Keamanan
                </span>
              </li>
            </ul>
          </div>

          {/* Kolom Tentang Buktip */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">
              Tentang Kami
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="text-slate-600 hover:text-slate-900 transition-colors">
                  Tentang Buktip
                </span>
              </li>
              <li>
                <span className="text-slate-600 hover:text-slate-900 transition-colors">
                  Hubungi Kami
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} Buktip. Hak Cipta Dilindungi.</p>
          <p className="text-slate-400">Platform Jual Beli HP Bekas Terpercaya</p>
        </div>
      </div>
    </footer>
  );
}
