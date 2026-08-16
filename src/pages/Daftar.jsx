import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Daftar() {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [setujuSyarat, setSetujuSyarat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { daftar } = useAuth();
  const navigate = useNavigate();

  // Validasi format email real-time
  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Evaluasi kekuatan sandi
  const getKekuatanSandi = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) {
      return { level: 'pendek', text: 'Sandi terlalu pendek', color: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/3' };
    }
    if (pwd.length <= 9) {
      return { level: 'sedang', text: 'Kekuatan sandi: Sedang', color: 'bg-amber-500', textColor: 'text-amber-600', width: 'w-2/3' };
    }
    return { level: 'kuat', text: 'Kekuatan sandi: Kuat', color: 'bg-emerald-500', textColor: 'text-emerald-600', width: 'w-full' };
  };

  const kekuatanSandi = getKekuatanSandi(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!namaLengkap.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage('Silakan isi email dan kata sandi');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Format email tidak benar');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter');
      return;
    }
    if (password !== konfirmasiPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi');
      return;
    }
    if (!setujuSyarat) {
      setErrorMessage('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi');
      return;
    }

    try {
      setLoading(true);
      await daftar(email.trim(), password, namaLengkap.trim());
      toast.success('Pendaftaran berhasil! Selamat datang di Buktip.');
      navigate('/pasang-iklan', { replace: true });
    } catch (err) {
      console.error('Gagal mendaftar:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      toast.error('Gagal mendaftar akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-4">
      <div className="max-w-[400px] w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header Form */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Buat Akun Buktip
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Jual beli HP bekas lebih aman dengan bukti kepemilikan
          </p>
        </div>

        {/* Pesan Error di Atas Form */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulir Pendaftaran */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={namaLengkap}
                onChange={(e) => {
                  setNamaLengkap(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  !isEmailValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {!isEmailValid && (
              <p className="text-[11px] text-red-500 font-medium">
                Format email tidak benar
              </p>
            )}
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <span className="text-[11px] text-gray-500 font-normal">
                Minimal 6 karakter
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Indikator Kekuatan Sandi */}
            {kekuatanSandi && (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${kekuatanSandi.color} ${kekuatanSandi.width} transition-all duration-300`} />
                </div>
                <p className={`text-[11px] font-medium ${kekuatanSandi.textColor}`}>
                  {kekuatanSandi.text}
                </p>
              </div>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Konfirmasi Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showKonfirmasiPassword ? 'text' : 'password'}
                placeholder="Ulangi kata sandi"
                value={konfirmasiPassword}
                onChange={(e) => {
                  setKonfirmasiPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowKonfirmasiPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showKonfirmasiPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {showKonfirmasiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Validasi Real-time Konfirmasi Sandi */}
            {konfirmasiPassword && (
              <p className={`text-[11px] font-medium ${password === konfirmasiPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                {password === konfirmasiPassword ? 'Sandi cocok' : 'Konfirmasi sandi tidak cocok'}
              </p>
            )}
          </div>

          {/* Checkbox Persetujuan Syarat & Ketentuan */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-relaxed">
              <input
                type="checkbox"
                checked={setujuSyarat}
                onChange={(e) => {
                  setSetujuSyarat(e.target.checked);
                  if (errorMessage) setErrorMessage('');
                }}
                className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 shrink-0 cursor-pointer"
              />
              <span>
                Saya setuju dengan <span className="text-teal-600 font-medium">Ketentuan Layanan</span> & <span className="text-teal-600 font-medium">Kebijakan Privasi</span>
              </span>
            </label>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading || !setujuSyarat || !isEmailValid || (konfirmasiPassword && password !== konfirmasiPassword)}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Daftar Akun Baru</span>
            )}
          </button>
        </form>

        {/* Tautan ke Halaman Login */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span>Sudah punya akun? </span>
          <Link
            to="/login"
            className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Masuk di sini
          </Link>
        </div>

        {/* Teks Keamanan di Bawah */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Kata sandi disimpan terenkripsi</span>
        </div>

      </div>
    </div>
  );
}
