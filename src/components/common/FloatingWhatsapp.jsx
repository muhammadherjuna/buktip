import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsapp() {
  const adminWaUrl = `https://wa.me/6281234567890?text=${encodeURIComponent('Halo Admin Buktip, saya butuh bantuan mengenai platform...')}`;

  return (
    <a
      href={adminWaUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Admin WhatsApp"
      title="Chat Admin WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer ring-4 ring-white/90"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white/20" />
    </a>
  );
}
