import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect ke rute tujuan sebelumnya atau ke beranda
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Silakan isi email dan kata sandi');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      toast.success('Berhasil masuk ke akun Buktip!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Gagal masuk:', err);
      toast.error(err.message || 'Email atau kata sandi salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
      {/* Header Form */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
          <LogIn className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Masuk ke Buktip
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Kelola iklan dan transaksi smartphone bekas Anda
        </p>
      </div>

      {/* Formulir Login */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Kata Sandi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
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

      {/* Footer Pindah ke Daftar */}
      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        Belum punya akun?{' '}
        <Link to="/daftar" className="text-teal-600 font-bold hover:underline">
          Daftar di sini
        </Link>
      </div>
    </div>
  );
}
