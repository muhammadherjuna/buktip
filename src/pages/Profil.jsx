import { User } from 'lucide-react';

export default function Profil() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-sm">
        <User className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Profil Saya
      </h1>
      <p className="text-slate-500 mt-2 text-sm max-w-md">
        Pengaturan informasi akun, verifikasi identitas, dan preferensi pengguna.
      </p>
    </div>
  );
}
