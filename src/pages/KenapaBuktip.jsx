import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Key, 
  Handshake, 
  Eye, 
  Lock, 
  MapPin, 
  Search, 
  PlusCircle, 
  ChevronRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function KenapaBuktip() {
  useEffect(() => {
    document.title = 'Kenapa Buktip Lebih Aman? | Jual Beli HP Bekas Terverifikasi';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 py-4">
      
      {/* ================= BREADCRUMB ================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link to="/" className="hover:text-teal-600 transition font-medium">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">
          Kenapa Buktip Lebih Aman?
        </span>
      </nav>

      {/* ================= SECTION 1: HERO UTAMA ================= */}
      <section className="bg-gradient-to-br from-teal-50/90 via-slate-50 to-white border border-teal-100/80 rounded-3xl p-6 sm:p-12 lg:p-14 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Kolom Kiri: Teks Hero */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Standar Keamanan Baru Jual Beli Smartphone</span>
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 leading-tight tracking-tight">
              Jual Beli HP Bekas Tanpa Takut Foto Curian
            </h1>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
              Setiap iklan di Buktip wajib menyertakan foto bukti kepemilikan dengan kode unik sistem. Anda tahu barang asli, bukan foto hasil curian dari internet.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                to="/semua-iklan"
                className="px-7 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Lihat Daftar HP</span>
              </Link>
              <Link
                to="/pasang-iklan"
                className="px-7 py-4 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base rounded-2xl border-2 border-slate-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-teal-600" />
                <span>Pasang Iklan Sekarang</span>
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Ilustrasi HP + Kertas Kode */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xl space-y-3 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src="/images/contoh-bukti-benar.jpg"
                  alt="Ilustrasi HP dengan Kode Verifikasi"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://picsum.photos/seed/buktip-kenapa/400/300';
                  }}
                />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Terbukti Asli</span>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded border border-white/20">
                  Kode: KB-3221
                </div>
              </div>
              <div className="p-1 space-y-1 text-center">
                <span className="font-bold text-slate-900 text-sm block">iPhone 13 128GB</span>
                <span className="text-xs text-emerald-700 font-semibold">Foto fisik HP + Kertas Kode Unik Resmi</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 2: SISTEM VERIFIKASI FOTO (IKON KIRI, TEKS KANAN) ================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Ikon Bulat Teal Besar di Kiri */}
          <div className="md:col-span-4 flex justify-center order-1 md:order-1">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 ring-8 ring-teal-50">
              <ShieldCheck className="w-24 h-24 sm:w-28 sm:h-28 text-white" />
            </div>
          </div>

          {/* Teks di Kanan */}
          <div className="md:col-span-8 space-y-4 text-left order-2 md:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              Pilar Keamanan 01
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Setiap Iklan Punya Bukti Kepemilikan yang Bisa Diverifikasi
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Penipu di situs lain dengan mudah mencuri foto HP dari internet dan memasangnya sebagai barang mereka. Di Buktip, hal itu tidak bisa terjadi.
            </p>
            
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2.5">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Setiap penjual WAJIB:</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Mendapatkan kode unik <strong className="font-mono text-teal-800">KB-XXXX</strong> dari sistem kami saat mengisi form.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Menuliskan kode tersebut di secarik kertas secara fisik.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Memfoto kertas itu <strong>BERDAMPINGAN</strong> dengan HP yang dijual.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 italic">
              Pembeli bisa mencocokkan kode di halaman dengan kode yang tertulis di foto. Jika cocok, barang tersebut terbukti asli milik penjual saat ini.
            </p>
          </div>

        </div>
      </section>

      {/* ================= SECTION 3: KODE UNIK PER IKLAN (TEKS KIRI, IKON KANAN) ================= */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Teks di Kiri */}
          <div className="md:col-span-8 space-y-4 text-left order-2 md:order-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-lg border border-teal-200">
              Pilar Keamanan 02
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Kode Unik yang Hanya Ada di Momen Itu
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Kode <strong className="font-mono text-teal-800">KB-XXXX</strong> dihasilkan secara acak oleh sistem pada saat iklan akan dipasang. Penipu tidak bisa mempersiapkan foto dengan kode ini sebelumnya karena kode tersebut belum ada saat mereka mencuri foto.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Foto curian dari tahun lalu <strong>TIDAK BISA</strong> dipakai</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Penipu harus <strong>BENAR-BENAR</strong> memegang HP fisik saat itu</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Setiap iklan punya identitas unik yang tidak bisa disalin ke iklan lain</span>
              </div>
            </div>
          </div>

          {/* Ikon Bulat Teal Besar di Kanan */}
          <div className="md:col-span-4 flex justify-center order-1 md:order-2">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 ring-8 ring-white">
              <Key className="w-24 h-24 sm:w-28 sm:h-28 text-white" />
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 4: TRANSAKSI ANTAR ORANG (IKON KIRI, TEKS KANAN) ================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Ikon Bulat Teal Besar di Kiri */}
          <div className="md:col-span-4 flex justify-center order-1 md:order-1">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 ring-8 ring-teal-50">
              <Handshake className="w-24 h-24 sm:w-28 sm:h-28 text-white" />
            </div>
          </div>

          {/* Teks di Kanan */}
          <div className="md:col-span-8 space-y-4 text-left order-2 md:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              Pilar Keamanan 03
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Harga Adil Tanpa Perantara
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Di situs C2B (jual ke toko perantara), harga dibeli sangat murah dari pemilik, lalu toko menjual kembali dengan margin mahal ke pembeli. Kedua belah pihak dirugikan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
                <span className="text-2xl font-bold text-teal-600">💰</span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Penjual Untung</h3>
                <p className="text-[11px] text-slate-500">Mendapat harga pasar yang jauh lebih layak</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
                <span className="text-2xl font-bold text-teal-600">🛒</span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Pembeli Hemat</h3>
                <p className="text-[11px] text-slate-500">Membayar harga masuk akal tanpa potongan calo</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
                <span className="text-2xl font-bold text-teal-600">⚖️</span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Transparan</h3>
                <p className="text-[11px] text-slate-500">Kesepakatan murni langsung antar individu</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 5: BERTEMU LANGSUNG & CEK FISIK (TEKS KIRI, IKON KANAN) ================= */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Teks di Kiri */}
          <div className="md:col-span-8 space-y-4 text-left order-2 md:order-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-lg border border-teal-200">
              Pilar Keamanan 04
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Lihat, Pegang, Cek Sebelum Membayar
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Kami sangat menyarankan transaksi dilakukan dengan cara bertemu langsung (COD) di tempat aman yang disepakati bersama.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Bisa melihat kondisi fisik HP secara langsung tanpa editan kamera</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Bisa mencoba semua fungsi: layar, kamera, baterai, speaker, & sensor</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Bisa mencocokkan nomor IMEI fisik dengan data yang tertera di iklan</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Uang baru diserahkan setelah Anda <strong>BENAR-BENAR PUAS</strong> dengan unitnya</span>
              </div>
            </div>
          </div>

          {/* Ikon Bulat Teal Besar di Kanan */}
          <div className="md:col-span-4 flex justify-center order-1 md:order-2">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 ring-8 ring-white">
              <Eye className="w-24 h-24 sm:w-28 sm:h-28 text-white" />
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 6: PRIVASI NOMOR WHATSAPP (IKON KIRI, TEKS KANAN) ================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Ikon Bulat Teal Besar di Kiri */}
          <div className="md:col-span-4 flex justify-center order-1 md:order-1">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 ring-8 ring-teal-50">
              <Lock className="w-24 h-24 sm:w-28 sm:h-28 text-white" />
            </div>
          </div>

          {/* Teks di Kanan */}
          <div className="md:col-span-8 space-y-4 text-left order-2 md:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              Pilar Keamanan 05
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Nomor WhatsApp Tidak Dipajang Publik
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Kami memahami privasi Anda sangat berharga. Nomor WhatsApp penjual <strong>TIDAK PERNAH</strong> ditampilkan secara mentah sebagai teks terbuka yang bisa di-scrape oleh robot spambot atau telemarketer.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Cara Kerja Kontak Aman:</h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                <p>1. Pembeli mengeklik tombol resmi <strong>"💬 Hubungi via WhatsApp"</strong>.</p>
                <p>2. Sistem Buktip mengenkripsi dan mengarahkan ke aplikasi WhatsApp secara aman.</p>
                <p>3. Nomor penjual terlindungi dari pencurian database publik.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 7: FOKUS KOMUNITAS LOKAL (TEKS KIRI, IKON KANAN) ================= */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Teks di Kiri */}
          <div className="md:col-span-8 space-y-4 text-left order-2 md:order-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-lg border border-teal-200">
              Pilar Keamanan 06
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Fokus Melayani Komunitas Lokal
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Marketplace besar biasanya hanya fokus di kota-kota metropolitan. Sementara di daerah seperti Kebumen dan sekitarnya, warga masih bergantung pada grup media sosial yang berantakan dan rawan penipuan foto curian.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <span className="text-lg">🏘️</span>
                <span>Melayani komunitas lokal daerah dengan platform terstruktur rapi</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <span className="text-lg">🤝</span>
                <span>Membangun ekosistem kepercayaan antar sesama warga satu kabupaten</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium">
                <span className="text-lg">📍</span>
                <span>Memudahkan mencari penjual terdekat sehingga transaksi COD menjadi cepat dan aman</span>
              </div>
            </div>
          </div>

          {/* Ikon Bulat Teal Besar di Kanan */}
          <div className="md:col-span-4 flex justify-center order-1 md:order-2">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 ring-8 ring-white">
              <MapPin className="w-24 h-24 sm:w-28 sm:h-28 text-white" />
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 8: CTA PENUTUP (FULL TEAL #0D9488) ================= */}
      <section className="bg-teal-600 text-white rounded-3xl p-8 sm:p-14 shadow-xl text-center space-y-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl leading-tight">
            Siap mencoba cara jual beli HP bekas yang lebih aman?
          </h2>
          <p className="text-teal-100 text-xs sm:text-base leading-relaxed">
            Bergabunglah dengan komunitas Buktip dan buktikan sendiri bedanya bertransaksi dengan bukti kepemilikan terverifikasi.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/semua-iklan"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-teal-900 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-teal-600" />
              <span>Lihat Daftar HP Bekas</span>
            </Link>
            <Link
              to="/pasang-iklan"
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold text-sm sm:text-base rounded-2xl border-2 border-white transition cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Pasang Iklan Gratis</span>
            </Link>
          </div>
        </div>

        {/* Ornamen latar belakang */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-teal-800/40 rounded-full blur-3xl pointer-events-none" />
      </section>

    </div>
  );
}
