import React from 'react';
import { CLINIC_INFO } from '../data/initialData';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Clock, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  Navigation, 
  Sparkles,
  Building,
  Activity
} from 'lucide-react';

interface ClinicAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicAboutModal: React.FC<ClinicAboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={CLINIC_INFO.logoUrl}
              alt={CLINIC_INFO.name}
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h2 className="text-base font-bold text-slate-900">{CLINIC_INFO.name}</h2>
              <p className="text-xs text-slate-500">{CLINIC_INFO.unitTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-800">

          {/* Hero Profile Banner with Doctor Photo & Clinic Plaque */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
            {/* Real Doctor Photo */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <img
                  src={CLINIC_INFO.doctorPhoto}
                  alt="Fizyoterapist Hamit Gümüş"
                  className="w-36 h-36 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                />
                <span className="absolute -bottom-2 bg-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs">
                  Onur Derecesi Mezun
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">Fzt. Hamit Gümüş</h3>
              <p className="text-xs text-teal-200">Uzman Fizyoterapist & Manuel Terapist</p>
              <div className="flex items-center gap-1 text-xs text-amber-300 mt-1">
                <span>⭐ 5.0 (327 Google Yorum)</span>
              </div>
            </div>

            {/* Doctor Introduction Quote */}
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold border border-teal-400/30">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>'' Sağlıklı Yaşamın Adresi ''</span>
              </div>
              <h4 className="text-lg font-bold text-white leading-snug">
                Bilimsel, Güvenli ve Kişiye Özel Yaklaşımla Ağrısız Bir Yaşam
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fizyoterapist Hamit Gümüş kliniğinde; güvenli, bilimsel ve kişiye özel yaklaşım ile sağlığınızı destekleyen profesyonel bir ortam sizi karşılıyor. Daha güçlü, daha dengeli ve ağrısız bir yaşam için doğru yerdesiniz.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <span className="text-base font-extrabold text-white font-mono block">%100</span>
                  <span className="text-[11px] text-teal-200">Uzman Dokunuşu</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <span className="text-base font-extrabold text-white font-mono block">%100</span>
                  <span className="text-[11px] text-teal-200">Hasta Memnuniyeti</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinic Plaque Showcase & Services */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                <span>Kliniğimizin Başlıca Hizmet Alanları</span>
              </h3>
              <span className="text-xs text-slate-500">12 Uzman Tedavi Çözümü</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CLINIC_INFO.services.map((srv, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 hover:bg-teal-50/40 p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 group-hover:scale-125 transition-transform" />
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">{srv.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Career Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-700" />
                <span>Eğitim ve Mesleki Yolculuk</span>
              </h3>
              <span className="text-xs text-slate-500">10+ Yıl Klinik Deneyim</span>
            </div>

            <div className="relative border-l-2 border-teal-200 ml-4 space-y-4 py-2">
              {CLINIC_INFO.educationAndCareer.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className="absolute -left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white shadow-2xs" />
                  <span className="text-[11px] font-mono font-bold text-teal-700 block">{item.year}</span>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Location & Google Maps Integration */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Klinik Konumu & Ulaşım (Mersin Yenişehir)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Address card & Working hours */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tam Açık Adres:
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed flex items-start gap-2">
                    <Building className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{CLINIC_INFO.address}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Haftalık Çalışma Saatlerimiz:</span>
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {CLINIC_INFO.workingHours.map((wh, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="font-medium text-slate-700">{wh.day}</span>
                        <span className={`font-mono font-bold ${wh.isOpen ? 'text-teal-800' : 'text-rose-600'}`}>
                          {wh.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2 text-xs">
                  <a
                    href={`tel:${CLINIC_INFO.phoneClean}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-700" />
                    <span>0 (537) 970 96 45</span>
                  </a>
                  <a
                    href={`mailto:${CLINIC_INFO.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-700" />
                    <span>{CLINIC_INFO.email}</span>
                  </a>
                </div>
              </div>

              {/* Visual Map Frame / Clinic Facade & Direction Card */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 relative flex flex-col min-h-[260px]">
                {/* 3D Clinic plaque picture as header backdrop */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={CLINIC_INFO.clinicPlaque}
                    alt="Mersin Fizik Tedavi Kliniği"
                    className="w-full h-full object-cover object-center opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">Klinik Girişi</span>
                    <h4 className="text-sm font-bold text-white">Hantaş Prestij İş Merkezi 2. Kat No: 3</h4>
                  </div>
                </div>

                {/* Map Directions Box */}
                <div className="p-4 bg-slate-950 text-white flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Limonluk Mahallesi 2446. Sokak üzerinde, Hantaş Prestij binasında 2. katta bulunmaktadır. Araç park alanı mevcuttur.
                  </p>

                  <a
                    href={CLINIC_INFO.mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Google Haritalarda Canlı Yol Tarifi Başlat</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
