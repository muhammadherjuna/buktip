import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  Edit3, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Archive
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatTanggal } from '../lib/utils';
import ModalConfirm from '../components/common/ModalConfirm';
import toast from 'react-hot-toast';

export default function IklanSaya() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [iklanList, setIklanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Modal Konfirmasi
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'warning',
    actionType: null, // 'status' | 'delete'
    targetId: null,
    nextStatus: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch daftar iklan pengguna
  const fetchIklanSaya = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('iklan')
        .select('*')
        .eq('penjual_id', user.id)
        .order('dibuat_pada', { ascending: false });

      if (fetchError) throw fetchError;

      // Otomatis tandai diarsipkan jika sudah lebih dari 90 hari
      const sekerang = new Date();
      const listTerproses = (data || []).map((item) => {
        const tglBuat = new Date(item.dibuat_pada || Date.now());
        const selisihHari = Math.floor((sekerang - tglBuat) / (1000 * 60 * 60 * 24));
        if (selisihHari > 90 && item.status === 'aktif') {
          // Asinkron update status di DB
          supabase.from('iklan').update({ status: 'diarsipkan' }).eq('id', item.id);
          return { ...item, status: 'diarsipkan' };
        }
        return item;
      });

      setIklanList(listTerproses);
    } catch (err) {
      console.error('Gagal memuat iklan saya:', err);
      setError(err.message || 'Gagal memuat daftar iklan Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIklanSaya();
  }, [user]);

  // Handler Buka Modal Tandai Status (Terjual / Tersedia)
  const handleOpenStatusModal = (iklan) => {
    const isTerjual = iklan.status === 'terjual';
    const nextStatus = isTerjual ? 'aktif' : 'terjual';

    setModalConfig({
      isOpen: true,
      title: isTerjual ? 'Tandai Tersedia Kembali?' : 'Tandai Iklan Terjual?',
      message: isTerjual 
        ? 'Iklan akan ditandai aktif kembali dan ditampilkan kepada calon pembeli di daftar publik. Lanjutkan?' 
        : 'Iklan akan ditandai terjual dan tidak lagi ditampilkan kepada calon pembeli di daftar publik. Lanjutkan?',
      confirmText: isTerjual ? 'Ya, Tandai Tersedia' : 'Ya, Tandai Terjual',
      type: 'teal',
      actionType: 'status',
      targetId: iklan.id,
      nextStatus: nextStatus,
    });
  };

  // Handler Buka Modal Hapus Iklan
  const handleOpenDeleteModal = (iklan) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Iklan Ini?',
      message: `Yakin ingin menghapus iklan "${iklan.merek} ${iklan.tipe}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Iklan',
      type: 'danger',
      actionType: 'delete',
      targetId: iklan.id,
      nextStatus: null,
    });
  };

  // Eksekusi Tindakan Modal (Status / Delete)
  const handleConfirmModalAction = async () => {
    if (!modalConfig.targetId) return;

    try {
      setIsProcessing(true);

      if (modalConfig.actionType === 'status') {
        const { error: errUpdate } = await supabase
          .from('iklan')
          .update({ status: modalConfig.nextStatus })
          .eq('id', modalConfig.targetId)
          .eq('penjual_id', user.id);

        if (errUpdate) throw errUpdate;

        toast.success(
          modalConfig.nextStatus === 'terjual' 
            ? 'Iklan berhasil ditandai Terjual' 
            : 'Iklan berhasil diaktifkan kembali'
        );

        setIklanList((prev) =>
          prev.map((item) =>
            item.id === modalConfig.targetId ? { ...item, status: modalConfig.nextStatus } : item
          )
        );
      } else if (modalConfig.actionType === 'delete') {
        const { error: errDelete } = await supabase
          .from('iklan')
          .delete()
          .eq('id', modalConfig.targetId)
          .eq('penjual_id', user.id);

        if (errDelete) throw errDelete;

        toast.success('Iklan berhasil dihapus');
        setIklanList((prev) => prev.filter((item) => item.id !== modalConfig.targetId));
      }

    } catch (err) {
      console.error('Gagal memproses aksi iklan:', err);
      toast.error(err.message || 'Gagal memproses tindakan');
    } finally {
      setIsProcessing(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'terjual':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Sudah Terjual
          </span>
        );
      case 'diarsipkan':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <Archive className="w-3 h-3 text-slate-400" />
            Diarsipkan
          </span>
        );
      case 'aktif':
      case 'tersedia':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Aktif
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      
      {/* ================= BAGIAN ATAS: HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-7 h-7 text-teal-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Iklan Saya
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola iklan smartphone yang Anda pasang di Buktip
          </p>
        </div>

        <Link
          to="/pasang-iklan"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition cursor-pointer self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Pasang Iklan Baru</span>
        </Link>
      </div>

      {/* Catatan Info Auto-Arsip 90 Hari */}
      <div className="bg-slate-100 border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-slate-600">
        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Iklan lama (lebih dari 90 hari) otomatis diarsipkan agar tidak menumpuk.</span>
      </div>

      {/* ================= STATE LOADING ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium">Memuat iklan Anda...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            type="button"
            onClick={fetchIklanSaya}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      ) : iklanList.length === 0 ? (
        /* ================= JIKA BELUM ADA IKLAN ================= */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Anda belum memasang iklan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mulai jual smartphone bekas Anda dengan foto bukti kepemilikan terverifikasi.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/pasang-iklan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pasang Iklan Sekarang</span>
            </Link>
          </div>
        </div>
      ) : (
        /* ================= JIKA SUDAH ADA IKLAN ================= */
        <div className="space-y-4">
          {iklanList.map((iklan) => {
            const fotoUtama = iklan.foto_utama_url || `https://picsum.photos/seed/${iklan.id}/200/200`;
            const isTerjual = iklan.status === 'terjual';

            return (
              <div
                key={iklan.id}
                className="max-w-[600px] w-full mx-auto bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                {/* Bagian Atas Kartu (Foto + Detail + Badge Status) */}
                <div className="flex gap-4 items-start">
                  {/* Foto Utama Iklan (100x100px) */}
                  <div className="relative w-[100px] h-[100px] shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={fotoUtama}
                      alt={`${iklan.merek} ${iklan.tipe}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/fallback-${iklan.id}/200/200`;
                      }}
                    />
                  </div>

                  {/* Informasi Detail HP */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/iklan/${iklan.id}`}
                        className="font-bold text-slate-900 text-base sm:text-lg hover:text-teal-600 transition truncate"
                      >
                        {iklan.merek} {iklan.tipe}
                      </Link>
                      {/* Badge Status */}
                      <div className="shrink-0">
                        {renderStatusBadge(iklan.status)}
                      </div>
                    </div>

                    <div className="text-base sm:text-lg font-black text-teal-600">
                      {formatRupiah(iklan.harga)}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{iklan.lokasi_detail || 'Kebumen'}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                      <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {iklan.kode_verifikasi || 'KB-XXXX'}
                      </span>
                      <span>•</span>
                      <span>{formatTanggal(iklan.dibuat_pada)}</span>
                    </div>
                  </div>
                </div>

                {/* Bagian Bawah Kartu: 3 Tombol Aksi Lebar Penuh Sejajar */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  {/* 1. Tombol Edit */}
                  <Link
                    to={`/pasang-iklan?edit=${iklan.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </Link>

                  {/* 2. Tombol Tandai Terjual / Tersedia */}
                  <button
                    type="button"
                    onClick={() => handleOpenStatusModal(iklan)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 font-semibold text-xs rounded-xl transition cursor-pointer ${
                      isTerjual
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isTerjual ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tandai Tersedia</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tandai Terjual</span>
                      </>
                    )}
                  </button>

                  {/* 3. Tombol Hapus */}
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(iklan)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl transition cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Konfirmasi Reusable */}
      <ModalConfirm
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmModalAction}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
        isProcessing={isProcessing}
      />

    </div>
  );
}
