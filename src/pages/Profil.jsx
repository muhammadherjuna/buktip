import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  MapPin, 
  Home, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Profil() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // State Form
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorWhatsapp, setNomorWhatsapp] = useState('');
  const [daerah, setDaerah] = useState('Kebumen, Jawa Tengah');
  const [alamatLengkap, setAlamatLengkap] = useState('');

  // State Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Isi form otomatis saat data profil termuat
  useEffect(() => {
    if (profile) {
      setNamaLengkap(profile.nama_lengkap || user?.user_metadata?.nama_lengkap || '');
      setNomorWhatsapp(profile.nomor_hp || '');
      setAlamatLengkap(profile.alamat_lengkap || '');
    } else if (user) {
      setNamaLengkap(user.user_metadata?.nama_lengkap || user.email?.split('@')[0] || '');
    }
  }, [profile, user]);

  // Validasi Real-time Flags
  const isNamaValid = namaLengkap.trim().length >= 3;
  const isWaValid = Boolean(
    nomorWhatsapp && 
    nomorWhatsapp.length >= 10 && 
    nomorWhatsapp.length <= 13 && 
    (nomorWhatsapp.startsWith('08') || nomorWhatsapp.startsWith('62') || nomorWhatsapp.startsWith('0'))
  );
  const isDaerahValid = daerah.trim().length >= 5;
  const isAlamatValid = !alamatLengkap || alamatLengkap.trim().length >= 10;

  const isFormValid = isNamaValid && isWaValid && isDaerahValid && isAlamatValid;

  // Handler input nomor WhatsApp hanya angka
  const handleWhatsappChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    setNomorWhatsapp(rawDigits);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!user) {
      toast.error('Anda harus masuk akun terlebih dahulu');
      return;
    }

    if (!isNamaValid) {
      setErrorMessage('Nama lengkap minimal 3 karakter');
      toast.error('Nama lengkap minimal 3 karakter');
      return;
    }

    if (!isWaValid) {
      setErrorMessage('Nomor WhatsApp harus 10-13 digit angka (contoh: 081234567890)');
      toast.error('Nomor WhatsApp harus 10-13 digit angka');
      return;
    }

    if (!isDaerahValid) {
      setErrorMessage('Daerah layanan minimal 5 karakter');
      toast.error('Daerah layanan minimal 5 karakter');
      return;
    }

    if (!isAlamatValid) {
      setErrorMessage('Alamat lengkap minimal 10 karakter jika diisi');
      toast.error('Alamat lengkap minimal 10 karakter jika diisi');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        id: user.id,
        nama_lengkap: namaLengkap.trim(),
        nomor_hp: nomorWhatsapp.trim(),
        alamat_lengkap: alamatLengkap.trim() || null,
        diperbarui_pada: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      // Perbarui state AuthContext agar nomor WA langsung terbaca di Pasang Iklan
      if (refreshProfile) {
        await refreshProfile();
      }

      setSuccessMessage('Profil berhasil disimpan!');
      toast.success('Profil berhasil diperbarui!');

    } catch (err) {
      console.error('Gagal menyimpan profil:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan profil');
      toast.error('Gagal menyimpan profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-8">
      <div className="max-w-[500px] w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        
        {/* ================= BAGIAN ATAS: JUDUL ================= */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs border border-teal-100">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Profil Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Lengkapi data diri Anda agar pembeli dapat menghubungi Anda
          </p>
        </div>

        {/* Saran / Pesan Ramah Pengguna Baru */}
        {(!profile?.nomor_hp) && (
          <div className="bg-teal-50/70 border border-teal-200/90 rounded-2xl p-4 flex items-start gap-3 text-left shadow-xs">
            <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-900 leading-relaxed">
              Lengkapi data diri Anda agar pembeli dapat menghubungi dengan mudah. Data ini hanya perlu diisi satu kali dan akan dipakai otomatis untuk setiap iklan yang Anda pasang.
            </p>
          </div>
        )}

        {/* Pesan Sukses Hijau */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Pesan Error Merah */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= FORMULIR PROFIL ================= */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Nama Lengkap */}
          <div className="space-y-1.5">
            <label htmlFor="nama_lengkap" className="text-xs font-semibold text-slate-700 block cursor-pointer">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="nama_lengkap"
                name="nama_lengkap"
                type="text"
                placeholder="Nama Lengkap Anda"
                value={namaLengkap}
                onChange={(e) => {
                  setNamaLengkap(e.target.value);
                  setErrorMessage('');
                }}
                required
                minLength={3}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  namaLengkap && !isNamaValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {namaLengkap && !isNamaValid && (
              <p className="text-[11px] text-red-500 font-medium">
                Nama lengkap minimal 3 karakter
              </p>
            )}
          </div>

          {/* 2. Nomor WhatsApp (⭐ WAJIB) */}
          <div className="space-y-1.5">
            <label htmlFor="nomor_whatsapp" className="text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
              <span>Nomor WhatsApp <span className="text-red-500">* (Wajib)</span></span>
              <span className="text-[11px] text-slate-400 font-normal">10-13 Digit</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="nomor_whatsapp"
                name="nomor_whatsapp"
                type="tel"
                inputMode="numeric"
                placeholder="Contoh: 081234567890"
                value={nomorWhatsapp}
                onChange={handleWhatsappChange}
                required
                maxLength={13}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  nomorWhatsapp && !isWaValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {nomorWhatsapp && !isWaValid ? (
              <p className="text-[11px] text-red-500 font-medium">
                Format nomor belum sesuai (minimal 10 digit angka, contoh: 081234567890)
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Nomor ini dipakai pembeli menghubungi Anda
              </p>
            )}
          </div>

          {/* 3. Daerah / Kabupaten (⭐ WAJIB) */}
          <div className="space-y-1.5">
            <label htmlFor="daerah" className="text-xs font-semibold text-slate-700 block cursor-pointer">
              Daerah / Kabupaten <span className="text-red-500">* (Wajib)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="daerah"
                name="daerah"
                type="text"
                placeholder="Contoh: Kebumen, Jawa Tengah"
                value={daerah}
                onChange={(e) => {
                  setDaerah(e.target.value);
                  setErrorMessage('');
                }}
                required
                minLength={5}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  daerah && !isDaerahValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {daerah && !isDaerahValid ? (
              <p className="text-[11px] text-red-500 font-medium">
                Daerah minimal 5 karakter
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Digunakan sebagai lokasi utama iklan Anda
              </p>
            )}
          </div>

          {/* 4. Alamat Lengkap (Opsional) */}
          <div className="space-y-1.5">
            <label htmlFor="alamat_lengkap" className="text-xs font-semibold text-slate-700 block cursor-pointer">
              Alamat Lengkap (Opsional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-400">
                <Home className="w-4 h-4" />
              </div>
              <textarea
                id="alamat_lengkap"
                name="alamat_lengkap"
                rows="3"
                placeholder="Jalan, nomor rumah, patokan..."
                value={alamatLengkap}
                onChange={(e) => {
                  setAlamatLengkap(e.target.value);
                  setErrorMessage('');
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  alamatLengkap && !isAlamatValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {alamatLengkap && !isAlamatValid ? (
              <p className="text-[11px] text-red-500 font-medium">
                Alamat minimal 10 karakter jika diisi
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Tidak ditampilkan publik, hanya untuk keperluan pertemuan
              </p>
            )}
          </div>

          {/* ================= TOMBOL SIMPAN ================= */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
