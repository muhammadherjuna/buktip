import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FotoBukti({ fotoUrl, kodeVerifikasi }) {
  const fallbackFoto = `https://picsum.photos/seed/bukti-${kodeVerifikasi || 'verifikasi'}/600/450`;
  const gambarUrl = fotoUrl || fallbackFoto;

  return (
    <div className="bg-emerald-50/70 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header Bagian Bukti */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Bukti Kepemilikan Terverifikasi
            </h3>
            <p className="text-xs text-emerald-700 font-medium">
              Keunggulan Utama Buktip
            </p>
          </div>
        </div>

        {/* Kode Verifikasi */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-emerald-300 shadow-xs self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Kode:</span>
          <span className="text-sm font-mono font-extrabold text-emerald-800 tracking-wider">
            {kodeVerifikasi || 'KB-XXX'}
          </span>
        </div>
      </div>

      {/* Foto Bukti & Penjelasan */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Gambar Bukti */}
        <div className="md:col-span-6 relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-emerald-200 shadow-sm">
          <img
            src={gambarUrl}
            alt={`Bukti Kepemilikan ${kodeVerifikasi}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = fallbackFoto;
            }}
          />
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-mono">
            Kode: {kodeVerifikasi}
          </div>
        </div>

        {/* Keterangan Jaminan */}
        <div className="md:col-span-6 space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            Penjual telah memfoto HP bersama kode unik <strong className="font-mono text-emerald-800">{kodeVerifikasi}</strong>, membuktikan barang benar ada dan miliknya saat ini.
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-2 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Bukan foto curian dari internet atau media sosial</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Unit fisik diverifikasi ada di tangan penjual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
