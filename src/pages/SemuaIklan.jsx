import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, 
  X, 
  Search, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  LayoutGrid, 
  List, 
  ShieldCheck, 
  MapPin, 
  Smartphone, 
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Eye,
  Clock,
  Heart,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatWaktuRelatif } from '../lib/utils';
import IklanCard from '../components/iklan/IklanCard';
import { isFavorit, toggleFavorit } from '../lib/favorit';
import toast from 'react-hot-toast';

export default function SemuaIklan() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State Data Iklan
  const [semuaIklan, setSemuaIklan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Filter & Kontrol
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedMerek, setSelectedMerek] = useState(() => {
    const paramMerek = searchParams.get('merek');
    return paramMerek ? [paramMerek] : [];
  });
  const [selectedKapasitas, setSelectedKapasitas] = useState([]);
  const [selectedKondisi, setSelectedKondisi] = useState([]);
  const [selectedDaerah, setSelectedDaerah] = useState([]);
  const [hanyaTerverifikasi, setHanyaTerverifikasi] = useState(false);

  // Filter Harga
  const HARGA_MIN = 100000;
  const HARGA_MAX = 25000000;
  const [minHarga, setMinHarga] = useState(HARGA_MIN);
  const [maxHarga, setMaxHarga] = useState(HARGA_MAX);

  // Tampilan & Pengurutan
  const [viewMode, setViewMode] = useState('grid'); // 'grid' atau 'list'
  const [sortBy, setSortBy] = useState('terbaru');
  const [visibleCount, setVisibleCount] = useState(16);

  // UI State Sidebar & Mobile
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showAllMerek, setShowAllMerek] = useState(false);

  // Daftar Opsi Filter Standar
  const masterMerek = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Infinix', 'Asus', 'Poco', 'Huawei', 'Nokia'];
  const masterKapasitas = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];
  const masterKondisi = ['Sangat Baik', 'Baik', 'Sedang', 'Butuh Servis'];
  const masterDaerah = ['Kebumen', 'Gombong', 'Prembun', 'Karanganyar', 'Kutowinangun', 'Petanahan', 'Alian'];

  // Fetch Semua Iklan Aktif dari Database
  const fetchIklan = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('iklan')
        .select('*, profiles(nama_lengkap)')
        .or('status.eq.aktif,status.eq.tersedia,status.is.null')
        .order('dibuat_pada', { ascending: false });

      if (fetchErr) throw fetchErr;

      // Filter iklan lama > 90 hari
      const sekarang = new Date();
      const aktif = (data || []).filter((item) => {
        const tgl = new Date(item.dibuat_pada || Date.now());
        const selisihHari = Math.floor((sekarang - tgl) / (1000 * 60 * 60 * 24));
        return selisihHari <= 90 && item.status !== 'terjual' && item.status !== 'diarsipkan';
      });

      setSemuaIklan(aktif);
    } catch (err) {
      console.error('Gagal memuat data koleksi iklan:', err);
      setError(err.message || 'Gagal memuat data iklan dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIklan();
  }, []);

  // Update URL Search Params saat Merek / Query berubah
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedMerek.length === 1) params.set('merek', selectedMerek[0]);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedMerek]);

  // Toggle Handlers untuk Checkbox Multi-Pilih
  const toggleArrayFilter = (item, currentList, setList) => {
    if (currentList.includes(item)) {
      setList(currentList.filter((i) => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  // Reset Semua Filter
  const handleResetSemua = () => {
    setSearchQuery('');
    setSelectedMerek([]);
    setSelectedKapasitas([]);
    setSelectedKondisi([]);
    setSelectedDaerah([]);
    setHanyaTerverifikasi(false);
    setMinHarga(HARGA_MIN);
    setMaxHarga(HARGA_MAX);
    setSortBy('terbaru');
    setVisibleCount(16);
  };

  // Hitung Jumlah Iklan Real-time untuk setiap Opsi Filter
  const filterCounts = useMemo(() => {
    const counts = {
      merek: {},
      kapasitas: {},
      kondisi: {},
      daerah: {},
      terverifikasi: 0,
    };

    masterMerek.forEach((m) => (counts.merek[m] = 0));
    masterKapasitas.forEach((k) => (counts.kapasitas[k] = 0));
    masterKondisi.forEach((kd) => (counts.kondisi[kd] = 0));
    masterDaerah.forEach((d) => (counts.daerah[d] = 0));

    semuaIklan.forEach((item) => {
      if (item.merek) {
        const mKey = masterMerek.find((m) => m.toLowerCase() === item.merek.toLowerCase());
        if (mKey) counts.merek[mKey] = (counts.merek[mKey] || 0) + 1;
      }
      if (item.kapasitas) {
        const kKey = masterKapasitas.find((k) => k.toLowerCase() === item.kapasitas.toLowerCase());
        if (kKey) counts.kapasitas[kKey] = (counts.kapasitas[kKey] || 0) + 1;
      }
      if (item.kondisi) {
        const kdKey = masterKondisi.find((kd) => kd.toLowerCase() === item.kondisi.toLowerCase());
        if (kdKey) counts.kondisi[kdKey] = (counts.kondisi[kdKey] || 0) + 1;
      }
      if (item.lokasi_detail) {
        const dKey = masterDaerah.find((d) => item.lokasi_detail.toLowerCase().includes(d.toLowerCase()));
        if (dKey) counts.daerah[dKey] = (counts.daerah[dKey] || 0) + 1;
      }
      if (item.foto_bukti_kepemilikan_url) {
        counts.terverifikasi += 1;
      }
    });

    return counts;
  }, [semuaIklan]);

  // Filter & Pengurutan Iklan
  const filteredIklan = useMemo(() => {
    let hasil = [...semuaIklan];

    // Filter Kata Kunci
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      hasil = hasil.filter(
        (item) =>
          (item.merek && item.merek.toLowerCase().includes(q)) ||
          (item.tipe && item.tipe.toLowerCase().includes(q)) ||
          (item.kode_verifikasi && item.kode_verifikasi.toLowerCase().includes(q)) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(q))
      );
    }

    // Filter Merek (Multi-pilih)
    if (selectedMerek.length > 0) {
      hasil = hasil.filter((item) =>
        selectedMerek.some((m) => item.merek && item.merek.toLowerCase() === m.toLowerCase())
      );
    }

    // Filter Kapasitas (Multi-pilih)
    if (selectedKapasitas.length > 0) {
      hasil = hasil.filter((item) =>
        selectedKapasitas.some((k) => item.kapasitas && item.kapasitas.toLowerCase() === k.toLowerCase())
      );
    }

    // Filter Kondisi (Multi-pilih)
    if (selectedKondisi.length > 0) {
      hasil = hasil.filter((item) =>
        selectedKondisi.some((kd) => item.kondisi && item.kondisi.toLowerCase() === kd.toLowerCase())
      );
    }

    // Filter Daerah (Multi-pilih)
    if (selectedDaerah.length > 0) {
      hasil = hasil.filter((item) =>
        selectedDaerah.some((d) => item.lokasi_detail && item.lokasi_detail.toLowerCase().includes(d.toLowerCase()))
      );
    }

    // Filter Khusus Buktip: Hanya Terverifikasi
    if (hanyaTerverifikasi) {
      hasil = hasil.filter((item) => Boolean(item.foto_bukti_kepemilikan_url));
    }

    // Filter Rentang Harga
    hasil = hasil.filter((item) => {
      const h = Number(item.harga) || 0;
      return h >= minHarga && h <= maxHarga;
    });

    // Pengurutan (Sorting)
    if (sortBy === 'terbaru') {
      hasil.sort((a, b) => new Date(b.dibuat_pada || 0) - new Date(a.dibuat_pada || 0));
    } else if (sortBy === 'termurah') {
      hasil.sort((a, b) => (Number(a.harga) || 0) - (Number(b.harga) || 0));
    } else if (sortBy === 'termahal') {
      hasil.sort((a, b) => (Number(b.harga) || 0) - (Number(a.harga) || 0));
    } else if (sortBy === 'terpopuler') {
      hasil.sort((a, b) => (Number(b.jumlah_dilihat) || 0) - (Number(a.jumlah_dilihat) || 0));
    }

    return hasil;
  }, [
    semuaIklan,
    searchQuery,
    selectedMerek,
    selectedKapasitas,
    selectedKondisi,
    selectedDaerah,
    hanyaTerverifikasi,
    minHarga,
    maxHarga,
    sortBy,
  ]);

  const visibleAds = filteredIklan.slice(0, visibleCount);

  // Komponen Panel Filter Bersama (Untuk Desktop & Mobile Drawer)
  const FilterPanelContent = () => (
    <div className="space-y-6 text-sm">
      
      {/* Header Filter Panel */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <span>Filter Produk</span>
        </div>
        <button
          type="button"
          onClick={handleResetSemua}
          className="text-xs text-teal-600 hover:text-teal-800 font-semibold underline cursor-pointer"
        >
          Reset Semua
        </button>
      </div>

      {/* 1. FILTER KHUSUS BUKTIP: VERIFIKASI ASLI */}
      <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hanyaTerverifikasi}
            onChange={(e) => setHanyaTerverifikasi(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-teal-950">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Hanya yang Terbukti Asli</span>
          </div>
        </label>
        <p className="text-[11px] text-teal-800 pl-6 leading-tight">
          Hanya unit yang memiliki foto fisik bersama kode verifikasi ({filterCounts.terverifikasi})
        </p>
      </div>

      {/* 2. FILTER MEREK */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Merek Smartphone
        </h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {(showAllMerek ? masterMerek : masterMerek.slice(0, 6)).map((m) => {
            const count = filterCounts.merek[m] || 0;
            const checked = selectedMerek.includes(m);
            return (
              <label
                key={m}
                className="flex items-center justify-between text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayFilter(m, selectedMerek, setSelectedMerek)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={checked ? 'font-bold text-teal-900' : ''}>{m}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
        {masterMerek.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllMerek(!showAllMerek)}
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>{showAllMerek ? 'Tampilkan Lebih Sedikit' : 'Lihat Selengkapnya'}</span>
            {showAllMerek ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* 3. FILTER RENTANG HARGA (SLIDER + MANUAL INPUT) */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Rentang Harga
        </h4>
        
        {/* Slider input */}
        <div className="space-y-2">
          <input
            type="range"
            min={HARGA_MIN}
            max={HARGA_MAX}
            step={250000}
            value={maxHarga}
            onChange={(e) => setMaxHarga(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{formatRupiah(HARGA_MIN)}</span>
            <span>Maks: {formatRupiah(maxHarga)}</span>
          </div>
        </div>

        {/* Input Manual Min & Max */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Dari</span>
            <input
              type="number"
              value={minHarga}
              onChange={(e) => setMinHarga(Number(e.target.value) || 0)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Sampai</span>
            <input
              type="number"
              value={maxHarga}
              onChange={(e) => setMaxHarga(Number(e.target.value) || HARGA_MAX)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. FILTER KAPASITAS */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Kapasitas Memori
        </h4>
        <div className="space-y-2">
          {masterKapasitas.map((k) => {
            const count = filterCounts.kapasitas[k] || 0;
            const checked = selectedKapasitas.includes(k);
            return (
              <label
                key={k}
                className="flex items-center justify-between text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayFilter(k, selectedKapasitas, setSelectedKapasitas)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={checked ? 'font-bold text-teal-900' : ''}>{k}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. FILTER KONDISI */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Kondisi Fisik
        </h4>
        <div className="space-y-2">
          {masterKondisi.map((kd) => {
            const count = filterCounts.kondisi[kd] || 0;
            const checked = selectedKondisi.includes(kd);
            return (
              <label
                key={kd}
                className="flex items-center justify-between text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayFilter(kd, selectedKondisi, setSelectedKondisi)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={checked ? 'font-bold text-teal-900' : ''}>{kd}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. FILTER DAERAH LOKASI COD */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Daerah Titik Temu COD
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {masterDaerah.map((d) => {
            const count = filterCounts.daerah[d] || 0;
            const checked = selectedDaerah.includes(d);
            return (
              <label
                key={d}
                className="flex items-center justify-between text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayFilter(d, selectedDaerah, setSelectedDaerah)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={checked ? 'font-bold text-teal-900' : ''}>{d}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(false)}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md transition cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Terapkan Filter ({filteredIklan.length} Hasil)</span>
        </button>
      </div>

    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* ================= HEADER HALAMAN & PENCARIAN ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Cari HP Bekas Terverifikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Katalog smartphone dengan bukti fisik kode unik dan transparansi kondisi lengkap
            </p>
          </div>

          {/* Kotak Pencarian Cepat */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari merek, tipe, atau kode KB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Indikator Badge Filter Aktif */}
        {(selectedMerek.length > 0 ||
          selectedKapasitas.length > 0 ||
          selectedKondisi.length > 0 ||
          selectedDaerah.length > 0 ||
          hanyaTerverifikasi ||
          minHarga > HARGA_MIN ||
          maxHarga < HARGA_MAX) && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Filter Aktif:</span>
            
            {hanyaTerverifikasi && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <span>Terbukti Asli</span>
                <button type="button" onClick={() => setHanyaTerverifikasi(false)} className="hover:text-teal-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedMerek.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                <span>Merek: {m}</span>
                <button type="button" onClick={() => toggleArrayFilter(m, selectedMerek, setSelectedMerek)} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedKapasitas.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                <span>{k}</span>
                <button type="button" onClick={() => toggleArrayFilter(k, selectedKapasitas, setSelectedKapasitas)} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedKondisi.map((kd) => (
              <span key={kd} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                <span>Kondisi: {kd}</span>
                <button type="button" onClick={() => toggleArrayFilter(kd, selectedKondisi, setSelectedKondisi)} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedDaerah.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                <span>Lokasi: {d}</span>
                <button type="button" onClick={() => toggleArrayFilter(d, selectedDaerah, setSelectedDaerah)} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {(minHarga > HARGA_MIN || maxHarga < HARGA_MAX) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                <span>Harga: {formatRupiah(minHarga)} - {formatRupiah(maxHarga)}</span>
                <button type="button" onClick={() => { setMinHarga(HARGA_MIN); setMaxHarga(HARGA_MAX); }} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetSemua}
              className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer ml-1"
            >
              Hapus Semua
            </button>
          </div>
        )}
      </div>

      {/* ================= LAYOUT UTAMA: 2 KOLOM ================= */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        
        {/* ================= KOLOM KIRI: PANEL FILTER STICKY (~25%) ================= */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs max-h-[calc(100vh-120px)] overflow-y-auto">
          <FilterPanelContent />
        </aside>

        {/* ================= KOLOM KANAN: AREA PRODUK & KONTROL (~75%) ================= */}
        <main className="flex-1 w-full space-y-6">
          
          {/* Bar Kontrol Atas: Total Hasil + Toggle Grid/List + Dropdown Sort */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-slate-600 font-medium">
              Menampilkan <strong className="text-slate-900 font-bold">{filteredIklan.length}</strong> smartphone terverifikasi
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              
              {/* Toggle Tampilan Grid / List */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Tampilan Grid"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-teal-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="Tampilan List"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-teal-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Dropdown Urutkan */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="terbaru">Terbaru Dulu</option>
                  <option value="termurah">Harga Termurah</option>
                  <option value="termahal">Harga Termahal</option>
                  <option value="terpopuler">Paling Banyak Dilihat</option>
                </select>
              </div>

            </div>
          </div>

          {/* Penanganan State Error */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
              <h3 className="text-sm font-bold text-red-900">Gagal Memuat Data Iklan</h3>
              <p className="text-xs text-red-700 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={fetchIklan}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : !loading && filteredIklan.length === 0 ? (
            /* Jika Tidak Ada Hasil */
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-14 text-center max-w-md mx-auto space-y-4 shadow-sm my-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Tidak Ada Iklan yang Sesuai
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Tidak ada smartphone yang cocok dengan kombinasi filter yang Anda pilih. Coba ubah atau reset filter.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetSemua}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-md"
                >
                  Reset Semua Filter
                </button>
              </div>
            </div>
          ) : (
            /* Daftar Produk (Grid atau List Mode) */
            <div className="space-y-8">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
                  {visibleAds.map((iklan) => (
                    <IklanCard key={iklan.id} iklan={iklan} />
                  ))}
                </div>
              ) : (
                /* List View Mode */
                <div className="space-y-4">
                  {visibleAds.map((iklan) => (
                    <Link
                      key={iklan.id}
                      to={`/iklan/${iklan.id}`}
                      className="group bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                    >
                      <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={iklan.foto_utama_url || `https://picsum.photos/seed/${iklan.id}/300/300`}
                          alt={`${iklan.merek} ${iklan.tipe}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Terbukti
                        </div>
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {iklan.kondisi || 'Baik'}
                          </span>
                          {iklan.kode_verifikasi && (
                            <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                              {iklan.kode_verifikasi}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-teal-600 transition truncate">
                          {iklan.merek} {iklan.tipe} {iklan.kapasitas ? `(${iklan.kapasitas})` : ''}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {iklan.deskripsi || 'Tidak ada deskripsi tambahan.'}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {iklan.lokasi_detail || 'Kebumen'}
                          </span>
                          <span>•</span>
                          <span>{formatWaktuRelatif(iklan.dibuat_pada)}</span>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                        <span className="text-xl sm:text-2xl font-black text-teal-600 tracking-tight">
                          {formatRupiah(iklan.harga)}
                        </span>
                        {iklan.harga_negosiasi && (
                          <span className="text-[11px] text-slate-400 font-medium">(Bisa Nego)</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tombol Pagination "Lihat Lebih Banyak Iklan" */}
              {filteredIklan.length > visibleCount && (
                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 16)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-100 text-teal-800 font-bold text-sm rounded-2xl border-2 border-teal-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <span>Lihat Lebih Banyak Iklan ({filteredIklan.length - visibleCount} tersisa)</span>
                    <ChevronDown className="w-4 h-4 text-teal-600" />
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ================= MOBILE FLOATING FILTER BUTTON & BOTTOM SHEET ================= */}
      <div className="lg:hidden">
        {/* Tombol Floating Filter di Pojok Kiri Bawah */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-3.5 rounded-full shadow-2xl font-bold text-sm cursor-pointer ring-4 ring-white/80"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter ({selectedMerek.length + selectedKapasitas.length + selectedKondisi.length + selectedDaerah.length + (hanyaTerverifikasi ? 1 : 0)})</span>
        </button>

        {/* Mobile Bottom Sheet Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                  <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                  <span>Filter Produk</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <FilterPanelContent />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
