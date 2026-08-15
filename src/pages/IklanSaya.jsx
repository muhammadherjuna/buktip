import { Package } from 'lucide-react';

export default function IklanSaya() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-sm">
        <Package className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Iklan Saya
      </h1>
      <p className="text-slate-500 mt-2 text-sm max-w-md">
        Daftar status dan pengelolaan unit smartphone yang sedang Anda iklankan.
      </p>
    </div>
  );
}
