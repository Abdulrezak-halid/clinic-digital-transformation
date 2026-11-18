import React from 'react';
import { CLINIC_INFO } from '../data/initialData';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappUrl = `https://wa.me/${CLINIC_INFO.phoneClean}?text=${encodeURIComponent(
    'Merhaba Fzt. Hamit Gümüş Kliniği, bilgi ve randevu almak istiyorum.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp İletişim: 0537 970 96 45"
        className="group relative block w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none select-none"
        title="WhatsApp ile İletişime Geç (0537 970 96 45)"
      >
        {/* Clean WhatsApp Icon using user provided asset - completely free of shadows */}
        <img
          src="/assets/aistudio/whatsApp-icon_b5b3417c.png"
          alt="WhatsApp"
          className="w-full h-full object-contain select-none"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Optional Clean Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg hidden sm:block">
          WhatsApp (0537 970 96 45)
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-800" />
        </div>
      </a>
    </div>
  );
};
