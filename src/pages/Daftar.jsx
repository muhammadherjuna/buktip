import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Daftar() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-sm">
        <UserPlus className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Daftar Akun
      </h1>
      <p className="text-slate-500 mt-2 text-sm max-w-md">
        Bergabung dengan komunitas jual beli smartphone terpercaya di Buktip.
      </p>
      <div className="mt-4 text-xs text-slate-500">
        Sudah memiliki akun?{' '}
        <Link to="/login" className="text-teal-600 font-semibold hover:underline">
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
