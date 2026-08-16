import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle, 
  Smartphone,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Handshake,
  Eye,
  SlidersHorizontal,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import IklanGrid from '../components/iklan/IklanGrid';

export default function Beranda() {
  const [iklanList, setIklanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Filter & Pencarian (FITUR 9)
  const [searchQuery, setSearchQuery] = useState('');
  const [lokasiQuery, setLokasiQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Semua');
  const [selectedPriceRange, setSelectedPriceRange] = useState('semua');
  const [selectedKondisi, setSelectedKondisi] = useState('semua');
  const [sortBy, setSortBy] = useState('terbaru');

  // State Pagination (FITUR 10)
  const [visibleCount, setVisibleCount] = useState(12);

  // State FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Daftar Merek Unggulan (FITUR 4)
  const merekUnggulan = [
    { nama: 'Apple', logo: '', sub: 'iPhone Series' },
    { nama: 'Samsung', logo: 'S', sub: 'Galaxy Series' },
    { nama: 'Xiaomi', logo: 'MI', sub: 'Redmi & Poco' },
    { nama: 'Oppo', logo: 'O', sub: 'Reno & A Series' },
    { nama: 'Vivo', logo: 'V', sub: 'V & Y Series' },
    { nama: 'Realme', logo: 'R', sub: 'Number & GT' },
  ];

  const faqData = [
    {
      tanya: 'Apa itu kode KB-XXXX?',
      jawab: 'Kode KB-XXXX adalah kode verifikasi unik yang dibuat otomatis oleh sistem Buktip untuk setiap draf iklan. Penjual menuliskannya di kertas dan memfotonya secara fisik berdampingan dengan unit HP. Pembeli dapat mencocokkan kode di layar dengan tulisan kertas di foto untuk memastikan barang benar-benar fisik milik penjual.',
    },
    {
      tanya: 'Apakah nomor WhatsApp saya aman?',
      jawab: 'Sangat aman! Nomor WhatsApp Anda tidak ditampilkan secara mentah sebagai teks terbuka di halaman. Pembeli hanya dapat menghubungi Anda melalui tautan tombol aman yang sudah disinkronkan, sehingga terhindar dari pengumpul nomor otomatis (spambot).',
    },
    {
      tanya: 'Bagaimana jika saya menemukan iklan yang mencurigakan?',
      jawab: 'Setiap halaman detail iklan dilengkapi tombol "Laporkan Iklan Ini" di bagian bawah. Anda dapat mengeklik tombol tersebut untuk melaporkan nomor/iklan mencurigakan langsung ke tim Admin Buktip untuk ditindaklanjuti.',
    },
    {
      tanya: 'Apakah Buktip memungut biaya?',
      jawab: 'Tidak sama sekali! Memasang iklan, melihat daftar HP terverifikasi, dan menghubungi penjual 100% GRATIS. Buktip dibuat untuk melindungi pengguna dari penipuan foto curian.',
    },
    {
      tanya: 'Berapa lama iklan saya tayang?',
      jawab: 'Iklan Anda akan aktif dan tayang selama 90 hari atau sampai Anda menandainya sebagai "Terjual". Setelah 90 hari, iklan lama akan otomatis diarsipkan agar daftar produk tetap segar.',
    },
  ];

  const fetchIklan = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('iklan')
        .select('*, profiles(nama_lengkap)')
        .or('status.eq.aktif,status.eq.tersedia,status.is.null')
        .order('dibuat_pada', { ascending: false });

      if (fetchError) throw fetchError;

      const sekarang = new Date();
      const iklanAktif = (data || []).filter((item) => {
        const tgl = new Date(item.dibuat_pada || Date.now());
        const selisihHari = Math.floor((sekarang - tgl) / (1000 * 60 * 60 * 24));
        return selisihHari <= 90 && item.status !== 'terjual' && item.status !== 'diarsipkan';
      });

      setIklanList(iklanAktif);
    } catch (err) {
      console.error('Terjadi kesalahan saat memuat daftar iklan:', err);
      setError(err.message || 'Gagal memuat data iklan dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIklan();
  }, []);

  // Handler Filter & Sorting Realtime (FITUR 9)
  useEffect(() => {
    let hasil = [...iklanList];

    // Filter Merek
    if (selectedBrand && selectedBrand !== 'Semua') {
      hasil = hasil.filter(
        (item) => item.merek && item.merek.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Filter Rentang Harga
    if (selectedPriceRange !== 'semua') {
      hasil = hasil.filter((item) => {
        const h = Number(item.harga) || 0;
        if (selectedPriceRange === 'dibawah3jt') return h < 3000000;
        if (selectedPriceRange === '3jt-5jt') return h >= 3000000 && h <= 5000000;
        if (selectedPriceRange === '5jt-8jt') return h > 5000000 && h <= 8000000;
        if (selectedPriceRange === 'diatas8jt') return h > 8000000;
        return true;
      });
    }

    // Filter Kondisi
    if (selectedKondisi !== 'semua') {
      hasil = hasil.filter(
        (item) => item.kondisi && item.kondisi.toLowerCase() === selectedKondisi.toLowerCase()
      );
    }

    // Filter Search Query (Merek, Tipe, Kode)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      hasil = hasil.filter(
        (item) =>
          (item.merek && item.merek.toLowerCase().includes(q)) ||
          (item.tipe && item.tipe.toLowerCase().includes(q)) ||
          (item.kode_verifikasi && item.kode_verifikasi.toLowerCase().includes(q))
      );
    }

    // Filter Lokasi
    if (lokasiQuery.trim()) {
      const l = lokasiQuery.toLowerCase().trim();
      hasil = hasil.filter(
        (item) => item.lokasi_detail && item.lokasi_detail.toLowerCase().includes(l)
      );
    }

    // Sorting / Pengurutan
    if (sortBy === 'terbaru') {
      hasil.sort((a, b) => new Date(b.dibuat_pada || 0) - new Date(a.dibuat_pada || 0));
    } else if (sortBy === 'termurah') {
      hasil.sort((a, b) => (Number(a.harga) || 0) - (Number(b.harga) || 0));
    } else if (sortBy === 'termahal') {
      hasil.sort((a, b) => (Number(b.harga) || 0) - (Number(a.harga) || 0));
    } else if (sortBy === 'terpopuler') {
      hasil.sort((a, b) => (Number(b.jumlah_dilihat) || 0) - (Number(a.jumlah_dilihat) || 0));
    }

    setFilteredList(hasil);
    setVisibleCount(12); // Reset pagination saat filter berubah
  }, [searchQuery, lokasiQuery, selectedBrand, selectedPriceRange, selectedKondisi, sortBy, iklanList]);

  const handleResetFilter = () => {
    setSearchQuery('');
    setLokasiQuery('');
    setSelectedBrand('Semua');
    setSelectedPriceRange('semua');
    setSelectedKondisi('semua');
    setSortBy('terbaru');
  };

  const visibleAds = filteredList.slice(0, visibleCount);

  return (
    <div className="space-y-12 sm:space-y-16 py-2">
      
      {/* ================= 1. HERO SECTION UTAMA (PALING ATAS) ================= */}
      <section className="bg-gradient-to-br from-teal-50/80 via-slate-50 to-white border border-teal-100/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Kolom Kiri: Teks & CTA */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Platform Terverifikasi Foto Kepemilikan</span>
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 leading-tight tracking-tight">
              Jual Beli HP Bekas Tanpa Takut Foto Curian
            </h1>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
              Setiap iklan di Buktip wajib menyertakan foto bukti kepemilikan dengan kode unik. Anda tahu barang asli, bukan foto hasil curian dari internet.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/pasang-iklan"
                className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Pasang Iklan Sekarang</span>
              </Link>
              <Link
                to="/semua-iklan"
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base rounded-2xl border border-slate-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4.5 h-4.5 text-slate-500" />
                <span>Cari HP Bekas</span>
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Ilustrasi Kartu Bukti Kepemilikan */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xl space-y-3 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src="/images/contoh-bukti-benar.jpg"
                  alt="Ilustrasi HP dengan Kode Verifikasi"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://picsum.photos/seed/buktip-hero/400/300';
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
              <div className="p-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">iPhone 13 128GB</span>
                  <span className="font-extrabold text-teal-600 text-sm">Rp 7.850.000</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Kebumen, Jawa Tengah</span>
                  <span className="text-emerald-700 font-medium">Foto fisik terverifikasi</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 2. BANNER 4 KEPERCAYAAN (DI BAWAH HERO) ================= */}
      <section className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          
          <div className="flex items-center gap-3 justify-center text-left p-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                Foto Terbukti Asli
              </h4>
              <p className="text-[11px] text-slate-500">Wajib kode verifikasi fisik</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center text-left p-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                Antar Orang Langsung
              </h4>
              <p className="text-[11px] text-slate-500">Harga adil tanpa calo</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center text-left p-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                Fokus Lokal
              </h4>
              <p className="text-[11px] text-slate-500">Kebumen & sekitarnya</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center text-left p-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                Transparan Penuh
              </h4>
              <p className="text-[11px] text-slate-500">Kondisi dicek langsung</p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 3. 3 TOMBOL AKSI CEPAT ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Tombol 1: Pasang Iklan (Oranye Menonjol) */}
        <Link
          to="/pasang-iklan"
          className="group bg-orange-500 hover:bg-orange-600 text-white rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 text-left">
            <h3 className="font-extrabold text-base sm:text-lg leading-snug">
              Pasang Iklan HP
            </h3>
            <p className="text-xs text-orange-100 font-medium">
              Jual aman dengan kode verifikasi gratis
            </p>
          </div>
        </Link>

        {/* Tombol 2: Cari HP Bekas (Teal Outline) */}
        <Link
          to="/semua-iklan"
          className="group bg-white hover:bg-teal-50/60 border-2 border-teal-600/30 hover:border-teal-600 text-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 text-left">
            <h3 className="font-extrabold text-base sm:text-lg leading-snug text-teal-900">
              Cari HP Bekas
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Buka katalog lengkap dengan filter profesional
            </p>
          </div>
        </Link>

        {/* Tombol 3: Cara Kerja (Slate Outline) */}
        <Link
          to="/tentang"
          className="group bg-white hover:bg-slate-100/70 border-2 border-slate-200 hover:border-slate-300 text-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 text-left">
            <h3 className="font-extrabold text-base sm:text-lg leading-snug">
              Cara Kerja Verifikasi
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Kenapa anti-foto curian bekerja
            </p>
          </div>
        </Link>

      </section>

      {/* ================= 4. SECTION MEREK UNGGULAN ================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            Jual Beli Berdasarkan Merek
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilih merek smartphone favorit Anda untuk melihat unit yang tersedia
          </p>
        </div>

        {/* 6 Lingkaran Putih Bersih */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {merekUnggulan.map((item) => {
            const isSelected = selectedBrand.toLowerCase() === item.nama.toLowerCase();
            return (
              <button
                key={item.nama}
                type="button"
                onClick={() => {
                  setSelectedBrand(isSelected ? 'Semua' : item.nama);
                  const el = document.getElementById('daftar-iklan');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1 cursor-pointer ${
                  isSelected
                    ? 'border-teal-600 ring-2 ring-teal-200 bg-teal-50/50'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl transition-all shadow-xs ${
                  isSelected ? 'bg-teal-600 text-white' : 'bg-slate-50 group-hover:bg-teal-50 text-slate-800 group-hover:text-teal-600 border border-slate-100'
                }`}>
                  {item.logo}
                </div>
                <span className="font-bold text-slate-900 text-xs sm:text-sm mt-2.5">
                  {item.nama}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {item.sub}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= FITUR 9 & 10: DAFTAR IKLAN TERBARU + FILTER & PENGURUTAN LENGKAP ================= */}
      <section id="daftar-iklan" className="space-y-6 scroll-mt-24">
        
        {/* Kontrol Pencarian, Filter & Pengurutan */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                HP Bekas Terverifikasi Terbaru
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Semua iklan di bawah ini sudah dilengkapi foto bukti kepemilikan fisik
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              <Link
                to="/semua-iklan"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl border border-teal-200 transition"
              >
                <span>Buka Katalog Lengkap (Filter)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {(searchQuery || lokasiQuery || selectedBrand !== 'Semua' || selectedPriceRange !== 'semua' || selectedKondisi !== 'semua' || sortBy !== 'terbaru') && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Baris 1: Pencarian Nama & Lokasi */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama HP (contoh: iPhone 13, Samsung S22)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                placeholder="Filter lokasi (contoh: Kebumen)..."
                value={lokasiQuery}
                onChange={(e) => setLokasiQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              {lokasiQuery && (
                <button
                  type="button"
                  onClick={() => setLokasiQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Baris 2: Dropdown Filter Harga, Kondisi, Merek & Urutan (FITUR 9) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            
            {/* Filter Merek */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Merek
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Semua">Semua Merek</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Oppo">Oppo</option>
                <option value="Vivo">Vivo</option>
                <option value="Realme">Realme</option>
                <option value="Infinix">Infinix</option>
              </select>
            </div>

            {/* Filter Rentang Harga */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Rentang Harga
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="semua">Semua Harga</option>
                <option value="dibawah3jt">&lt; Rp 3 Juta</option>
                <option value="3jt-5jt">Rp 3 - 5 Juta</option>
                <option value="5jt-8jt">Rp 5 - 8 Juta</option>
                <option value="diatas8jt">&gt; Rp 8 Juta</option>
              </select>
            </div>

            {/* Filter Kondisi */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Kondisi
              </label>
              <select
                value={selectedKondisi}
                onChange={(e) => setSelectedKondisi(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="semua">Semua Kondisi</option>
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Sedang">Sedang</option>
              </select>
            </div>

            {/* Pengurutan (Sort By) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="terbaru">Terbaru Dulu</option>
                <option value="termurah">Harga Termurah</option>
                <option value="termahal">Harga Termahal</option>
                <option value="terpopuler">Paling Banyak Dilihat</option>
              </select>
            </div>

          </div>

        </div>

        {/* State Data / Error */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-800">
                Gagal Memuat Iklan
              </h3>
              <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchIklan}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : !loading && filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
              <Smartphone className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Belum Ada Iklan
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Tidak ada iklan yang sesuai dengan kriteria filter Anda.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition"
              >
                Reset Semua Filter
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid Kartu Iklan */}
            <IklanGrid iklanList={visibleAds} isLoading={loading} />

            {/* FITUR 10: PAGINATION "MUAT LEBIH BANYAK" */}
            {filteredList.length > visibleCount && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-100 text-teal-800 font-bold text-sm rounded-2xl border-2 border-teal-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Muat Lebih Banyak Iklan ({filteredList.length - visibleCount} tersisa)</span>
                  <ChevronDown className="w-4 h-4 text-teal-600" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================= SECTION CARA KERJA ================= */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="text-center space-y-1">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            Bagaimana Verifikasi Buktip Bekerja?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            3 langkah sederhana untuk jual beli yang lebih aman & terpercaya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Penjual Pasang Iklan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Isi data HP yang dijual. Sistem akan secara otomatis memberikan kode unik seperti <strong className="font-mono text-teal-800">KB-3221</strong>.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Foto Bukti Kepemilikan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tulis kode unik di selembar kertas, lalu foto HP berdampingan dengan kertas tersebut dan unggah ke sistem.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Pembeli Cocokkan Kode
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pembeli melihat kode di halaman, cocokkan dengan tulisan di foto bukti. Kode cocok = foto asli milik penjual!
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/tentang"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-800 transition"
          >
            <span>Pelajari Lebih Lanjut Tentang Sistem Keamanan Buktip</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================= SECTION 6: PERTANYAAN UMUM (FAQ) ACCORDION ================= */}
      <section id="faq" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6 scroll-mt-24">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 border border-teal-100">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Jawaban lengkap seputar cara kerja, keamanan, dan penggunaan platform Buktip
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqData.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-100/70 transition cursor-pointer"
                >
                  <span>{item.tanya}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {item.jawab}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= SECTION 7: AJAKAN BERTINDAK (CTA) ================= */}
      <section className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg text-center space-y-5 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl leading-tight">
            Siap menjual HP Anda dengan cara yang lebih aman?
          </h2>
          <p className="text-teal-100 text-xs sm:text-base leading-relaxed">
            Bergabunglah dengan penjual lain yang sudah membuktikan keaslian barang mereka di Buktip.
          </p>
          <div className="pt-3">
            <Link
              to="/pasang-iklan"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-slate-100 text-teal-900 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-teal-600" />
              <span>Pasang Iklan Sekarang — Gratis!</span>
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

    </div>
  );
}
