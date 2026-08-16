import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  Camera, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Info, 
  Loader2, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  PhoneCall,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatRupiah } from '../lib/utils';
import { applyWatermark } from '../lib/watermark';
import toast from 'react-hot-toast';

export default function PasangIklan() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Generate kode verifikasi unik di frontend saat form dibuka (STABIL)
  const [kodeVerifikasi] = useState(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `KB-${randomNum}`;
  });

  // State Form
  const [merek, setMerek] = useState('Apple');
  const [tipe, setTipe] = useState('');
  const [kapasitas, setKapasitas] = useState('128 GB');
  const [warna, setWarna] = useState('');
  const [kondisi, setKondisi] = useState('Sangat Baik');
  const [harga, setHarga] = useState('');
  const [bisaNego, setBisaNego] = useState(true);

  const [lokasiDetail, setLokasiDetail] = useState('');
  const [kelengkapan, setKelengkapan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [imei, setImei] = useState('');
  const [kesehatanBaterai, setKesehatanBaterai] = useState('');

  // State File Foto
  const [fotoUtamaFile, setFotoUtamaFile] = useState(null);
  const [fotoUtamaPreview, setFotoUtamaPreview] = useState(null);

  const [fotoTambahanFiles, setFotoTambahanFiles] = useState([]);
  const [fotoTambahanPreviews, setFotoTambahanPreviews] = useState([]);

  const [fotoBuktiFile, setFotoBuktiFile] = useState(null);
  const [fotoBuktiPreview, setFotoBuktiPreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Format valid yang diizinkan
  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Validasi Real-time Flags
  const isHargaValid = !harga || (Number(harga) >= 100000);
  const isImeiValid = !imei || (imei.length === 15);
  const isBateraiValid = !kesehatanBaterai || (Number(kesehatanBaterai) >= 0 && Number(kesehatanBaterai) <= 100);
  const isLokasiValid = !lokasiDetail || (lokasiDetail.trim().length >= 10);
  const isDeskripsiValid = !deskripsi || (deskripsi.trim().length >= 20);
  const isKelengkapanValid = !kelengkapan || (kelengkapan.trim().length >= 5);

  const adaNomorWa = Boolean(profile?.nomor_hp && profile.nomor_hp.trim().length >= 8);

  // Helper validasi file
  const validateFile = (file) => {
    if (!allowedFormats.includes(file.type.toLowerCase())) {
      toast.error(`Format file ${file.name} tidak didukung. Gunakan JPG, PNG, atau WEBP.`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File ${file.name} terlalu besar (maks 5MB)`);
      return false;
    }
    return true;
  };

  // Handler Upload Foto Utama
  const handleFotoUtamaChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFotoUtamaFile(file);
      setFotoUtamaPreview(URL.createObjectURL(file));
    }
  };

  // Handler Upload Foto Tambahan
  const handleFotoTambahanChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + fotoTambahanFiles.length > 5) {
      toast.error('Maksimal 5 foto tambahan');
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (validateFile(file)) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setFotoTambahanFiles((prev) => [...prev, ...newFiles]);
    setFotoTambahanPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFotoTambahan = (index) => {
    setFotoTambahanFiles((prev) => prev.filter((_, i) => i !== index));
    setFotoTambahanPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler Upload Foto Bukti Kepemilikan
  const handleFotoBuktiChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFotoBuktiFile(file);
      setFotoBuktiPreview(URL.createObjectURL(file));
    }
  };

  // Helper Unggah File ke Supabase Storage
  const uploadSingleFile = async (file, prefix) => {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${user.id}/${Date.now()}_${prefix}_${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from('foto_iklan')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Gagal mengunggah ${prefix}: ${error.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('foto_iklan')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  };

  // Handler Submit Formulir
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // 1. Validasi Profil WhatsApp
    if (!adaNomorWa) {
      toast.error('Silakan lengkapi nomor WhatsApp di profil Anda sebelum memasang iklan');
      return;
    }

    // 2. Validasi Input Ketat
    if (!merek || !tipe.trim()) {
      toast.error('Silakan masukkan Merek dan Tipe HP');
      return;
    }
    if (!kondisi) {
      toast.error('Silakan pilih Kondisi HP');
      return;
    }
    if (!harga || Number(harga) < 100000) {
      toast.error('Harga minimal Rp 100.000');
      return;
    }
    if (!lokasiDetail.trim() || lokasiDetail.trim().length < 10) {
      toast.error('Lokasi minimal 10 karakter agar jelas');
      return;
    }
    if (!deskripsi.trim() || deskripsi.trim().length < 20) {
      toast.error('Deskripsi minimal 20 karakter');
      return;
    }
    if (kelengkapan.trim() && kelengkapan.trim().length < 5) {
      toast.error('Kelengkapan terlalu singkat (minimal 5 karakter)');
      return;
    }
    if (imei.trim() && imei.trim().length !== 15) {
      toast.error('IMEI harus tepat 15 digit angka');
      return;
    }
    if (kesehatanBaterai && (Number(kesehatanBaterai) < 0 || Number(kesehatanBaterai) > 100)) {
      toast.error('Kesehatan baterai 0-100%');
      return;
    }
    if (!fotoUtamaFile) {
      toast.error('Foto Utama HP wajib diunggah');
      return;
    }
    if (!fotoBuktiFile) {
      toast.error('Foto Bukti Kepemilikan wajib diunggah');
      return;
    }

    try {
      setIsSubmitting(true);
      const username = profile?.nama_lengkap || user?.email?.split('@')[0] || 'Pengguna';

      // 1. Terapkan Watermark & Unggah Foto Utama
      setUploadProgress('Menerapkan watermark & mengunggah foto utama...');
      const watermarkedUtama = await applyWatermark(fotoUtamaFile, username);
      const fotoUtamaUrl = await uploadSingleFile(watermarkedUtama, 'utama');

      // 2. Terapkan Watermark & Unggah Foto Tambahan jika ada
      const fotoLainUrls = [];
      if (fotoTambahanFiles.length > 0) {
        setUploadProgress(`Menerapkan watermark & mengunggah ${fotoTambahanFiles.length} foto tambahan...`);
        for (let i = 0; i < fotoTambahanFiles.length; i++) {
          const watermarkedTambahan = await applyWatermark(fotoTambahanFiles[i], username);
          const url = await uploadSingleFile(watermarkedTambahan, `tambahan_${i + 1}`);
          fotoLainUrls.push(url);
        }
      }

      // 3. Terapkan Watermark & Unggah Foto Bukti Kepemilikan
      setUploadProgress('Menerapkan watermark & mengunggah foto bukti kepemilikan...');
      const watermarkedBukti = await applyWatermark(fotoBuktiFile, username);
      const fotoBuktiUrl = await uploadSingleFile(watermarkedBukti, 'bukti');

      // 4. Simpan Data ke Tabel Iklan
      setUploadProgress('Menyimpan data iklan...');
      const payloadIklan = {
        penjual_id: user.id,
        daerah_id: profile?.daerah_id || 1,
        merek,
        tipe: tipe.trim(),
        kapasitas,
        warna: warna.trim() || null,
        kondisi,
        harga: Math.round(Number(harga)),
        harga_negosiasi: bisaNego,
        lokasi_detail: lokasiDetail.trim(),
        kelengkapan: kelengkapan.trim() || null,
        deskripsi: deskripsi.trim() || null,
        imei: imei.trim() || null,
        kesehatan_baterai: kesehatanBaterai ? Number(kesehatanBaterai) : null,
        foto_utama_url: fotoUtamaUrl,
        foto_lain_urls: fotoLainUrls,
        foto_bukti_kepemilikan_url: fotoBuktiUrl,
        kode_verifikasi: kodeVerifikasi,
        status: 'tersedia',
      };

      const { data: iklanTersimpan, error: insertError } = await supabase
        .from('iklan')
        .insert(payloadIklan)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success('Iklan berhasil dipasang!');

      // Arahkan ke Halaman Sukses
      navigate('/pasang-iklan/sukses', {
        state: {
          iklanId: iklanTersimpan.id,
          kodeVerifikasi,
          merek,
          tipe: tipe.trim(),
          harga: Math.round(Number(harga)),
        },
      });

    } catch (err) {
      console.error('Terjadi kesalahan saat memasang iklan:', err);
      toast.error(err.message || 'Gagal memasang iklan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Halaman */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Pasang Iklan Smartphone
        </h1>
        <p className="text-sm text-slate-500">
          Lengkapi detail barang dan sertakan foto bukti kepemilikan agar iklan Anda terverifikasi.
        </p>
      </div>

      {/* Peringatan Nomor WhatsApp jika belum diisi di profil */}
      {!adaNomorWa && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">
              Nomor WhatsApp Belum Terisi di Profil
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Anda belum mengisi nomor WhatsApp. Silakan lengkapi{' '}
              <Link to="/profil" className="font-bold underline text-amber-950 hover:text-amber-900">
                Profil Anda
              </Link>{' '}
              agar calon pembeli dapat menghubungi Anda saat tertarik dengan iklan ini.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ================= BAGIAN 1: INFORMASI BARANG ================= */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Informasi Barang
              </h2>
              <p className="text-xs text-slate-500">
                Spesifikasi utama smartphone yang dijual
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Merek */}
            <div className="space-y-1.5">
              <label htmlFor="merek" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Merek Smartphone <span className="text-red-500">*</span>
              </label>
              <select
                id="merek"
                name="merek"
                value={merek}
                onChange={(e) => setMerek(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Oppo">Oppo</option>
                <option value="Vivo">Vivo</option>
                <option value="Realme">Realme</option>
                <option value="Google">Google</option>
                <option value="Infinix">Infinix</option>
                <option value="Asus">Asus</option>
                <option value="Poco">Poco</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Tipe HP */}
            <div className="space-y-1.5">
              <label htmlFor="tipe" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Tipe / Model HP <span className="text-red-500">*</span>
              </label>
              <input
                id="tipe"
                name="tipe"
                type="text"
                placeholder="Contoh: iPhone 13 Pro, Galaxy S22"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Kapasitas (Hanya 64GB s/d 1TB) */}
            <div className="space-y-1.5">
              <label htmlFor="kapasitas" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Kapasitas Penyimpanan
              </label>
              <select
                id="kapasitas"
                name="kapasitas"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
              >
                <option value="64 GB">64 GB</option>
                <option value="128 GB">128 GB</option>
                <option value="256 GB">256 GB</option>
                <option value="512 GB">512 GB</option>
                <option value="1 TB">1 TB</option>
              </select>
            </div>

            {/* Warna */}
            <div className="space-y-1.5">
              <label htmlFor="warna" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Warna Bodi
              </label>
              <input
                id="warna"
                name="warna"
                type="text"
                placeholder="Contoh: Sierra Blue, Phantom Black"
                value={warna}
                onChange={(e) => setWarna(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Kondisi */}
            <div className="space-y-1.5">
              <label htmlFor="kondisi" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Kondisi Fisik & Fungsi <span className="text-red-500">*</span>
              </label>
              <select
                id="kondisi"
                name="kondisi"
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
              >
                <option value="Sangat Baik">Sangat Baik (Mulus 95-99%, fungsi normal)</option>
                <option value="Baik">Baik (Pemakaian wajar, bodi lecet halus)</option>
                <option value="Sedang">Sedang (Ada dent/goresan jelas, fungsi normal)</option>
                <option value="Butuh Servis">Butuh Servis (Ada minus fungsi/fisik retak)</option>
              </select>
            </div>

            {/* Harga */}
            <div className="space-y-1.5">
              <label htmlFor="harga" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="harga"
                name="harga"
                type="number"
                placeholder="Contoh: 4500000"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                required
                min="100000"
                step="10000"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition font-mono font-bold text-orange-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  !isHargaValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
              {!isHargaValid && (
                <p className="text-[11px] text-red-500 font-medium">
                  Harga minimal Rp 100.000
                </p>
              )}
              {harga && isHargaValid && Number(harga) > 0 && (
                <p className="text-xs text-orange-600 font-medium">
                  {formatRupiah(harga)}
                </p>
              )}
            </div>
          </div>

          {/* Opsi Nego */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Bisa Negosiasi Harga?
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="bisaNego"
                  checked={bisaNego === true}
                  onChange={() => setBisaNego(true)}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>Ya, harga bisa nego</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="bisaNego"
                  checked={bisaNego === false}
                  onChange={() => setBisaNego(false)}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>Harga Pas (Non-Nego)</span>
              </label>
            </div>
          </div>
        </section>

        {/* ================= BAGIAN 2: LOKASI & PENJUAL ================= */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Lokasi & Kelengkapan
              </h2>
              <p className="text-xs text-slate-500">
                Titik temu transaksi dan informasi pelengkap unit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Daerah (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Daerah Layanan</span>
                <span className="text-[11px] text-slate-400 font-normal">Dari Profil</span>
              </label>
              <input
                type="text"
                value="Kebumen, Jawa Tengah"
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Info WhatsApp Penjual */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Nomor WhatsApp Penjual</span>
                <span className="text-[11px] text-slate-400 font-normal">Otomatis dari Profil</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={profile?.nomor_hp || 'Belum diisi di profil'}
                  disabled
                  className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl text-sm font-medium cursor-not-allowed ${
                    adaNomorWa ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Nomor WhatsApp diambil dari profil Anda agar pembeli bisa menghubungi Anda.
              </p>
            </div>

            {/* Lokasi Detail */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="lokasi_detail" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Lokasi Detail / Titik Temu <span className="text-red-500">* (Min. 10 Karakter)</span>
              </label>
              <input
                id="lokasi_detail"
                name="lokasi_detail"
                type="text"
                placeholder="Contoh: Kebumen Kota, dekat Alun-alun Kebumen"
                value={lokasiDetail}
                onChange={(e) => setLokasiDetail(e.target.value)}
                required
                minLength={10}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  !isLokasiValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
              {!isLokasiValid && (
                <p className="text-[11px] text-red-500 font-medium">
                  Lokasi minimal 10 karakter agar jelas
                </p>
              )}
            </div>

            {/* Kelengkapan */}
            <div className="space-y-1.5">
              <label htmlFor="kelengkapan" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Kelengkapan Unit (Opsional)
              </label>
              <input
                id="kelengkapan"
                name="kelengkapan"
                type="text"
                placeholder="Contoh: Fullset original (Dus + Kabel Type-C)"
                value={kelengkapan}
                onChange={(e) => setKelengkapan(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  !isKelengkapanValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
              {!isKelengkapanValid && (
                <p className="text-[11px] text-red-500 font-medium">
                  Kelengkapan terlalu singkat (minimal 5 karakter)
                </p>
              )}
            </div>

            {/* Kesehatan Baterai */}
            <div className="space-y-1.5">
              <label htmlFor="kesehatan_baterai" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Kesehatan Baterai (Battery Health %)
              </label>
              <input
                id="kesehatan_baterai"
                name="kesehatan_baterai"
                type="number"
                placeholder="Contoh: 88"
                min="0"
                max="100"
                value={kesehatanBaterai}
                onChange={(e) => setKesehatanBaterai(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  !isBateraiValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
              {!isBateraiValid && (
                <p className="text-[11px] text-red-500 font-medium">
                  Kesehatan baterai 0-100%
                </p>
              )}
            </div>

            {/* IMEI */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="imei" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Nomor IMEI (Opsional, 15 Digit Angka)
              </label>
              <input
                id="imei"
                name="imei"
                type="text"
                placeholder="Contoh: 352093847291823"
                maxLength="15"
                value={imei}
                onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  !isImeiValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
              {!isImeiValid && (
                <p className="text-[11px] text-red-500 font-medium">
                  IMEI harus 15 digit angka
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                IMEI membantu calon pembeli memverifikasi legalitas dan status garansi unit.
              </p>
            </div>

            {/* Deskripsi */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="deskripsi" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                Deskripsi Lengkap <span className="text-red-500">* (Min. 20 Karakter)</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows="4"
                placeholder="Jelaskan kondisi unit secara jujur: riwayat pemakaian, minus fisik, kelengkapan, garansi, dll."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                required
                minLength={20}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  !isDeskripsiValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
              {!isDeskripsiValid && (
                <p className="text-[11px] text-red-500 font-medium">
                  Deskripsi minimal 20 karakter
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ================= BAGIAN 3: FOTO BARANG & BUKTI (⭐ INTI BUKTIP) ================= */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Foto Unit & Bukti Kepemilikan
              </h2>
              <p className="text-xs text-slate-500">
                Foto jernih dan bukti kepemilikan mempercepat penjualan
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Foto Utama (Wajib) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Foto Utama Smartphone <span className="text-red-500">* (Wajib)</span>
              </label>
              
              {fotoUtamaPreview ? (
                <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-teal-500 group bg-slate-100">
                  <img
                    src={fotoUtamaPreview}
                    alt="Pratinjau Foto Utama"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-teal-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Foto Utama Terpilih
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFotoUtamaFile(null);
                      setFotoUtamaPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-sm aspect-[4/3] border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Pilih Foto Utama
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Format JPG, PNG, WEBP (Maks. 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoUtamaChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Foto Tambahan (0-5) */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Foto Tambahan (Opsional, Maksimal 5 Foto)</span>
                <span className="text-[11px] text-slate-400">{fotoTambahanFiles.length}/5 foto</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {fotoTambahanPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                  >
                    <img
                      src={preview}
                      alt={`Foto Tambahan ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFotoTambahan(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {fotoTambahanFiles.length < 5 && (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition p-2 text-center">
                    <Plus className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[11px] font-medium text-slate-600">
                      Tambah Foto
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFotoTambahanChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* ⭐ FOTO BUKTI KEPEMILIKAN DENGAN CONTOH BENAR VS SALAH */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <label className="text-sm font-bold text-slate-900">
                  Foto Bukti Kepemilikan <span className="text-red-500">* (Wajib)</span>
                </label>
              </div>

              {/* Banner Petunjuk & Tampilan Kode Verifikasi */}
              <div className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-5">
                
                {/* Tampilan Kode Verifikasi Besar */}
                <div className="bg-white rounded-xl border border-emerald-300 p-4 text-center shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Kode Verifikasi Anda:
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-teal-600 tracking-widest py-1">
                    {kodeVerifikasi}
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Kode ini menghubungkan unit smartphone dengan foto bukti fisik Anda
                  </span>
                </div>

                {/* 3 Langkah Mudah */}
                <div className="space-y-2 text-xs sm:text-sm text-emerald-950">
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cara Membuat Foto Bukti yang Benar:</span>
                  </p>
                  <p className="text-xs text-emerald-800">
                    Ikuti 3 langkah mudah ini:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-emerald-900 pl-1 leading-relaxed">
                    <li>
                      Buka halaman ini di HP yang akan dijual, atau tulis kode di atas di selembar kertas
                    </li>
                    <li>
                      Letakkan HP yang dijual berdampingan dengan kode tersebut
                    </li>
                    <li>
                      Foto keduanya dalam satu bingkai sehingga kode terlihat jelas
                    </li>
                  </ol>
                </div>

                {/* Contoh Perbandingan 2 Kolom (Benar vs Salah) */}
                <div className="pt-2 border-t border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 block">
                    Contoh Perbandingan:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Contoh Benar */}
                    <div className="bg-white border-2 border-emerald-400 rounded-xl p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>FOTO BENAR</span>
                      </div>
                      <div className="aspect-[16/9] bg-emerald-50 rounded-lg border border-dashed border-emerald-300 flex flex-col items-center justify-center p-3 text-center">
                        <div className="text-[11px] font-mono font-extrabold text-teal-700 bg-white px-2 py-1 rounded border border-teal-200 shadow-xs mb-1">
                          [HP + Kertas {kodeVerifikasi}]
                        </div>
                        <span className="text-[11px] text-emerald-800 font-medium">
                          Unit HP & kertas kode dalam 1 bingkai
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium text-center">
                        Kode terlihat jelas di foto
                      </p>
                    </div>

                    {/* Contoh Salah */}
                    <div className="bg-white border-2 border-red-300 rounded-xl p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>FOTO SALAH</span>
                      </div>
                      <div className="aspect-[16/9] bg-red-50 rounded-lg border border-dashed border-red-200 flex flex-col items-center justify-center p-3 text-center">
                        <div className="text-[11px] font-medium text-red-700 line-through mb-1">
                          [Hanya foto unit tanpa kode]
                        </div>
                        <span className="text-[11px] text-red-600">
                          Foto dari internet / tanpa kode verifikasi
                        </span>
                      </div>
                      <p className="text-[11px] text-red-600 font-medium text-center">
                        Tidak ada kode atau buram
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* Kotak Unggah Foto Bukti Kepemilikan */}
              {fotoBuktiPreview ? (
                <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-500 group bg-slate-100">
                  <img
                    src={fotoBuktiPreview}
                    alt="Pratinjau Foto Bukti"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    Foto Bukti Terpasang ({kodeVerifikasi})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFotoBuktiFile(null);
                      setFotoBuktiPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-sm aspect-[4/3] border-2 border-dashed border-emerald-400 bg-emerald-50/20 rounded-2xl cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/40 transition p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    Unggah Foto Bukti Kepemilikan
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Format JPG, PNG, WEBP (Maks. 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoBuktiChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

          </div>
        </section>

        {/* ================= BAGIAN 4: TOMBOL SIMPAN ================= */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || !adaNomorWa}
            className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{uploadProgress || 'Menyimpan...'}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-6 h-6" />
                <span>Pasang Iklan Sekarang</span>
              </>
            )}
          </button>

          {!adaNomorWa && (
            <p className="text-xs text-center text-red-500 font-medium">
              Tombol non-aktif karena nomor WhatsApp belum diisi di profil Anda.
            </p>
          )}
        </div>

      </form>
    </div>
  );
}
