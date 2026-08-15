import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Info, 
  Loader2, 
  Smartphone, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatRupiah } from '../lib/utils';
import toast from 'react-hot-toast';

export default function PasangIklan() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

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

  // Handler Upload Foto Utama
  const handleFotoUtamaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 5MB');
        return;
      }
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ukuran file ${file.name} melebihi 5MB`);
        continue;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
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
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran foto bukti maksimal 5MB');
        return;
      }
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

    // Validasi Wajib
    if (!merek || !tipe.trim()) {
      toast.error('Silakan masukkan Merek dan Tipe HP');
      return;
    }
    if (!kondisi) {
      toast.error('Silakan pilih Kondisi HP');
      return;
    }
    if (!harga || Number(harga) <= 0) {
      toast.error('Silakan masukkan Harga yang valid');
      return;
    }
    if (!lokasiDetail.trim()) {
      toast.error('Silakan masukkan Lokasi Detail titik temu');
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
      setUploadProgress('Menyiapkan kode verifikasi...');

      // 1. Dapatkan Kode Verifikasi Unik Otomatis
      let kodeVerifikasi = '';
      try {
        const { data: generatedCode, error: rpcError } = await supabase.rpc('generate_kode_verifikasi');
        if (!rpcError && generatedCode) {
          kodeVerifikasi = generatedCode;
        }
      } catch (err) {
        console.warn('RPC generate_kode_verifikasi gagal, menggunakan fallback:', err);
      }

      if (!kodeVerifikasi) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        kodeVerifikasi = `KB-${randomNum}`;
      }

      // 2. Unggah Foto Utama
      setUploadProgress('Mengunggah foto utama...');
      const fotoUtamaUrl = await uploadSingleFile(fotoUtamaFile, 'utama');

      // 3. Unggah Foto Tambahan jika ada
      const fotoLainUrls = [];
      if (fotoTambahanFiles.length > 0) {
        setUploadProgress(`Mengunggah ${fotoTambahanFiles.length} foto tambahan...`);
        for (let i = 0; i < fotoTambahanFiles.length; i++) {
          const url = await uploadSingleFile(fotoTambahanFiles[i], `tambahan_${i + 1}`);
          fotoLainUrls.push(url);
        }
      }

      // 4. Unggah Foto Bukti Kepemilikan
      setUploadProgress('Mengunggah foto bukti kepemilikan...');
      const fotoBuktiUrl = await uploadSingleFile(fotoBuktiFile, 'bukti');

      // 5. Simpan Data ke Tabel Iklan
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
              <label className="text-xs font-semibold text-slate-700">
                Merek Smartphone <span className="text-red-500">*</span>
              </label>
              <select
                value={merek}
                onChange={(e) => setMerek(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
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
              <label className="text-xs font-semibold text-slate-700">
                Tipe / Model HP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: iPhone 13 Pro, Galaxy S22"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Kapasitas */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Kapasitas Penyimpanan
              </label>
              <select
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              >
                <option value="32 GB">32 GB</option>
                <option value="64 GB">64 GB</option>
                <option value="128 GB">128 GB</option>
                <option value="256 GB">256 GB</option>
                <option value="512 GB">512 GB</option>
                <option value="1 TB">1 TB</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Warna */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Warna Bodi
              </label>
              <input
                type="text"
                placeholder="Contoh: Sierra Blue, Phantom Black"
                value={warna}
                onChange={(e) => setWarna(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Kondisi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Kondisi Fisik & Fungsi <span className="text-red-500">*</span>
              </label>
              <select
                value={kondisi}
                onChange={(e) => setKondiisi(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              >
                <option value="Sangat Baik">Sangat Baik (Mulus 95-99%, fungsi normal)</option>
                <option value="Baik">Baik (Pemakaian wajar, bodi lecet halus)</option>
                <option value="Sedang">Sedang (Ada dent/goresan jelas, fungsi normal)</option>
                <option value="Butuh Servis">Butuh Servis (Ada minus fungsi/fisik retak)</option>
              </select>
            </div>

            {/* Harga */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Contoh: 4500000"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                required
                min="0"
                step="10000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-mono font-bold text-orange-600"
              />
              {harga && Number(harga) > 0 && (
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

            {/* Lokasi Detail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Lokasi Detail / Titik Temu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Kebumen Kota, dekat Alun-alun"
                value={lokasiDetail}
                onChange={(e) => setLokasiDetail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Kelengkapan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Kelengkapan Unit
              </label>
              <input
                type="text"
                placeholder="Contoh: Fullset original (Dus + Kabel Type-C)"
                value={kelengkapan}
                onChange={(e) => setKelengkapan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Kesehatan Baterai */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Kesehatan Baterai (Battery Health %)
              </label>
              <input
                type="number"
                placeholder="Contoh: 88"
                min="0"
                max="100"
                value={kesehatanBaterai}
                onChange={(e) => setKesehatanBaterai(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* IMEI */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nomor IMEI (15 Digit)
              </label>
              <input
                type="text"
                placeholder="Contoh: 352093847291823"
                maxLength="15"
                value={imei}
                onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              <p className="text-[11px] text-slate-400">
                IMEI membantu calon pembeli memverifikasi legalitas dan status garansi unit.
              </p>
            </div>

            {/* Deskripsi */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Deskripsi Lengkap
              </label>
              <textarea
                rows="4"
                placeholder="Jelaskan kondisi unit secara jujur: riwayat pemakaian, minus fisik, kelengkapan, garansi, dll."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>
          </div>
        </section>

        {/* ================= BAGIAN 3: FOTO BARANG (⭐ PENTING) ================= */}
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
                  <button
                    type="button"
                    onClick={() => {
                      setFotoUtamaFile(null);
                      setFotoUtamaPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition"
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
                    accept="image/*"
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
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition"
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
                      accept="image/*"
                      multiple
                      onChange={handleFotoTambahanChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* ⭐ FOTO BUKTI KEPEMILIKAN (Wajib) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <label className="text-sm font-bold text-slate-900">
                  Foto Bukti Kepemilikan <span className="text-red-500">* (Wajib)</span>
                </label>
              </div>

              {/* Info Card Petunjuk Verifikasi */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Petunjuk Foto Bukti Kepemilikan:</span>
                </p>
                <p className="text-xs text-emerald-800 leading-relaxed pl-5.5">
                  Foto HP yang menampilkan layar dengan kode verifikasi yang akan muncul setelah iklan disimpan. Anda juga dapat mengunggah foto unit bersama kertas bertuliskan nama Anda terlebih dahulu.
                </p>
              </div>

              {fotoBuktiPreview ? (
                <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-500 group bg-slate-100">
                  <img
                    src={fotoBuktiPreview}
                    alt="Pratinjau Foto Bukti"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Foto Bukti Terpasang
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFotoBuktiFile(null);
                      setFotoBuktiPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-sm aspect-[4/3] border-2 border-dashed border-emerald-300 bg-emerald-50/20 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40 transition p-6 text-center">
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
                    accept="image/*"
                    onChange={handleFotoBuktiChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

          </div>
        </section>

        {/* ================= BAGIAN 4: TOMBOL SIMPAN ================= */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{uploadProgress || 'Menyimpan Iklan...'}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-6 h-6" />
                <span>Pasang Iklan Sekarang</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
