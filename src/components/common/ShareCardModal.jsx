import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Smartphone, 
  Square, 
  Loader2, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function ShareCardModal({ isOpen, onClose, iklan }) {
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' atau '9:16'
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);

  const generateCanvasImage = useCallback(async () => {
    if (!iklan) return;
    setGenerating(true);

    try {
      const isSquare = aspectRatio === '1:1';
      const width = 1080;
      const height = isSquare ? 1080 : 1920;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Gambar Latar Belakang Hitam Gelap Premium
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // 2. Muat Foto Utama Produk HP
      const fotoUrl = iklan.foto_utama_url || `https://picsum.photos/seed/${iklan.id || 'buktip'}/800/600`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = fotoUrl;
      });

      if (img.width && img.height) {
        // Gambar foto di tengah / full bleed dengan cover fit
        const imgRatio = img.width / img.height;
        const targetRatio = width / (isSquare ? height : height * 0.85);

        let renderW, renderH, offsetX, offsetY;

        if (imgRatio > targetRatio) {
          renderH = isSquare ? height : height * 0.85;
          renderW = renderH * imgRatio;
          offsetX = (width - renderW) / 2;
          offsetY = 0;
        } else {
          renderW = width;
          renderH = renderW / imgRatio;
          offsetX = 0;
          offsetY = ((isSquare ? height : height * 0.85) - renderH) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
      }

      // 3. Tambahkan Gradasi Gelap Elegan di Bagian Bawah agar Teks Terbaca Jelas
      const gradHeight = isSquare ? height * 0.65 : height * 0.55;
      const gradient = ctx.createLinearGradient(0, height - gradHeight, 0, height);
      gradient.addColorStop(0, 'rgba(9, 13, 22, 0)');
      gradient.addColorStop(0.35, 'rgba(9, 13, 22, 0.7)');
      gradient.addColorStop(0.7, 'rgba(9, 13, 22, 0.95)');
      gradient.addColorStop(1, '#090d16');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - gradHeight, width, gradHeight);

      // 4. Tambahkan Header Atas: Logo Buktip & Lencana Terbukti Asli
      // Top Dark Vignette
      const topGrad = ctx.createLinearGradient(0, 0, 0, 220);
      topGrad.addColorStop(0, 'rgba(9, 13, 22, 0.85)');
      topGrad.addColorStop(1, 'rgba(9, 13, 22, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 220);

      // Pill Logo Buktip Kiri Atas
      ctx.save();
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.roundRect(60, 60, 260, 64, 32);
      ctx.fill();

      ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🛡️ Buktip.id', 88, 103);
      ctx.restore();

      // Badge Terbukti Asli Kanan Atas
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(width - 340, 60, 280, 64, 32);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#2dd4bf';
      ctx.fillText('✓ Foto Terbukti Asli', width - 315, 102);
      ctx.restore();

      // 5. Teks Konten Utama di Bagian Bawah
      const paddingX = 64;
      const startY = height - (isSquare ? 280 : 380);

      // Merek / Brand Tag
      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#2dd4bf';
      ctx.fillText((iklan.merek || 'SMARTPHONE').toUpperCase(), paddingX, startY);

      // Nama HP & Tipe (Besar)
      ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      const namaHp = `${iklan.merek || ''} ${iklan.tipe || ''}`.trim();
      // Potong jika terlalu panjang
      const namaHpTampil = namaHp.length > 28 ? `${namaHp.slice(0, 28)}...` : namaHp;
      ctx.fillText(namaHpTampil, paddingX, startY + 68);

      // Kapasitas & Kondisi Subtitle
      ctx.font = '400 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      const subInfo = [iklan.kapasitas, iklan.warna, `Kondisi ${iklan.kondisi || 'Baik'}`].filter(Boolean).join(' • ');
      ctx.fillText(subInfo, paddingX, startY + 118);

      // Baris Harga (Sangat Besar & Tebal Warna Teal)
      ctx.font = '900 74px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#2dd4bf';
      ctx.fillText(formatRupiah(iklan.harga), paddingX, startY + 205);

      if (iklan.harga_negosiasi) {
        ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        const hargaWidth = ctx.measureText(formatRupiah(iklan.harga)).width;
        ctx.fillText('(Nego)', paddingX + hargaWidth + 24, startY + 195);
      }

      // Footer Khusus format 9:16 (Instagram Story)
      if (!isSquare) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(paddingX, height - 120);
        ctx.lineTo(width - paddingX, height - 120);
        ctx.stroke();

        ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('📍 Lokasi COD: ' + (iklan.lokasi_detail || 'Kebumen, Jawa Tengah'), paddingX, height - 65);

        ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Cek di buktip.id', width - 240, height - 65);
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Gagal membuat share card canvas:', err);
      toast.error('Gagal membuat gambar share card');
    } finally {
      setGenerating(false);
    }
  }, [iklan, aspectRatio]);

  useEffect(() => {
    if (isOpen && iklan) {
      generateCanvasImage();
    }
  }, [isOpen, iklan, aspectRatio, generateCanvasImage]);

  if (!isOpen || !iklan) return null;

  // Unduh Gambar PNG
  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    const cleanName = `${iklan.merek || 'hp'}-${iklan.tipe || 'bekas'}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `buktip-${cleanName}-${aspectRatio === '1:1' ? 'feed' : 'story'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Gambar promosi berhasil diunduh!');
  };

  // Bagikan langsung via Web Share API
  const handleWebShare = async () => {
    if (!previewUrl) return;

    const shareUrl = `${window.location.origin}/iklan/${iklan.id}`;
    const shareText = `Dijual HP ${iklan.merek} ${iklan.tipe} (${formatRupiah(iklan.harga)}) - Foto Asli Terverifikasi di Buktip!`;

    if (navigator.canShare && navigator.share) {
      try {
        const blob = await (await fetch(previewUrl)).blob();
        const file = new File([blob], `buktip-${iklan.tipe}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Beli HP ${iklan.merek} ${iklan.tipe}`,
            text: shareText,
            url: shareUrl,
            files: [file],
          });
          toast.success('Berhasil dibagikan!');
          return;
        }
      } catch (_) {
        // Fallback jika batal atau tidak didukung
      }
    }

    // Fallback Buka WhatsApp dengan pesan dan link
    const waText = encodeURIComponent(`${shareText}\n\nLihat selengkapnya di: ${shareUrl}`);
    window.open(`https://wa.me/?text=${waText}`, '_blank');
  };

  // Salin Tautan Iklan
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/iklan/${iklan.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    toast.success('Tautan iklan disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Bagikan Gambar Promosi
              </h3>
              <p className="text-xs text-slate-500">
                Kartu grafis siap posting di Status WA & IG Story
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pilihan Rasio Format: 1:1 vs 9:16 */}
        <div className="flex items-center justify-center gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setAspectRatio('1:1')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              aspectRatio === '1:1'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1 Status WA / Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setAspectRatio('9:16')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              aspectRatio === '9:16'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16 Instagram Story</span>
          </button>
        </div>

        {/* Preview Hasil Render Gambar */}
        <div className="relative rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-200 min-h-[300px] max-h-[420px] p-2">
          {generating ? (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              <span className="text-xs font-medium">Merender kartu grafis resolusi tinggi...</span>
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview Share Card"
              className={`object-contain rounded-xl shadow-lg transition duration-300 ${
                aspectRatio === '1:1' ? 'max-h-[340px] aspect-square' : 'max-h-[390px] aspect-[9/16]'
              }`}
            />
          ) : null}
        </div>

        {/* Tombol Aksi Download & Share */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={generating || !previewUrl}
              className="py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Gambar</span>
            </button>

            <button
              type="button"
              onClick={handleWebShare}
              disabled={generating || !previewUrl}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Langsung</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tautan Berhasil Disalin!' : 'Salin Tautan Iklan'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
