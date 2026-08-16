import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Globe, 
  Share2, 
  Phone 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const adminWaUrl = `https://wa.me/6281234567890?text=${encodeURIComponent('Halo Admin Buktip, saya butuh bantuan mengenai platform...')}`;

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 space-y-10">
        
        {/* Grid 4 Kolom Rapi & Profesional */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Kolom 1 — Tentang Buktip (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-100 group-hover:bg-teal-700 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Buktip
                </span>
                <span className="text-[10px] text-teal-600 font-semibold tracking-normal mt-0.5">
                  Bukti Asli, Beli Tenang
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              Platform jual beli HP bekas dengan sistem verifikasi foto bukti kepemilikan. Lebih aman, transparan, dan terpercaya.
            </p>

            {/* Ikon Sosial Media */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://buktip.id"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website Buktip"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-500 flex items-center justify-center transition cursor-pointer"
                title="Website Resmi"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href={adminWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Buktip"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 flex items-center justify-center transition cursor-pointer"
                title="WhatsApp Admin"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigator.clipboard?.writeText(window.location.href); }}
                aria-label="Bagikan Buktip"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-500 flex items-center justify-center transition cursor-pointer"
                title="Bagikan Situs"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Kolom 2 — Panduan (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              Panduan
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium">
              <li>
                <Link to="/tentang" className="hover:text-teal-600 transition-colors">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="hover:text-teal-600 transition-colors">
                  Tips Aman Bertransaksi
                </Link>
              </li>
              <li>
                <Link to="/pasang-iklan" className="hover:text-teal-600 transition-colors">
                  Pasang Iklan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3 — Bantuan (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              Bantuan
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium">
              <li>
                <Link to="/tentang#faq" className="hover:text-teal-600 transition-colors">
                  Pertanyaan Umum (FAQ)
                </Link>
              </li>
              <li>
                <a 
                  href={adminWaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-teal-600 transition-colors"
                >
                  Hubungi Kami
                </a>
              </li>
              <li>
                <a 
                  href={adminWaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-teal-600 transition-colors text-red-600 font-semibold"
                >
                  Laporkan Iklan
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4 — Kontak (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              Kontak Buktip
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-mono text-xs">hello@buktip.id</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={adminWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 transition underline font-semibold"
                >
                  Chat Admin WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Kebumen, Jawa Tengah</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Baris Paling Bawah */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {currentYear} Buktip. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-slate-600 transition cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span className="hover:text-slate-600 transition cursor-pointer">Syarat & Ketentuan</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
