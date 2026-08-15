import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-sm">
        <LogIn className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Masuk Akun
      </h1>
      <p className="text-slate-500 mt-2 text-sm max-w-md">
        Silakan masuk ke akun Buktip Anda untuk mengelola iklan dan transaksi.
      </p>
      <div className="mt-4 text-xs text-slate-500">
        Belum punya akun?{' '}
        <Link to="/daftar" className="text-teal-600 font-semibold hover:underline">
          Daftar di sini
        </Link>
      </div>
    </div>
  );
}
