import React, { useState } from 'react';
import { CLINIC_INFO } from '../data/initialData';
import { 
  Presentation, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Smartphone, 
  FileSpreadsheet, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SystemPitchModalProps {
  onSwitchToLiveDemo: () => void;
}

export const SystemPitchModal: React.FC<SystemPitchModalProps> = ({ onSwitchToLiveDemo }) => {
  const [patientCountPerMonth, setPatientCountPerMonth] = useState(25);
  const [avgPackagePrice, setAvgPackagePrice] = useState(15000);

  // ROI calculations
  // Preventing 8% forgotten/untracked session packages:
  const savedLostSessions = Math.round(patientCountPerMonth * 0.08 * avgPackagePrice);
  // Reducing no-shows by 30% through instant WhatsApp reminders:
  const noShowRecovery = Math.round(patientCountPerMonth * 0.12 * (avgPackagePrice / 10) * 4);
  const totalMonthlyGain = savedLostSessions + noShowRecovery;
  const annualGain = totalMonthlyGain * 12;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Hero Pitch Banner */}
      <div className="bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold mb-4 border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Fizyoterapist Hamit Gümüş Kliniği İçin Özel Geliştirilen Sistem Prototipi</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Kağıt Defterlere Son: Mersin Fizik Tedavi Kliniğiniz İçin Akıllı Dijital Yönetim
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-teal-100 leading-relaxed">
              Hantaş Prestij'deki kliniğinizde hastalarınızın seans haklarını, anatomik ağrı haritasını (Bel, Boyun, Çene/TMJ), WhatsApp hatırlatmalarını ve gelir-gider kasasını tek bir profesyonel panelden yönetin.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onSwitchToLiveDemo}
                className="px-5 py-2.5 rounded-xl bg-white text-teal-950 font-bold text-xs shadow-md hover:bg-teal-50 transition-colors inline-flex items-center gap-2"
              >
                <span>Canlı Sistemi Test Edin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={CLINIC_INFO.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-200 hover:text-white flex items-center gap-1.5 transition-colors py-2 px-3 rounded-lg bg-white/10"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-300" />
                <span>Hantaş Prestij Kat:2 No:3, Yenişehir/Mersin</span>
              </a>
            </div>
          </div>

          {/* Doctor Photo Showcase */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
            <img
              src={CLINIC_INFO.doctorPhoto}
              alt="Fzt. Hamit Gümüş"
              className="w-28 h-28 rounded-2xl object-cover border-2 border-white/50 shadow-lg"
            />
            <h4 className="mt-2.5 text-sm font-bold text-white">Fzt. Hamit Gümüş</h4>
            <p className="text-[11px] text-teal-200">10+ Yıl Manuel Terapi Deneyimi</p>
            <span className="mt-1 text-[10px] text-amber-300 font-semibold bg-white/10 px-2 py-0.5 rounded-full">
              ⭐ 5.0 (327 Google Yorum)
            </span>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Comparison: Kağıt vs Dijital Sistem */}
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">
          Neden Değişim Şart? Kağıt Defter vs. Özel Hamit Gümüş Sistemi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Traditional Way */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wide">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Geleneksel / Kağıt Üzerinde Takip (Mevcut Riskler)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Seans Kaçakları:</strong> Hastanın kaçıncı seansta olduğu karışır; 10 seanslık pakette 1-2 seans bedavaya gider veya unutulur.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Boş Kalan Sedyeler:</strong> Randevusunu unutan hastalar yüzünden gün içinde sedyeler 1 saat boş kalır ve ciro kaybı oluşur.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Dağınık Giderler:</strong> Hantaş Prestij kirası, elektrik, steril iğneler ve bant giderleri ay sonunda tam net kârı göstermez.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Güven ve Prestij:</strong> Hasta ağrısının seans seans nasıl düştüğünü görsel olarak göremez, kağıt notlar kaybolabilir.</span>
              </li>
            </ul>
          </div>

          {/* New Tailored System */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Fizyoterapist Hamit Gümüş Özel Sistemi (Yeni Avantajlar)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Hatasız Paket Takibi:</strong> 10/10 seans sayacı, hastanın kaçıncı seansta olduğu ve kalan hakkı tek ekranda net görülür.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Otomatik WhatsApp Hatırlatması:</strong> 1 tıkla Türkçe veya Arapça nazik randevu mesajı ile no-show oranı sıfırlanır.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Anatomik Ağrı Haritası:</strong> Çene, Bel, Boyun, Omuz ve Diz lezyonları görsel mankende kaydedilir ve VAS skor takibi yapılır.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Mali Disiplin & Excel Rapor:</strong> Gelirler ve klinik giderleri otomatik hesaplanır, muhasebeciye tek tıkla Excel gider.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ROI & Financial Impact Calculator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-700" />
            <span>Klinik Finansal Getiri (ROI) Simülasyonu</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bu sistemin seans kaçaklarını önleyerek ve randevu devamlılığını artırarak Hamit Bey'in kliniğine kazandıracağı tahmini tutar:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Aylık Ortalama Hasta Sayısı:</span>
                <span className="font-mono text-teal-800 font-bold">{patientCountPerMonth} Hasta / Ay</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={patientCountPerMonth}
                onChange={(e) => setPatientCountPerMonth(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Ortalama Seans Paketi Ücreti:</span>
                <span className="font-mono text-teal-800 font-bold">{avgPackagePrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              <input
                type="range"
                min="8000"
                max="25000"
                step="1000"
                value={avgPackagePrice}
                onChange={(e) => setAvgPackagePrice(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Results calculation */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 space-y-3">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wide block">
              Tahmini Kurtarılan Ekstra Klinik Cirosu:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-teal-900 tabular-nums">
                +{totalMonthlyGain.toLocaleString('tr-TR')} ₺
              </span>
              <span className="text-xs font-semibold text-teal-700">/ Aylık Ekstra</span>
            </div>

            <div className="pt-2 border-t border-teal-200/60 text-xs text-teal-800 space-y-1">
              <div className="flex justify-between">
                <span>Yıllık Tahmini Ekstra Kazanç:</span>
                <strong className="font-mono font-bold text-teal-950">+{annualGain.toLocaleString('tr-TR')} ₺</strong>
              </div>
              <div className="text-[11px] text-teal-700 mt-1">
                * Unutulan paket seansları önleme + WhatsApp hatırlatmasıyla kurtarılan randevular baz alınmıştır.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hamit Bey'e Sunarken Söyleyebileceğiniz 4 Cümle (Elevator Pitch) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Award className="w-4 h-4 text-teal-700" />
          <span>Fzt. Hamit Bey ile Görüşürken Öne Çıkarabileceğiniz Anahtar Cümleler:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-teal-800 block mb-1">1. "Mersin'deki prestijinizi teknolojiyle birleştirin"</span>
            <p className="text-slate-600">Google'da 327 yorum ve 5 yıldızlı kliniğinizin hizmet kalitesini, hastalarınızın karşısına çıkan kurumsal dijital seans kartı ile taçlandırıyoruz.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-teal-800 block mb-1">2. "Paket seans kaçaklarına sıfır tolerans"</span>
            <p className="text-slate-600">Hangi hastanın kaçıncı seansta olduğu, kaç seans hakkı kaldığı ve ödemesi tek bakışta ekranda; kağıt karışıklığı yok.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-teal-800 block mb-1">3. "Tek tıkla Türkçe ve Arapça WhatsApp"</span>
            <p className="text-slate-600">Yenişehir'deki yerli ve yabancı hastalarınıza tek tıkla nazik randevu hatırlatması gidiyor; sedyeleriniz asla boş kalmıyor.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-teal-800 block mb-1">4. "Hantaş Prestij kliniğinizin kasası cebinizde"</span>
            <p className="text-slate-600">Kira, elektrik, iğne ve bant masraflarını girdiğiniz anda net aylık kârınız hesaplanır, istediğiniz an Excel'e dökülür.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
