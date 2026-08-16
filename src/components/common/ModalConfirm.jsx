import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';

export default function ModalConfirm({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'warning', // 'warning' | 'danger' | 'teal'
  isProcessing = false
}) {
  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: 'bg-red-50 text-red-600 border-red-100',
      btn: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-600/20',
      icon: <AlertCircle className="w-6 h-6" />
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-600/20',
      icon: <AlertTriangle className="w-6 h-6" />
    },
    teal: {
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
      btn: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-teal-600/20',
      icon: <HelpCircle className="w-6 h-6" />
    }
  };

  const currentTheme = iconConfig[type] || iconConfig.warning;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={!isProcessing ? onClose : undefined}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 transition-all duration-200 transform scale-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${currentTheme.bg}`}>
            {currentTheme.icon}
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
