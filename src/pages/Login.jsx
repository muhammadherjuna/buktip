import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect ke rute tujuan sebelumnya atau ke Beranda
  const from = location.state?.from?.pathname || '/';

  // Validasi format email real-time
  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleLupaPassword = (e) => {
    e.preventDefault();
    toast('Fitur pemulihan sandi sedang dikembangkan');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Silakan isi email dan kata sandi');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Format email tidak benar');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      toast.success('Berhasil masuk ke akun Buktip!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Gagal masuk:', err);
      setErrorMessage('Email atau kata sandi salah. Silakan coba lagi.');
      toast.error('Email atau kata sandi salah');
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
            Masuk ke Buktip
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Lanjutkan jual beli HP bekas dengan aman
          </p>
        </div>

        {/* Pesan Error di Atas Form */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulir Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
              <button
                type="button"
                onClick={handleLupaPassword}
                className="text-[11px] font-medium text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 karakter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
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
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading || !isEmailValid}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk Akun</span>
            )}
          </button>
        </form>

        {/* Tautan ke Halaman Daftar */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span>Belum punya akun? </span>
          <Link
            to="/daftar"
            className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Daftar sekarang
          </Link>
        </div>

        {/* Teks Keamanan di Bawah */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Anda dilindungi</span>
        </div>

      </div>
    </div>
  );
}
