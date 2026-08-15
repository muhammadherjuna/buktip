import { PlusCircle } from 'lucide-react';

export default function PasangIklan() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 shadow-sm">
        <PlusCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Pasang Iklan Baru
      </h1>
      <p className="text-slate-500 mt-2 text-sm max-w-md">
        Formulir penjualan unit smartphone dengan panduan pengisian bukti kondisi.
      </p>
    </div>
  );
}
