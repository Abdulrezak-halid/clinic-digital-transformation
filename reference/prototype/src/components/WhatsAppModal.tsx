import React, { useState } from 'react';
import { CLINIC_INFO } from '../data/initialData';
import { X, Send, Copy, Check, MessageSquare } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientPhone: string;
  sessionTime?: string;
  sessionDate?: string;
  remainingSessions?: number;
  condition?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  patientName,
  patientPhone,
  sessionTime = '14:30',
  sessionDate = 'Yarın',
  remainingSessions = 3,
  condition = 'Manuel Terapi',
}) => {
  const [template, setTemplate] = useState<'reminder' | 'progress' | 'arabic_reminder'>('reminder');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean phone number for WhatsApp link (Turkish numbers usually 05xx -> 905xx)
  let cleanPhone = patientPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '90' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('90') && cleanPhone.length === 10) {
    cleanPhone = '90' + cleanPhone;
  }

  const getMessageContent = () => {
    if (template === 'arabic_reminder') {
      return `مرحباً بك سيد/ة ${patientName}،\nنود تذكيركم بموعد جلسة العلاج الطبيعي واليدوي لدى الدكتور حميد غوموش (Fizyoterapist Hamit Gümüş).\n\n📅 الموعد: ${sessionDate} الساعة ${sessionTime}\n📍 العنوان: Mersin Yenişehir, Limonluk Mah., Hantaş Prestij İş Merkezi Kat:2 No:3\n\nيرجى ارتداء ملابس رياضية مريحة قبل الجلسة. دمتم بصحة وعافية!`;
    }

    if (template === 'progress') {
      return `Sayın ${patientName} Merhaba,\n\nFizyoterapist Hamit Gümüş Kliniği'ndeki ${condition} tedavi sürecinizde ${remainingSessions} seansınız kalmıştır. Ağrı skorunuzdaki belirgin iyileşmeyi klinik sistemimizden memnuniyetle takip ediyoruz.\n\nEv egzersizlerinizi aksatmamanızı rica eder, sağlıklı günler dileriz.\n\n📍 Hantaş Prestij Limonluk / Mersin\n📞 0537 970 96 45`;
    }

    return `Sayın ${patientName} Merhaba,\n\nFizyoterapist Hamit Gümüş Kliniği'nde planlanan ${condition} seansınız için randevu hatırlatmasıdır:\n\n📅 Tarih: ${sessionDate}\n⏰ Saat: ${sessionTime}\n📍 Adres: Hantaş Prestij, Limonluk Mah. 2446 Sk. Kat:2 No:3 Yenişehir/Mersin\n\nLütfen randevu saatinden 5-10 dakika önce rahat kıyafetler ile kliniğimizde olunuz. Randevu değişikliği için bu mesajı yanıtlayabilirsiniz.\n\nSağlıklı günler dileriz,\nFzt. Hamit Gümüş | 0537 970 96 45`;
  };

  const message = getMessageContent();
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Hasta İletişimi</h3>
              <p className="text-xs text-slate-500">{patientName} · {patientPhone}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Mesaj Şablonu Seçin:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplate('reminder')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  template === 'reminder'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Randevu Hatırlatması (TR)
              </button>
              <button
                type="button"
                onClick={() => setTemplate('progress')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  template === 'progress'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Seans Durumu & Egzersiz
              </button>
              <button
                type="button"
                onClick={() => setTemplate('arabic_reminder')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  template === 'arabic_reminder'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                تذكير بالعربية (AR)
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Mesaj Önizleme:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={message}
              rows={8}
              className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 resize-none focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Kapat
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp Web'de Aç ve Gönder</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
