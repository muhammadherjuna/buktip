import { Inbox } from 'lucide-react';
import IklanCard from './IklanCard';

export default function IklanGrid({ iklanList = [], isLoading = false }) {
  // Tampilan Skeleton saat sedang memuat data
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col animate-pulse"
          >
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-6 bg-slate-200 rounded w-2/5 mt-2" />
              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Tampilan saat tidak ada data iklan
  if (!iklanList || iklanList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          Belum ada iklan saat ini
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Iklan smartphone bekas yang telah terverifikasi akan muncul di sini.
        </p>
      </div>
    );
  }

  // Tampilan Grid Daftar Iklan
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {iklanList.map((iklan) => (
        <IklanCard key={iklan.id} iklan={iklan} />
      ))}
    </div>
  );
}
