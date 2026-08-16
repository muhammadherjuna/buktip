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
  FileCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import IklanGrid from '../components/iklan/IklanGrid';

export default function Beranda() {
  const [iklanList, setIklanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [lokasiQuery, setLokasiQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Semua');

  // State FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const mermrkPopuler = [
    { nama: 'Semua', label: 'Semua Merek' },
    { nama: 'Apple', label: 'Apple / iPhone' },
    { nama: 'Samsung', label: 'Samsung' },
    { nama: 'Xiaomi', label: 'Xiaomi / Poco' },
    { nama: 'Oppo', label: 'Oppo' },
    { nama: 'Vivo', label: 'Vivo' },
    { nama: 'Realme', label: 'Realme' },
    { nama: 'Infinix', label: 'Infinix' },
  ];

  const faqData = [
    {
      tanya: 'Apa itu kode KB-XXXX?',
      jawab: 'Kode KB-XXXX adalah kode verifikasi unik yang dibuat otomatis oleh sistem Buktip untuk setiap draf iklan. Penjual menuliskannya di kertas dan memfotonya secara fisik berdampingan dengan unit HP. Pembeli dapat mencocokkan kode di layar dengan tulisan kertas di foto untuk memastikan barang benar-benar fisik milik penjual.',
    },
    {
      tanya: 'Apakah nomor WhatsApp saya aman?',
      jawab: 'Sangat aman! Nomor WhatsApp Anda tidak ditampilkan secara mentah sebagai teks terbuka di halaman. Pembeli hanya dapat menghubungi Anda melalui tautan tombal aman yang sudah disinkronkan, sehingga terhindar dari pengumpul nomor otomatis (spambot).',
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
      setFilteredList(iklanAktif);
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

  // Handler Filter Realtime
  useEffect(() => {
    let hasil = [...iklanList];

    if (selectedBrand && selectedBrand !== 'Semua') {
      hasil = hasil.filter(
        (item) => item.merek && item.merek.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      hasil = hasil.filter(
        (item) =>
          (item.merek && item.merek.toLowerCase().includes(q)) ||
          (item.tipe && item.tipe.toLowerCase().includes(q)) ||
          (item.kode_verifikasi && item.kode_verifikasi.toLowerCase().includes(q))
      );
    }

    if (lokasiQuery.trim()) {
      const l = lokasiQuery.toLowerCase().trim();
      hasil = hasil.filter(
        (item) => item.lokasi_detail && item.lokasi_detail.toLowerCase().includes(l)
      );
    }

    setFilteredList(hasil);
  }, [searchQuery, lokasiQuery, selectedBrand, iklanList]);

  const handleResetFilter = () => {
    setSearchQuery('');
    setLokasiQuery('');
    setSelectedBrand('Semua');
  };

  return (
    <div className="space-y-16 sm:space-y-20 py-2">
      
      {/* ================= SECTION 1: HERO BANNER UTAMA ================= */}
      <section className="bg-gradient-to-br from-teal-50/90 via-slate-50 to-white border border-teal-100/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs relative overflow-hidden">
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
              <a
                href="#daftar-iklan"
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base rounded-2xl border border-slate-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4.5 h-4.5 text-slate-500" />
                <span>Lihat Daftar HP</span>
              </a>
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

      {/* ================= SECTION 2: 3 KEUNGGULAN UTAMA BUKTIP ================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            Mengapa Jual Beli di Buktip Lebih Aman?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Perlindungan maksimal untuk pembeli & kenyamanan untuk penjual jujur
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kolom 1 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-3">
            <div className="w-13 h-13 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Foto Terbukti Asli
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Setiap iklan wajib menyertakan foto bukti fisik bersama kode unik sistem. Bukan foto hasil comot dari Google atau grup media sosial.
            </p>
          </div>

          {/* Kolom 2 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-3">
            <div className="w-13 h-13 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-xs">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Transaksi Antar Orang
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Beli langsung dari pemilik asli tanpa perantara tengkulak. Harga lebih adil dan Anda bisa mengecek & mengetes unit sepuasnya saat COD.
            </p>
          </div>

          {/* Kolom 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-3">
            <div className="w-13 h-13 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-xs">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Fokus Lokal Daerah
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tidak berantakan seperti grup Facebook. Semua iklan terstruktur rapi per kabupaten/kota, memudahkan temukan penjual terdekat di sekitarmu.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: KATEGORI MEREK POPULER ================= */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            Jual Beli Berdasarkan Merek
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilih merek smartphone favorit Anda untuk memfilter daftar
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5 overflow-x-auto pb-2 pt-1">
          {mermrkPopuler.map((merek) => {
            const isSelected = selectedBrand === merek.nama;
            return (
              <button
                key={merek.nama}
                type="button"
                onClick={() => setSelectedBrand(merek.nama)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer border shadow-xs ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {merek.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= SECTION 3: DAFTAR IKLAN TERBARU ================= */}
      <section id="daftar-iklan" className="space-y-6 scroll-mt-24">
        
        {/* Header Section & Search Input */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                HP Bekas Terverifikasi Terbaru
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Semua iklan di bawah ini sudah dilengkapi foto bukti kepemilikan fisik
              </p>
            </div>

            {(searchQuery || lokasiQuery || selectedBrand !== 'Semua') && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-xs text-teal-600 hover:text-teal-800 font-bold underline cursor-pointer self-start sm:self-auto"
              >
                Reset Semua Filter
              </button>
            )}
          </div>

          {/* Form Pencarian & Filter Lokasi */}
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Penanganan State Data / Error */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-800">
                Gagal Memuat Iklan
              </h3>
              <p className="text-xs text-red-600 max-w-md mx-auto">
                {error}
              </p>
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
                {searchQuery || lokasiQuery || selectedBrand !== 'Semua'
                  ? 'Tidak ada iklan yang sesuai dengan kriteria filter Anda.' 
                  : 'Jadilah yang pertama menjual di Buktip!'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/pasang-iklan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Pasang Iklan Pertama</span>
              </Link>
            </div>
          </div>
        ) : (
          <IklanGrid iklanList={filteredList} isLoading={loading} />
        )}
      </section>

      {/* ================= SECTION 4: CARA KERJA BUKTIP (3 LANGKAH) ================= */}
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
          {/* Langkah 1 */}
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

          {/* Langkah 2 */}
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

          {/* Langkah 3 */}
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

        {/* Ornamen latar belakang */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

    </div>
  );
}
