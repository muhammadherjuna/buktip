import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsapp() {
  const adminWaUrl = `https://wa.me/6281234567890?text=${encodeURIComponent('Halo Admin Buktip, saya butuh bantuan mengenai platform...')}`;

  return (
    <a
      href={adminWaUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Admin WhatsApp"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:p-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer ring-4 ring-white/80"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white/20" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pr-1">
        Bantuan Admin
      </span>
    </a>
  );
}
