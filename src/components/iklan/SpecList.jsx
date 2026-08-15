import { formatRupiah } from '../../lib/utils';

export default function SpecList({ iklan }) {
  if (!iklan) return null;

  // Daftar baris spesifikasi
  const spesifikasi = [
    { label: 'Merek', value: iklan.merek },
    { label: 'Tipe', value: iklan.tipe },
    { label: 'Kapasitas', value: iklan.kapasitas || '-' },
    { label: 'Warna', value: iklan.warna || '-' },
    { 
      label: 'Kondisi', 
      value: iklan.kondisi, 
      isBadge: true,
      badgeStyle: getKondisiBadge(iklan.kondisi)
    },
    { 
      label: 'Harga', 
      value: formatRupiah(iklan.harga),
      isHighlight: true 
    },
    { 
      label: 'Nego', 
      value: iklan.harga_negosiasi ? 'Bisa Nego' : 'Harga Pas (Non-Nego)' 
    },
    { label: 'Lokasi', value: iklan.lokasi_detail || '-' },
    { label: 'Kelengkapan', value: iklan.kelengkapan || 'Unit only' },
    { 
      label: 'Kesehatan Baterai', 
      value: iklan.kesehatan_baterai ? `${iklan.kesehatan_baterai}%` : '-' 
    },
    { label: 'IMEI', value: iklan.imei || '-' },
    { 
      label: 'Kode Verifikasi', 
      value: iklan.kode_verifikasi, 
      isMono: true 
    },
  ];

  function getKondisiBadge(kondisi) {
    switch (kondisi) {
      case 'Sangat Baik':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Baik':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sedang':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Butuh Servis':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900 text-base sm:text-lg pb-3 border-b border-slate-100">
        Spesifikasi Detail
      </h3>

      <div className="divide-y divide-slate-100">
        {spesifikasi.map((item, idx) => (
          <div key={idx} className="py-2.5 grid grid-cols-12 gap-3 text-sm items-center">
            <span className="col-span-5 sm:col-span-4 text-slate-500 font-medium">
              {item.label}
            </span>
            <div className="col-span-7 sm:col-span-8 text-slate-900 font-semibold">
              {item.isBadge ? (
                <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${item.badgeStyle}`}>
                  {item.value}
                </span>
              ) : item.isHighlight ? (
                <span className="text-orange-600 font-bold">
                  {item.value}
                </span>
              ) : item.isMono ? (
                <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">
                  {item.value}
                </span>
              ) : (
                <div>
                  <span>{item.value}</span>
                  {item.label === 'IMEI' && item.value !== '-' && (
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5 leading-snug">
                      Catatan: IMEI ditampilkan untuk verifikasi. Silakan cocokkan saat bertemu penjual.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
