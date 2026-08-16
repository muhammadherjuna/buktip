import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Search, 
  Handshake, 
  ArrowRight, 
  PlusCircle,
  Smartphone,
  Lock
} from 'lucide-react';

export default function Tentang() {
  const langkahKerja = [
    {
      angka: '1',
      judul: 'Penjual Dapatkan Kode Unik & Foto HP',
      deskripsi: 'Saat membuka form pasang iklan, penjual secara otomatis menerima kode verifikasi unik (contoh: KB-3221). Penjual menulis kode ini di kertas dan memfoto HP bersama kertas tersebut.',
      icon: <FileText className="w-6 h-6 text-teal-600" />,
    },
    {
      angka: '2',
      judul: 'Sistem Memberi Watermark & Lencana Verifikasi',
      deskripsi: 'Sistem Buktip memproses foto dengan watermark jejak digital elegan dan menampilkan lencana "Terbukti Asli" serta kode unik di halaman iklan.',
      icon: <Lock className="w-6 h-6 text-teal-600" />,
    },
    {
      angka: '3',
      judul: 'Pembeli Mencocokkan Kode Unik',
      deskripsi: 'Calon pembeli membuka detail iklan, membaca kode verifikasi di layar, dan mencocokkannya langsung dengan tulisan kertas di foto bukti kepemilikan.',
      icon: <Search className="w-6 h-6 text-teal-600" />,
    },
    {
      angka: '4',
      judul: 'Transaksi COD Aman di Titik Temu',
      deskripsi: 'Pembeli menghubungi penjual via WhatsApp aman, lalu menyepakati titik temu untuk mengecek unit fisik HP secara langsung sebelum membayar.',
      icon: <Handshake className="w-6 h-6 text-teal-600" />,
    },
  ];

  return (
    <div className="py-4 sm:py-8 flex flex-col items-center">
      <div className="max-w-[700px] w-full bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
        
        {/* ================= HEADER TENTANG BUKTIP ================= */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs border border-teal-100">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
            Tentang Buktip
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Platform jual-beli smartphone bekas terpercaya dengan bukti kepemilikan terverifikasi
          </p>
        </div>

        {/* ================= 🛡️ APA ITU BUKTIP? ================= */}
        <section className="space-y-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-base sm:text-lg">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <h2 className="font-serif font-bold">Apa Itu Buktip?</h2>
          </div>
          <p className="text-xs sm:text-sm text-teal-950 leading-relaxed font-medium">
            <strong>Buktip</strong> adalah tempat jual-beli HP bekas yang <strong>LEBIH AMAN</strong>. 
            Setiap penjual <strong>WAJIB</strong> memfoto HP-nya berdampingan dengan kode verifikasi unik dari sistem. 
            Pembeli bisa mencocokkan kode di halaman dengan kode di foto bukti — sehingga Anda tahu foto tersebut asli dan bukan hasil curian dari internet.
          </p>
        </section>

        {/* ================= 📝 BAGAIMANA CARA KERJANYA? ================= */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
              Bagaimana Cara Kerjanya?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              4 langkah mudah jual-beli HP bekas tanpa rasa khawatir
            </p>
          </div>

          <div className="space-y-4">
            {langkahKerja.map((step, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-white text-teal-600 flex items-center justify-center shrink-0 shadow-xs border border-slate-200 font-bold text-lg">
                  {step.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      Langkah {step.angka}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {step.judul}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
                    {step.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CTA BUTTONS ================= */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Cari HP Bekas Sekarang</span>
          </Link>
          <Link
            to="/pasang-iklan"
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 border border-slate-200"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>Pasang Iklan Pertama</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
